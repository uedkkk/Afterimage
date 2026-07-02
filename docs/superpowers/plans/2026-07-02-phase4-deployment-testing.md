# Phase 4: Docker Deployment + E2E Testing Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add Docker deployment support (multi-stage Dockerfile, docker-compose, entrypoint script) and Playwright E2E tests covering critical user flows for both public and admin pages.

**Architecture:** Multi-stage Docker build with `output: "standalone"` for minimal image. Entrypoint script runs Prisma migrations + seed before starting the standalone server. Playwright tests use a dedicated test database with seeded fixtures, auto-starting the dev server via `webServer` config.

**Tech Stack:** Docker, Node.js 22, Next.js 15 standalone, Prisma 7, Playwright, Vitest (existing)

## Global Constraints

- Next.js config currently at `next.config.ts` — must add `output: "standalone"`
- Native modules: `better-sqlite3` and `sharp` need build tools (python3, make, g++) in builder stage
- Prisma 7 uses `prisma-client` generator with output at `lib/generated/prisma` — must be present at build time
- `prisma.config.ts` is TypeScript — Prisma CLI has built-in TS support, no extra tooling needed
- `DATABASE_URL` is relative (`file:./data/afterimage.db`) — resolves against CWD (`/app` in container)
- `JWT_SECRET` is read at module load time — must be in container env before first request
- Login cookie is `secure` when `NODE_ENV=production` — Docker behind HTTP needs TLS or `NODE_ENV != production`
- `process.cwd()` is used for upload paths — resolves to `/app` in container
- Existing test fixture: `tests/fixtures/test-image.jpg` (800x600 JPEG)
- `vitest.config.ts` has `fileParallelism: false` — keep this
- All existing 42 tests must continue passing
- Playwright is NOT installed — must add `@playwright/test` as devDependency
- `package-lock.json` present — use `npm ci` in Docker

---

## File Structure

```
Dockerfile                         # Multi-stage: deps → builder → runner
docker-compose.yml                 # One-click deploy with volumes + env
.dockerignore                      # Exclude build artifacts from context
docker-entrypoint.sh               # migrate deploy + seed + start server
e2e/
├── setup.ts                       # Global setup: fresh DB + seed test data
├── helpers.ts                     # Login helper, common navigation
├── public.spec.ts                 # Public page E2E tests
└── admin.spec.ts                  # Admin flow E2E tests
playwright.config.ts               # Playwright config with webServer
```

---

### Task 1: Docker Configuration

**Files:**
- Modify: `next.config.ts` (add `output: "standalone"`)
- Create: `Dockerfile`
- Create: `.dockerignore`
- Create: `docker-compose.yml`
- Create: `docker-entrypoint.sh`

**Interfaces:**
- Consumes: existing `package.json`, `prisma/` directory, `next.config.ts`
- Produces: Docker image that runs migrations + seed + standalone server

- [ ] **Step 1: Add `output: "standalone"` to next.config.ts**

Add `output: "standalone"` to the Next.js config object. The full config should look like:

```typescript
const nextConfig: NextConfig = {
  output: "standalone",
  images: {
    formats: ["image/avif", "image/webp"],
    deviceSizes: [640, 750, 1080, 1920, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },
  experimental: {
    serverActions: {
      bodySizeLimit: "50mb",
    },
  },
};
```

- [ ] **Step 2: Create .dockerignore**

```
node_modules
.next
.git
data
tests
e2e
docs
.superpowers
mockups
playwright-report
test-results
.env
.env.local
```

- [ ] **Step 3: Create Dockerfile**

Multi-stage build with 3 stages: deps (build tools + npm ci), builder (prisma generate + next build), runner (minimal runtime + prisma CLI for migrations).

```dockerfile
# Stage 1: Install dependencies (needs build tools for native modules)
FROM node:22-bookworm-slim AS deps
RUN apt-get update && apt-get install -y --no-install-recommends \
    python3 make g++ libc6-dev \
    && rm -rf /var/lib/apt/lists/*
WORKDIR /app
COPY package*.json ./
COPY prisma ./prisma
COPY prisma.config.ts ./
RUN npm ci

# Stage 2: Build the application
FROM node:22-bookworm-slim AS builder
RUN apt-get update && apt-get install -y --no-install-recommends \
    python3 make g++ libc6-dev \
    && rm -rf /var/lib/apt/lists/*
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
RUN npx prisma generate
RUN npm run build

# Stage 3: Minimal runtime
FROM node:22-bookworm-slim AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

# Install prisma CLI and tsx for migrations and seeding at runtime
RUN npm install --no-save prisma@^7.8.0 tsx@^4.22.4

# Copy standalone server output (includes minimal node_modules)
COPY --from=builder /app/.next/standalone ./
# Copy static assets
COPY --from=builder /app/.next/static ./.next/static
# Copy public directory (includes uploads/.gitkeep files)
COPY --from=builder /app/public ./public
# Copy Prisma files for migrations
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/prisma.config.ts ./
# Copy generated Prisma client
COPY --from=builder /app/lib/generated ./lib/generated
# Copy entrypoint script
COPY docker-entrypoint.sh ./
RUN chmod +x docker-entrypoint.sh

# Create directories for persistent data
RUN mkdir -p /app/data /app/public/uploads/originals /app/public/uploads/thumbnails /app/public/uploads/optimized

EXPOSE 3000

CMD ["./docker-entrypoint.sh"]
```

- [ ] **Step 4: Create docker-entrypoint.sh**

```bash
#!/bin/sh
set -e

echo "Running database migrations..."
npx prisma migrate deploy

echo "Seeding database..."
npx prisma db seed

echo "Starting Afterimage server..."
node server.js
```

- [ ] **Step 5: Create docker-compose.yml**

```yaml
services:
  afterimage:
    build: .
    ports:
      - "3000:3000"
    volumes:
      - afterimage-data:/app/data
      - afterimage-uploads:/app/public/uploads
      # Uncomment for LAN file access:
      # - /mnt/nas/photos:/mnt/nas:ro
    env_file: .env
    environment:
      - NODE_ENV=production
    restart: unless-stopped

volumes:
  afterimage-data:
  afterimage-uploads:
```

- [ ] **Step 6: Verify build works**

Run: `npm run build`
Expected: Build succeeds with standalone output at `.next/standalone/`

- [ ] **Step 7: Verify existing tests still pass**

Run: `npm test`
Expected: 42/42 passing

- [ ] **Step 8: Commit**

```bash
git add next.config.ts Dockerfile .dockerignore docker-compose.yml docker-entrypoint.sh
git commit -m "feat: add Docker deployment with multi-stage build and entrypoint"
```

---

### Task 2: Playwright Setup and Test Infrastructure

**Files:**
- Create: `playwright.config.ts`
- Create: `e2e/setup.ts`
- Create: `e2e/helpers.ts`
- Modify: `package.json` (add `@playwright/test` devDependency, `test:e2e` script)

**Interfaces:**
- Consumes: existing `prisma/seed.ts`, `lib/db/queries.ts`, `lib/image/process.ts`
- Produces: Playwright config with auto-starting dev server, test database setup, login helper

- [ ] **Step 1: Install Playwright**

Run:
```bash
npm install --save-dev @playwright/test
npx playwright install --with-deps chromium
```

- [ ] **Step 2: Add test:e2e script to package.json**

Add to `scripts`:
```json
"test:e2e": "playwright test"
```

- [ ] **Step 3: Create playwright.config.ts**

```typescript
import { defineConfig, devices } from "@playwright/test";

const TEST_DB_PATH = "file:./data/test-e2e.db";
const TEST_ENV = {
  DATABASE_URL: TEST_DB_PATH,
  JWT_SECRET: "e2e-test-secret-not-for-production",
  ADMIN_USERNAME: "admin",
  ADMIN_PASSWORD: "admin123",
};

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1,
  reporter: "html",
  globalSetup: "./e2e/setup.ts",
  use: {
    baseURL: "http://localhost:3001",
    trace: "on-first-retry",
    screenshot: "only-on-failure",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  webServer: {
    command: "npm run dev",
    port: 3001,
    timeout: 60_000,
    reuseExistingServer: !process.env.CI,
    env: {
      ...TEST_ENV,
      PORT: "3001",
    },
  },
});
```

- [ ] **Step 4: Create e2e/setup.ts**

Global setup that prepares a fresh test database with seed data.

```typescript
import { execSync } from "child_process";
import { rmSync, mkdirSync, copyFileSync, existsSync } from "fs";
import path from "path";
import { db } from "../lib/db";
import { createCategory, createAlbum, createPhoto, createStory } from "../lib/db/queries";
import { processImage } from "../lib/image/process";

const TEST_DB = path.join(process.cwd(), "data", "test-e2e.db");

export default async function globalSetup() {
  // Delete old test database
  if (existsSync(TEST_DB)) {
    rmSync(TEST_DB, { force: true });
  }
  // Also remove WAL/SHM files
  rmSync(TEST_DB + "-wal", { force: true });
  rmSync(TEST_DB + "-shm", { force: true });

  // Run migrations
  execSync("npx prisma migrate deploy", {
    stdio: "pipe",
    env: {
      ...process.env,
      DATABASE_URL: "file:./data/test-e2e.db",
    },
  });

  // Run seed (creates admin user + settings)
  execSync("npx prisma db seed", {
    stdio: "pipe",
    env: {
      ...process.env,
      DATABASE_URL: "file:./data/test-e2e.db",
      ADMIN_USERNAME: "admin",
      ADMIN_PASSWORD: "admin123",
    },
  });

  // Create test data: category, album, photos, story
  const category = await createCategory("测试分类", "test-category");

  const album = await createAlbum({
    title: "测试相册",
    slug: "test-album",
    description: "用于E2E测试的相册",
    categoryId: category.id,
    published: true,
  });

  // Process test image and create photo records
  const testImage = path.join(process.cwd(), "tests", "fixtures", "test-image.jpg");
  const uploadsDir = path.join(process.cwd(), "public", "uploads");
  const photo1 = await processImage(testImage, uploadsDir, "e2e-photo-1");
  const webThumb = photo1.thumbPath.replace("public", "");
  const webOptimized = photo1.optimizedPath.replace("public", "");

  const photo = await createPhoto({
    filename: "test-image.jpg",
    filePath: webOptimized,
    width: photo1.width,
    height: photo1.height,
    fileSize: photo1.fileSize,
    mimeType: photo1.mimeType,
    thumbPath: webThumb,
    exif: photo1.exif,
    albumId: album.id,
    title: "测试照片",
    tags: ["测试", "风景"],
  });

  // Create a story
  await createStory({
    title: "测试故事",
    slug: "test-story",
    excerpt: "这是一个测试故事的摘要。",
    content: "## 测试故事\n\n这是测试故事的正文内容。",
    published: true,
  });

  await db.$disconnect();
}
```

- [ ] **Step 5: Create e2e/helpers.ts**

```typescript
import { Page, expect } from "@playwright/test";

export async function login(page: Page) {
  await page.goto("/admin/login");
  await page.fill('input[type="text"]', "admin");
  await page.fill('input[type="password"]', "admin123");
  await page.click('button[type="submit"]');
  await page.waitForURL("/admin");
}

export async function expectToBeOnAdmin(page: Page) {
  expect(page.url()).toContain("/admin");
  expect(page.url()).not.toContain("/login");
}
```

- [ ] **Step 6: Verify Playwright installs and config loads**

Run: `npx playwright test --list`
Expected: No errors (may show 0 tests since none created yet)

- [ ] **Step 7: Verify existing tests still pass**

Run: `npm test`
Expected: 42/42 passing

- [ ] **Step 8: Commit**

```bash
git add playwright.config.ts e2e/ package.json package-lock.json
git commit -m "feat: add Playwright E2E test infrastructure with test database setup"
```

---

### Task 3: Public Page E2E Tests

**Files:**
- Create: `e2e/public.spec.ts`

**Interfaces:**
- Consumes: Playwright config, test database from setup, helpers
- Produces: E2E tests covering all public pages

- [ ] **Step 1: Create public page E2E tests**

```typescript
import { test, expect } from "@playwright/test";

test.describe("Public pages", () => {
  test("homepage loads and shows content", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("body")).toBeVisible();
    // The page should have some text content (hero text)
    const bodyText = await page.locator("body").textContent();
    expect(bodyText?.length).toBeGreaterThan(0);
  });

  test("navigation links work", async ({ page }) => {
    await page.goto("/");
    // Try clicking on stories nav link if it exists
    const storiesLink = page.locator('a[href*="stories"]').first();
    if (await storiesLink.isVisible()) {
      await storiesLink.click();
      await page.waitForLoadState("networkidle");
      expect(page.url()).toContain("/stories");
    }
  });

  test("album detail page loads", async ({ page }) => {
    await page.goto("/album/test-album");
    await expect(page.locator("body")).toBeVisible();
    const bodyText = await page.locator("body").textContent();
    expect(bodyText).toContain("测试相册");
  });

  test("photo detail page loads", async ({ page }) => {
    // Go to album first to find photo link
    await page.goto("/album/test-album");
    await page.waitForLoadState("networkidle");
    // The page should render without error
    await expect(page.locator("body")).toBeVisible();
  });

  test("stories list page loads", async ({ page }) => {
    await page.goto("/stories");
    await expect(page.locator("body")).toBeVisible();
    const bodyText = await page.locator("body").textContent();
    expect(bodyText).toContain("测试故事");
  });

  test("story detail page loads", async ({ page }) => {
    await page.goto("/stories/test-story");
    await expect(page.locator("body")).toBeVisible();
    const bodyText = await page.locator("body").textContent();
    expect(bodyText).toContain("测试故事");
  });

  test("about page loads", async ({ page }) => {
    await page.goto("/about");
    await expect(page.locator("body")).toBeVisible();
  });

  test("search page loads", async ({ page }) => {
    await page.goto("/search");
    await expect(page.locator("body")).toBeVisible();
  });

  test("search returns results", async ({ page }) => {
    await page.goto("/search?q=测试");
    await page.waitForLoadState("networkidle");
    await expect(page.locator("body")).toBeVisible();
  });

  test("category page loads", async ({ page }) => {
    await page.goto("/category/test-category");
    await expect(page.locator("body")).toBeVisible();
    const bodyText = await page.locator("body").textContent();
    expect(bodyText).toContain("测试分类");
  });
});
```

- [ ] **Step 2: Run E2E tests**

Run: `npx playwright test e2e/public.spec.ts`
Expected: All public page tests pass

- [ ] **Step 3: Run existing unit tests to verify no regression**

Run: `npm test`
Expected: 42/42 passing

- [ ] **Step 4: Commit**

```bash
git add e2e/public.spec.ts
git commit -m "test: add E2E tests for public pages"
```

---

### Task 4: Admin E2E Tests

**Files:**
- Create: `e2e/admin.spec.ts`

**Interfaces:**
- Consumes: Playwright config, test database from setup, `login` helper
- Produces: E2E tests covering admin login + CRUD flows

- [ ] **Step 1: Create admin E2E tests**

```typescript
import { test, expect } from "@playwright/test";
import { login } from "./helpers";

test.describe("Admin authentication", () => {
  test("login page loads", async ({ page }) => {
    await page.goto("/admin/login");
    await expect(page.locator("body")).toBeVisible();
    const bodyText = await page.locator("body").textContent();
    expect(bodyText).toContain("Afterimage");
  });

  test("login with correct credentials redirects to dashboard", async ({ page }) => {
    await login(page);
    await expect(page).toHaveURL(/\/admin$/);
  });

  test("login with wrong credentials shows error", async ({ page }) => {
    await page.goto("/admin/login");
    await page.fill('input[type="text"]', "admin");
    await page.fill('input[type="password"]', "wrongpassword");
    await page.click('button[type="submit"]');
    await page.waitForTimeout(1000);
    const bodyText = await page.locator("body").textContent();
    expect(bodyText).toMatch(/错误|失败|error/i);
  });

  test("admin pages redirect to login when not authenticated", async ({ page }) => {
    await page.goto("/admin/albums");
    await page.waitForURL(/\/admin\/login/);
  });
});

test.describe("Admin dashboard", () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
  });

  test("dashboard shows statistics", async ({ page }) => {
    await page.goto("/admin");
    await expect(page.locator("body")).toBeVisible();
    const bodyText = await page.locator("body").textContent();
    expect(bodyText).toContain("仪表盘");
  });
});

test.describe("Category management", () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
  });

  test("can view categories page", async ({ page }) => {
    await page.goto("/admin/categories");
    await expect(page.locator("body")).toBeVisible();
    const bodyText = await page.locator("body").textContent();
    expect(bodyText).toContain("分类");
  });

  test("can create a category", async ({ page }) => {
    await page.goto("/admin/categories");
    await page.fill('input[placeholder="新分类名称"]', "E2E测试分类");
    await page.click('button[type="submit"]');
    await page.waitForTimeout(1000);
    const bodyText = await page.locator("body").textContent();
    expect(bodyText).toContain("E2E测试分类");
  });
});

test.describe("Album management", () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
  });

  test("can view albums page", async ({ page }) => {
    await page.goto("/admin/albums");
    await expect(page.locator("body")).toBeVisible();
    const bodyText = await page.locator("body").textContent();
    expect(bodyText).toContain("相册");
  });

  test("can create a new album", async ({ page }) => {
    await page.goto("/admin/albums/new");
    await page.fill('input[type="text"]', "E2E新建相册");
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/admin\/albums/);
    const bodyText = await page.locator("body").textContent();
    expect(bodyText).toContain("E2E新建相册");
  });
});

test.describe("Photo management", () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
  });

  test("can view photos page", async ({ page }) => {
    await page.goto("/admin/photos");
    await expect(page.locator("body")).toBeVisible();
    const bodyText = await page.locator("body").textContent();
    expect(bodyText).toContain("照片");
  });
});

test.describe("Upload page", () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
  });

  test("upload page loads", async ({ page }) => {
    await page.goto("/admin/upload");
    await expect(page.locator("body")).toBeVisible();
  });
});

test.describe("Story management", () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
  });

  test("can view stories page", async ({ page }) => {
    await page.goto("/admin/stories");
    await expect(page.locator("body")).toBeVisible();
    const bodyText = await page.locator("body").textContent();
    expect(bodyText).toContain("故事");
  });

  test("can create a new story", async ({ page }) => {
    await page.goto("/admin/stories/new");
    await page.fill('input[type="text"]', "E2E新故事");
    await page.fill('textarea', "E2E故事摘要");
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/admin\/stories/);
    const bodyText = await page.locator("body").textContent();
    expect(bodyText).toContain("E2E新故事");
  });
});

test.describe("Settings management", () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
  });

  test("settings page loads", async ({ page }) => {
    await page.goto("/admin/settings");
    await expect(page.locator("body")).toBeVisible();
    const bodyText = await page.locator("body").textContent();
    expect(bodyText).toContain("设置");
  });
});
```

- [ ] **Step 2: Run admin E2E tests**

Run: `npx playwright test e2e/admin.spec.ts`
Expected: All admin tests pass

- [ ] **Step 3: Run full E2E suite**

Run: `npx playwright test`
Expected: All E2E tests pass

- [ ] **Step 4: Run existing unit tests to verify no regression**

Run: `npm test`
Expected: 42/42 passing

- [ ] **Step 5: Commit**

```bash
git add e2e/admin.spec.ts
git commit -m "test: add E2E tests for admin authentication and CRUD flows"
```
