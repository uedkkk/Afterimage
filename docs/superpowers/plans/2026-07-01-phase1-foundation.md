# Afterimage Phase 1: Foundation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Set up the project foundation — Next.js scaffolding, Prisma database, authentication, image processing pipeline, and storage abstraction.

**Architecture:** Next.js 15 App Router with TypeScript. Prisma + SQLite for data. Sharp for image processing. JWT cookies for auth. All foundation modules live in `lib/` with clear boundaries and full test coverage.

**Tech Stack:** Next.js 15, React 19, TypeScript, Prisma, SQLite, Sharp, Tailwind CSS, Vitest, bcryptjs, jose (JWT)

## Global Constraints

- Node.js >= 20
- Next.js 15 App Router (not Pages Router)
- TypeScript strict mode
- Tailwind CSS for styling
- Vitest for unit tests
- No Inter, Roboto, Arial, system-ui fonts — use Space Grotesk + Instrument Serif
- CSS custom properties for theming
- `prefers-reduced-motion` honored in all animations
- All images need explicit `width` and `height`
- Semantic HTML throughout
- SQLite database file at `data/afterimage.db`
- Uploads stored at `public/uploads/` with `originals/`, `thumbnails/`, `optimized/` subdirectories

---

### Task 1: Project Scaffolding

**Files:**
- Create: `package.json`, `tsconfig.json`, `next.config.ts`, `tailwind.config.ts`, `postcss.config.mjs`
- Create: `app/layout.tsx`, `app/page.tsx`, `app/globals.css`
- Create: `.env.example`, `.env`, `.gitignore` (update)
- Create: `vitest.config.ts`, `vitest.setup.ts`

**Interfaces:**
- Produces: A running Next.js dev server at `localhost:3000` with Tailwind, Prisma, Sharp, and Vitest configured

- [ ] **Step 1: Create Next.js project**

```bash
cd /Users/liaoyiqing/code/Afterimage
npx create-next-app@latest . --typescript --tailwind --app --no-src-dir --import-alias "@/*" --eslint --use-npm --no-turbopack
```

If prompted about existing files, choose to proceed/overwrite as needed.

- [ ] **Step 2: Install dependencies**

```bash
npm install prisma @prisma/client sharp bcryptjs jose
npm install -D @types/sharp @types/bcryptjs vitest @vitejs/plugin-react @testing-library/react @testing-library/jest-dom jsdom happy-dom
```

- [ ] **Step 3: Configure Tailwind with custom theme**

Replace `tailwind.config.ts`:

```typescript
import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: "#f4f2ed",
        paper: "#faf8f4",
        ink: "#0e0e0e",
        dim: "#6c6a64",
        faint: "#d8d5cd",
        line: "#0e0e0e",
        accent: "#a64b2a",
      },
      fontFamily: {
        display: ["var(--font-space-grotesk)", "sans-serif"],
        serif: ["var(--font-instrument-serif)", "Georgia", "serif"],
      },
    },
  },
  plugins: [],
};

export default config;
```

- [ ] **Step 4: Configure Google Fonts in root layout**

Replace `app/layout.tsx`:

```tsx
import type { Metadata } from "next";
import { Space_Grotesk, Instrument_Serif } from "next/font/google";
import "./globals.css";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
  display: "swap",
});

const instrumentSerif = Instrument_Serif({
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
  variable: "--font-instrument-serif",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Afterimage",
  description: "摄影作品展示与管理系统",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="zh-CN" className={`${spaceGrotesk.variable} ${instrumentSerif.variable}`}>
      <body className="font-display antialiased">{children}</body>
    </html>
  );
}
```

- [ ] **Step 5: Set up global CSS with custom properties**

Replace `app/globals.css`:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  --color-bg: #f4f2ed;
  --color-paper: #faf8f4;
  --color-text: #0e0e0e;
  --color-dim: #6c6a64;
  --color-faint: #d8d5cd;
  --color-line: #0e0e0e;
  --color-accent: #a64b2a;
  --font-display: var(--font-space-grotesk), sans-serif;
  --font-serif: var(--font-instrument-serif), Georgia, serif;
}

html {
  color-scheme: light;
  scroll-behavior: smooth;
}

body {
  background: var(--color-bg);
  color: var(--color-text);
  -webkit-font-smoothing: antialiased;
}

body::before {
  content: "";
  position: fixed;
  inset: 0;
  z-index: 9999;
  pointer-events: none;
  opacity: 0.025;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
}

@media (prefers-reduced-motion: reduce) {
  html {
    scroll-behavior: auto;
  }
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

- [ ] **Step 6: Replace placeholder homepage**

Replace `app/page.tsx`:

```tsx
export default function Home() {
  return (
    <main className="min-h-screen p-14">
      <h1 className="font-display text-6xl font-bold tracking-tight">
        光影的<br />
        <em className="font-serif font-normal italic text-accent">残像</em>
      </h1>
      <p className="mt-6 font-serif text-lg italic text-dim max-w-md">
        Afterimage — 摄影作品展示与管理系统
      </p>
    </main>
  );
}
```

- [ ] **Step 7: Configure Vitest**

Create `vitest.config.ts`:

```typescript
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import { resolve } from "path";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "happy-dom",
    setupFiles: ["./vitest.setup.ts"],
  },
  resolve: {
    alias: {
      "@": resolve(__dirname, "./"),
    },
  },
});
```

Create `vitest.setup.ts`:

```typescript
import "@testing-library/jest-dom/vitest";
```

- [ ] **Step 8: Create environment files**

Create `.env.example`:

```
DATABASE_URL="file:./data/afterimage.db"
JWT_SECRET="change-me-in-production"
ADMIN_USERNAME="admin"
ADMIN_PASSWORD="$2b$10$your-bcrypt-hash-here"
```

Create `.env` (copy from example, will be updated in Task 2):

```bash
cp .env.example .env
```

Update `.gitignore` to add:

```
data/
.env
.superpowers/
```

- [ ] **Step 9: Verify dev server starts**

```bash
npm run dev
```

Expected: Server starts at `http://localhost:3000`, page shows "光影的 残像" heading.

- [ ] **Step 10: Commit**

```bash
git add -A
git commit -m "feat: scaffold Next.js project with Tailwind, Prisma, Sharp, and Vitest"
```

---

### Task 2: Prisma Schema and Database

**Files:**
- Create: `prisma/schema.prisma`
- Create: `lib/db/index.ts`, `lib/db/queries.ts`
- Create: `prisma/seed.ts`
- Create: `tests/lib/db.test.ts`
- Modify: `package.json` (add prisma scripts)

**Interfaces:**
- Produces: `prisma` client instance at `lib/db/index.ts`
- Produces: `getPrisma()` function returning a singleton PrismaClient
- Produces: Query functions in `lib/db/queries.ts` for all CRUD operations
- Produces: Seed script at `prisma/seed.ts`

- [ ] **Step 1: Initialize Prisma**

```bash
npx prisma init --datasource-provider sqlite
```

This creates `prisma/schema.prisma` and updates `.env`.

- [ ] **Step 2: Write the Prisma schema**

Replace `prisma/schema.prisma`:

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "sqlite"
  url      = env("DATABASE_URL")
}

model User {
  id        String   @id @default(cuid())
  username  String   @unique
  password  String
  createdAt DateTime @default(now())
}

model Category {
  id        String  @id @default(cuid())
  name      String  @unique
  slug      String  @unique
  sortOrder Int     @default(0)
  albums    Album[]
}

model Album {
  id          String    @id @default(cuid())
  title       String
  slug        String    @unique
  description String?
  coverId     String?   @unique
  cover       Photo?    @relation("AlbumCover", fields: [coverId], references: [id])
  categoryId  String?
  category    Category? @relation(fields: [categoryId], references: [id])
  sortOrder   Int       @default(0)
  published   Boolean   @default(false)
  photos      Photo[]
  stories     Story[]
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt

  @@index([categoryId])
  @@index([slug])
}

model Photo {
  id          String   @id @default(cuid())
  title       String?
  description String?
  albumId     String?
  album       Album?   @relation(fields: [albumId], references: [id])
  filename    String
  filePath    String
  lanPath     String?
  width       Int
  height      Int
  fileSize    Int
  mimeType    String
  thumbPath   String?
  exif        String?
  tags        String   @default("[]")
  sortOrder   Int      @default(0)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  albumCover  Album?  @relation("AlbumCover")
  storyCover  Story?  @relation("StoryCover")

  @@index([albumId])
  @@index([createdAt])
}

model Story {
  id        String   @id @default(cuid())
  title     String
  slug      String   @unique
  excerpt   String
  content   String
  coverId   String?  @unique
  cover     Photo?   @relation("StoryCover", fields: [coverId], references: [id])
  albumId   String?
  album     Album?   @relation(fields: [albumId], references: [id])
  published Boolean  @default(false)
  sortOrder Int      @default(0)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@index([albumId])
  @@index([slug])
}

model PageView {
  id        String   @id @default(cuid())
  path      String
  albumId   String?
  photoId   String?
  ip        String?
  userAgent String?
  createdAt DateTime @default(now())

  @@index([path])
  @@index([createdAt])
}

model Setting {
  id    String @id
  value String
}
```

Note: SQLite does not support `String[]` or `Json` types natively. `tags` is stored as a JSON string and `exif` is stored as a JSON string. These will be parsed/serialized in the query layer.

- [ ] **Step 3: Generate Prisma client and run migration**

```bash
mkdir -p data
npx prisma migrate dev --name init
npx prisma generate
```

- [ ] **Step 4: Create Prisma client singleton**

Create `lib/db/index.ts`:

```typescript
import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

export { prisma as db };
```

- [ ] **Step 5: Write query layer with tag/exif serialization**

Create `lib/db/queries.ts`:

```typescript
import { db } from "./index";
import type { Photo, Album, Category, Story, Setting, PageView } from "@prisma/client";

export interface PhotoWithTags extends Omit<Photo, "tags" | "exif"> {
  tags: string[];
  exif: Record<string, unknown> | null;
}

export interface CreatePhotoInput {
  title?: string;
  description?: string;
  albumId?: string;
  filename: string;
  filePath: string;
  lanPath?: string;
  width: number;
  height: number;
  fileSize: number;
  mimeType: string;
  thumbPath?: string;
  exif?: Record<string, unknown> | null;
  tags?: string[];
}

function serializePhoto(photo: Photo): PhotoWithTags {
  return {
    ...photo,
    tags: JSON.parse(photo.tags) as string[],
    exif: photo.exif ? (JSON.parse(photo.exif) as Record<string, unknown>) : null,
  };
}

export async function createPhoto(input: CreatePhotoInput): Promise<PhotoWithTags> {
  const photo = await db.photo.create({
    data: {
      title: input.title,
      description: input.description,
      albumId: input.albumId,
      filename: input.filename,
      filePath: input.filePath,
      lanPath: input.lanPath,
      width: input.width,
      height: input.height,
      fileSize: input.fileSize,
      mimeType: input.mimeType,
      thumbPath: input.thumbPath,
      exif: input.exif ? JSON.stringify(input.exif) : null,
      tags: JSON.stringify(input.tags ?? []),
    },
  });
  return serializePhoto(photo);
}

export async function getPhotoById(id: string): Promise<PhotoWithTags | null> {
  const photo = await db.photo.findUnique({ where: { id } });
  return photo ? serializePhoto(photo) : null;
}

export async function getPhotosByAlbum(albumId: string): Promise<PhotoWithTags[]> {
  const photos = await db.photo.findMany({
    where: { albumId },
    orderBy: { sortOrder: "asc" },
  });
  return photos.map(serializePhoto);
}

export async function getAllPhotos(limit = 100, offset = 0): Promise<PhotoWithTags[]> {
  const photos = await db.photo.findMany({
    orderBy: { createdAt: "desc" },
    take: limit,
    skip: offset,
  });
  return photos.map(serializePhoto);
}

export async function updatePhoto(
  id: string,
  data: Partial<CreatePhotoInput>
): Promise<PhotoWithTags | null> {
  const updateData: Record<string, unknown> = {};
  if (data.title !== undefined) updateData.title = data.title;
  if (data.description !== undefined) updateData.description = data.description;
  if (data.albumId !== undefined) updateData.albumId = data.albumId;
  if (data.tags !== undefined) updateData.tags = JSON.stringify(data.tags);
  if (data.exif !== undefined) updateData.exif = data.exif ? JSON.stringify(data.exif) : null;
  if (data.thumbPath !== undefined) updateData.thumbPath = data.thumbPath;

  const photo = await db.photo.update({ where: { id }, data: updateData });
  return serializePhoto(photo);
}

export async function deletePhoto(id: string): Promise<void> {
  await db.photo.delete({ where: { id } });
}

export async function createAlbum(input: {
  title: string;
  slug: string;
  description?: string;
  categoryId?: string;
  published?: boolean;
}): Promise<Album> {
  return db.album.create({
    data: {
      title: input.title,
      slug: input.slug,
      description: input.description,
      categoryId: input.categoryId,
      published: input.published ?? false,
    },
  });
}

export async function getAlbumBySlug(slug: string): Promise<Album | null> {
  return db.album.findUnique({ where: { slug }, include: { category: true } });
}

export async function getPublishedAlbums(): Promise<Album[]> {
  return db.album.findMany({
    where: { published: true },
    orderBy: { sortOrder: "asc" },
    include: { category: true, cover: true },
  });
}

export async function getAlbumsByCategory(categoryId: string): Promise<Album[]> {
  return db.album.findMany({
    where: { categoryId, published: true },
    orderBy: { sortOrder: "asc" },
  });
}

export async function getAllCategories(): Promise<Category[]> {
  return db.category.findMany({ orderBy: { sortOrder: "asc" } });
}

export async function createCategory(name: string, slug: string): Promise<Category> {
  return db.category.create({ data: { name, slug } });
}

export async function getPublishedStories(): Promise<Story[]> {
  return db.story.findMany({
    where: { published: true },
    orderBy: { sortOrder: "asc" },
    include: { cover: true, album: true },
  });
}

export async function getStoryBySlug(slug: string): Promise<Story | null> {
  return db.story.findUnique({
    where: { slug },
    include: { cover: true, album: true },
  });
}

export async function createPageView(input: {
  path: string;
  albumId?: string;
  photoId?: string;
  ip?: string;
  userAgent?: string;
}): Promise<PageView> {
  return db.pageView.create({ data: input });
}

export async function getSetting(key: string): Promise<string | null> {
  const setting = await db.setting.findUnique({ where: { id: key } });
  return setting?.value ?? null;
}

export async function setSetting(key: string, value: string): Promise<Setting> {
  return db.setting.upsert({
    where: { id: key },
    update: { value },
    create: { id: key, value },
  });
}

export async function getAllSettings(): Promise<Record<string, string>> {
  const settings = await db.setting.findMany();
  return Object.fromEntries(settings.map((s) => [s.id, s.value]));
}
```

- [ ] **Step 6: Write seed script**

Create `prisma/seed.ts`:

```typescript
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const username = process.env.ADMIN_USERNAME ?? "admin";
  const rawPassword = process.env.ADMIN_PASSWORD ?? "admin123";
  const password = rawPassword.startsWith("$2b$")
    ? rawPassword
    : await bcrypt.hash(rawPassword, 10);

  await prisma.user.upsert({
    where: { username },
    update: {},
    create: { username, password },
  });

  await prisma.setting.upsert({
    where: { id: "site.title" },
    update: {},
    create: { id: "site.title", value: "Afterimage" },
  });

  await prisma.setting.upsert({
    where: { id: "site.description" },
    update: {},
    create: { id: "site.description", value: "摄影作品展示与管理系统" },
  });

  console.log("Seed completed: admin user and default settings created");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
```

- [ ] **Step 7: Add Prisma scripts to package.json**

Add to `package.json` scripts:

```json
{
  "scripts": {
    "db:migrate": "prisma migrate dev",
    "db:generate": "prisma generate",
    "db:seed": "tsx prisma/seed.ts",
    "db:studio": "prisma studio",
    "test": "vitest run",
    "test:watch": "vitest"
  }
}
```

Install `tsx` for running TypeScript seed:

```bash
npm install -D tsx
```

- [ ] **Step 8: Run seed**

```bash
npm run db:seed
```

Expected: "Seed completed: admin user and default settings created"

- [ ] **Step 9: Write tests for query layer**

Create `tests/lib/db.test.ts`:

```typescript
import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { db } from "@/lib/db";
import {
  createPhoto,
  getPhotoById,
  getAllPhotos,
  updatePhoto,
  deletePhoto,
  createAlbum,
  getAlbumBySlug,
  createCategory,
  getAllCategories,
  setSetting,
  getSetting,
} from "@/lib/db/queries";

const testCategoryId = "test-cat-id";
const testAlbumId = "test-album-id";
const testPhotoId = "test-photo-id";

beforeAll(async () => {
  await db.photo.deleteMany({});
  await db.album.deleteMany({});
  await db.category.deleteMany({});
  await db.setting.deleteMany({ where: { id: { startsWith: "test." } } });

  await db.category.create({
    data: { id: testCategoryId, name: "Test Travel", slug: "test-travel" },
  });

  await db.album.create({
    data: {
      id: testAlbumId,
      title: "Test Album",
      slug: "test-album",
      categoryId: testCategoryId,
      published: true,
    },
  });
});

afterAll(async () => {
  await db.photo.deleteMany({});
  await db.album.deleteMany({});
  await db.category.deleteMany({});
  await db.setting.deleteMany({ where: { id: { startsWith: "test." } } });
  await db.$disconnect();
});

describe("photo queries", () => {
  it("creates a photo with tags and exif", async () => {
    const photo = await createPhoto({
      filename: "test.jpg",
      filePath: "/uploads/test.jpg",
      width: 1920,
      height: 1080,
      fileSize: 1024000,
      mimeType: "image/jpeg",
      tags: ["travel", "japan"],
      exif: { camera: "Sony A7R2", lens: "35mm" },
    });

    expect(photo.id).toBeDefined();
    expect(photo.tags).toEqual(["travel", "japan"]);
    expect(photo.exif).toEqual({ camera: "Sony A7R2", lens: "35mm" });
  });

  it("retrieves a photo by id with parsed tags", async () => {
    const created = await createPhoto({
      filename: "test2.jpg",
      filePath: "/uploads/test2.jpg",
      width: 800,
      height: 600,
      fileSize: 500000,
      mimeType: "image/jpeg",
      tags: ["street"],
    });

    const found = await getPhotoById(created.id);
    expect(found).not.toBeNull();
    expect(found!.tags).toEqual(["street"]);
    expect(found!.exif).toBeNull();
  });

  it("updates photo tags", async () => {
    const created = await createPhoto({
      filename: "test3.jpg",
      filePath: "/uploads/test3.jpg",
      width: 800,
      height: 600,
      fileSize: 500000,
      mimeType: "image/jpeg",
      tags: ["old"],
    });

    const updated = await updatePhoto(created.id, { tags: ["new", "updated"] });
    expect(updated!.tags).toEqual(["new", "updated"]);
  });

  it("deletes a photo", async () => {
    const created = await createPhoto({
      filename: "test4.jpg",
      filePath: "/uploads/test4.jpg",
      width: 800,
      height: 600,
      fileSize: 500000,
      mimeType: "image/jpeg",
    });

    await deletePhoto(created.id);
    const found = await getPhotoById(created.id);
    expect(found).toBeNull();
  });
});

describe("album queries", () => {
  it("retrieves album by slug", async () => {
    const album = await getAlbumBySlug("test-album");
    expect(album).not.toBeNull();
    expect(album!.title).toBe("Test Album");
  });
});

describe("category queries", () => {
  it("lists all categories", async () => {
    const categories = await getAllCategories();
    expect(categories.length).toBeGreaterThan(0);
    expect(categories.some((c) => c.slug === "test-travel")).toBe(true);
  });
});

describe("setting queries", () => {
  it("sets and gets a setting", async () => {
    await setSetting("test.key", "test-value");
    const value = await getSetting("test.key");
    expect(value).toBe("test-value");
  });
});
```

- [ ] **Step 10: Run tests**

```bash
npm test
```

Expected: All tests pass.

- [ ] **Step 11: Commit**

```bash
git add -A
git commit -m "feat: add Prisma schema, query layer, and seed script"
```

---

### Task 3: Authentication System

**Files:**
- Create: `lib/auth/jwt.ts`, `lib/auth/password.ts`, `lib/auth/session.ts`
- Create: `app/api/auth/login/route.ts`, `app/api/auth/logout/route.ts`
- Create: `middleware.ts`
- Create: `tests/lib/auth.test.ts`

**Interfaces:**
- Produces: `signToken(payload: { username: string }): Promise<string>` in `lib/auth/jwt.ts`
- Produces: `verifyToken(token: string): Promise<{ username: string } | null>` in `lib/auth/jwt.ts`
- Produces: `hashPassword(password: string): Promise<string>` in `lib/auth/password.ts`
- Produces: `verifyPassword(password: string, hash: string): Promise<boolean>` in `lib/auth/password.ts`
- Produces: `createSession(username: string): Promise<void>` in `lib/auth/session.ts` — sets HttpOnly cookie
- Produces: `getSession(): Promise<{ username: string } | null>` in `lib/auth/session.ts` — reads cookie from Next.js headers
- Produces: `destroySession(): Promise<void>` in `lib/auth/session.ts` — clears cookie
- Produces: `requireAuth(): Promise<{ username: string }>` in `lib/auth/session.ts` — throws if not authenticated

- [ ] **Step 1: Write failing tests for JWT and password**

Create `tests/lib/auth.test.ts`:

```typescript
import { describe, it, expect } from "vitest";
import { signToken, verifyToken } from "@/lib/auth/jwt";
import { hashPassword, verifyPassword } from "@/lib/auth/password";

describe("JWT", () => {
  it("signs and verifies a token", async () => {
    const token = await signToken({ username: "admin" });
    expect(token).toBeDefined();

    const payload = await verifyToken(token);
    expect(payload).not.toBeNull();
    expect(payload!.username).toBe("admin");
  });

  it("returns null for invalid token", async () => {
    const payload = await verifyToken("invalid-token");
    expect(payload).toBeNull();
  });
});

describe("password", () => {
  it("hashes a password", async () => {
    const hash = await hashPassword("mypassword");
    expect(hash).not.toBe("mypassword");
    expect(hash.startsWith("$2b$")).toBe(true);
  });

  it("verifies correct password", async () => {
    const hash = await hashPassword("mypassword");
    const valid = await verifyPassword("mypassword", hash);
    expect(valid).toBe(true);
  });

  it("rejects wrong password", async () => {
    const hash = await hashPassword("mypassword");
    const valid = await verifyPassword("wrongpassword", hash);
    expect(valid).toBe(false);
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
npm test -- tests/lib/auth.test.ts
```

Expected: FAIL — modules not found.

- [ ] **Step 3: Implement JWT module**

Create `lib/auth/jwt.ts`:

```typescript
import { SignJWT, jwtVerify } from "jose";

const secret = new TextEncoder().encode(
  process.env.JWT_SECRET ?? "fallback-secret-change-me"
);

export async function signToken(payload: { username: string }): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(secret);
}

export async function verifyToken(
  token: string
): Promise<{ username: string } | null> {
  try {
    const { payload } = await jwtVerify(token, secret);
    if (typeof payload.username === "string") {
      return { username: payload.username };
    }
    return null;
  } catch {
    return null;
  }
}
```

- [ ] **Step 4: Implement password module**

Create `lib/auth/password.ts`:

```typescript
import bcrypt from "bcryptjs";

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(
  password: string,
  hash: string
): Promise<boolean> {
  return bcrypt.compare(password, hash);
}
```

- [ ] **Step 5: Run tests to verify they pass**

```bash
npm test -- tests/lib/auth.test.ts
```

Expected: All tests pass.

- [ ] **Step 6: Implement session module**

Create `lib/auth/session.ts`:

```typescript
import { cookies } from "next/headers";
import { signToken, verifyToken } from "./jwt";
import { db } from "@/lib/db";
import { verifyPassword } from "./password";

const COOKIE_NAME = "afterimage_session";

export async function createSession(username: string): Promise<void> {
  const token = await signToken({ username });
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7,
    path: "/",
  });
}

export async function getSession(): Promise<{ username: string } | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;
  return verifyToken(token);
}

export async function destroySession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}

export async function requireAuth(): Promise<{ username: string }> {
  const session = await getSession();
  if (!session) {
    throw new Response("Unauthorized", { status: 401 });
  }
  return session;
}

export async function authenticateUser(
  username: string,
  password: string
): Promise<boolean> {
  const user = await db.user.findUnique({ where: { username } });
  if (!user) return false;
  return verifyPassword(password, user.password);
}
```

- [ ] **Step 7: Implement login API route**

Create `app/api/auth/login/route.ts`:

```typescript
import { NextRequest, NextResponse } from "next/server";
import { authenticateUser, createSession } from "@/lib/auth/session";

export async function POST(request: NextRequest) {
  const { username, password } = await request.json();

  if (!username || !password) {
    return NextResponse.json(
      { error: "用户名和密码不能为空" },
      { status: 400 }
    );
  }

  const valid = await authenticateUser(username, password);
  if (!valid) {
    return NextResponse.json(
      { error: "用户名或密码错误" },
      { status: 401 }
    );
  }

  await createSession(username);
  return NextResponse.json({ success: true });
}
```

- [ ] **Step 8: Implement logout API route**

Create `app/api/auth/logout/route.ts`:

```typescript
import { NextResponse } from "next/server";
import { destroySession } from "@/lib/auth/session";

export async function POST() {
  await destroySession();
  return NextResponse.json({ success: true });
}
```

- [ ] **Step 9: Implement middleware for admin route protection**

Create `middleware.ts`:

```typescript
import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

const COOKIE_NAME = "afterimage_session";
const secret = new TextEncoder().encode(
  process.env.JWT_SECRET ?? "fallback-secret-change-me"
);

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip login page itself
  if (pathname === "/admin/login") {
    return NextResponse.next();
  }

  const token = request.cookies.get(COOKIE_NAME)?.value;

  if (!token) {
    const loginUrl = new URL("/admin/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  try {
    await jwtVerify(token, secret);
    return NextResponse.next();
  } catch {
    const loginUrl = new URL("/admin/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }
}

export const config = {
  matcher: ["/admin/:path*"],
};
```

- [ ] **Step 10: Run all tests**

```bash
npm test
```

Expected: All tests pass.

- [ ] **Step 11: Commit**

```bash
git add -A
git commit -m "feat: add authentication system with JWT, password hashing, and middleware"
```

---

### Task 4: Image Processing Pipeline

**Files:**
- Create: `lib/image/process.ts`, `lib/image/exif.ts`, `lib/image/thumbnail.ts`
- Create: `tests/lib/image.test.ts`
- Create: `tests/fixtures/` (test image)

**Interfaces:**
- Produces: `processImage(filePath: string): Promise<ProcessedImage>` in `lib/image/process.ts`
- Produces: `extractExif(filePath: string): Promise<ExifData | null>` in `lib/image/exif.ts`
- Produces: `generateThumbnail(filePath: string, outputDir: string): Promise<string>` in `lib/image/thumbnail.ts`
- Produces: `generateOptimized(filePath: string, outputDir: string): Promise<string>` in `lib/image/thumbnail.ts`
- `ProcessedImage` type: `{ width: number; height: number; thumbPath: string; optimizedPath: string; exif: ExifData | null; fileSize: number; mimeType: string }`
- `ExifData` type: `{ camera?: string; lens?: string; aperture?: string; shutter?: string; iso?: string; focalLength?: string; takenAt?: string }`

- [ ] **Step 1: Create a test image fixture**

```bash
mkdir -p tests/fixtures
```

Download a small test JPEG (or create one with Sharp):

Create `tests/fixtures/generate-test-image.ts`:

```typescript
import sharp from "sharp";
import { mkdirSync } from "fs";

mkdirSync("tests/fixtures", { recursive: true });

sharp({
  create: {
    width: 800,
    height: 600,
    channels: 3,
    background: { r: 100, g: 150, b: 200 },
  },
})
  .jpeg()
  .toFile("tests/fixtures/test-image.jpg")
  .then(() => console.log("Test image created"))
  .catch(console.error);
```

```bash
npx tsx tests/fixtures/generate-test-image.ts
```

- [ ] **Step 2: Write failing tests for image processing**

Create `tests/lib/image.test.ts`:

```typescript
import { describe, it, expect, beforeAll } from "vitest";
import { existsSync, mkdirSync, rmSync } from "fs";
import { join } from "path";
import { processImage } from "@/lib/image/process";
import { extractExif } from "@/lib/image/exif";
import { generateThumbnail, generateOptimized } from "@/lib/image/thumbnail";

const testImagePath = join(process.cwd(), "tests/fixtures/test-image.jpg");
const outputDir = join(process.cwd(), "tests/fixtures/output");

beforeAll(() => {
  mkdirSync(outputDir, { recursive: true });
});

describe("extractExif", () => {
  it("returns null for image without EXIF", async () => {
    const exif = await extractExif(testImagePath);
    // Test image has no EXIF, so should return null or empty object
    expect(exif).toBeTypeOf("object");
  });
});

describe("generateThumbnail", () => {
  it("generates a 400px wide WebP thumbnail", async () => {
    const thumbPath = await generateThumbnail(testImagePath, outputDir);
    expect(existsSync(thumbPath)).toBe(true);
    expect(thumbPath.endsWith(".webp")).toBe(true);
  });
});

describe("generateOptimized", () => {
  it("generates an optimized WebP image (max 1920px)", async () => {
    const optimizedPath = await generateOptimized(testImagePath, outputDir);
    expect(existsSync(optimizedPath)).toBe(true);
    expect(optimizedPath.endsWith(".webp")).toBe(true);
  });
});

describe("processImage", () => {
  it("processes an image and returns metadata", async () => {
    const result = await processImage(testImagePath, outputDir, "test-photo-id");
    expect(result.width).toBe(800);
    expect(result.height).toBe(600);
    expect(result.fileSize).toBeGreaterThan(0);
    expect(result.mimeType).toBe("image/jpeg");
    expect(existsSync(result.thumbPath)).toBe(true);
    expect(existsSync(result.optimizedPath)).toBe(true);
    expect(result.exif).toBeTypeOf("object");
  });
});
```

- [ ] **Step 3: Run tests to verify they fail**

```bash
npm test -- tests/lib/image.test.ts
```

Expected: FAIL — modules not found.

- [ ] **Step 4: Implement EXIF extraction**

Create `lib/image/exif.ts`:

```typescript
import sharp from "sharp";

export interface ExifData {
  camera?: string;
  lens?: string;
  aperture?: string;
  shutter?: string;
  iso?: string;
  focalLength?: string;
  takenAt?: string;
}

export async function extractExif(
  filePath: string
): Promise<ExifData | null> {
  try {
    const metadata = await sharp(filePath).metadata();
    const exif = metadata.exif;
    if (!exif) return null;

    // Parse EXIF buffer — Sharp returns a Buffer with TIFF/EXIF data
    // Use sharp's metadata which parses common EXIF fields
    const data: ExifData = {};

    // sharp doesn't expose parsed EXIF directly, so we use withMetadata
    // and parse the raw EXIF buffer manually for common fields
    const str = exif.toString("latin1");

    // Simple extraction for common fields
    const makeMatch = str.match(/Make\0+(.*?)(?=\0|$)/);
    const modelMatch = str.match(/Model\0+(.*?)(?=\0|$)/);
    const lensMatch = str.match(/LensModel\0+(.*?)(?=\0|$)/);
    const fNumberMatch = str.match(/FNumber\0+(.*?)(?=\0|$)/);
    const exposureMatch = str.match(/ExposureTime\0+(.*?)(?=\0|$)/);
    const isoMatch = str.match(/ISO\0+(.*?)(?=\0|$)/);
    const focalMatch = str.match(/FocalLength\0+(.*?)(?=\0|$)/);
    const dateMatch = str.match(/DateTimeOriginal\0+(.*?)(?=\0|$)/);

    if (makeMatch && modelMatch) {
      data.camera = `${makeMatch[1].trim()} ${modelMatch[1].trim()}`.trim();
    } else if (modelMatch) {
      data.camera = modelMatch[1].trim();
    }
    if (lensMatch) data.lens = lensMatch[1].trim();
    if (fNumberMatch) data.aperture = `f/${fNumberMatch[1].trim()}`;
    if (exposureMatch) data.shutter = `${exposureMatch[1].trim()}s`;
    if (isoMatch) data.iso = isoMatch[1].trim();
    if (focalMatch) data.focalLength = focalMatch[1].trim();
    if (dateMatch) data.takenAt = dateMatch[1].trim();

    const hasData = Object.keys(data).length > 0;
    return hasData ? data : null;
  } catch {
    return null;
  }
}
```

- [ ] **Step 5: Implement thumbnail generation**

Create `lib/image/thumbnail.ts`:

```typescript
import sharp from "sharp";
import { join, extname } from "path";
import { mkdirSync } from "fs";

export async function generateThumbnail(
  filePath: string,
  outputDir: string
): Promise<string> {
  mkdirSync(outputDir, { recursive: true });
  const baseName = filePath.replace(extname(filePath), "").split("/").pop();
  const outputPath = join(outputDir, `${baseName}.webp`);

  await sharp(filePath)
    .resize(400, undefined, { withoutEnlargement: true })
    .webp({ quality: 75 })
    .toFile(outputPath);

  return outputPath;
}

export async function generateOptimized(
  filePath: string,
  outputDir: string
): Promise<string> {
  mkdirSync(outputDir, { recursive: true });
  const baseName = filePath.replace(extname(filePath), "").split("/").pop();
  const outputPath = join(outputDir, `${baseName}.webp`);

  await sharp(filePath)
    .resize(1920, undefined, { withoutEnlargement: true })
    .webp({ quality: 80 })
    .toFile(outputPath);

  return outputPath;
}
```

- [ ] **Step 6: Implement full processing pipeline**

Create `lib/image/process.ts`:

```typescript
import sharp from "sharp";
import { statSync } from "fs";
import { join } from "path";
import { mkdirSync } from "fs";
import { extractExif, type ExifData } from "./exif";
import { generateThumbnail, generateOptimized } from "./thumbnail";

export interface ProcessedImage {
  width: number;
  height: number;
  fileSize: number;
  mimeType: string;
  thumbPath: string;
  optimizedPath: string;
  exif: ExifData | null;
}

export async function processImage(
  filePath: string,
  outputDir: string,
  id: string
): Promise<ProcessedImage> {
  const thumbDir = join(outputDir, "thumbnails");
  const optimizedDir = join(outputDir, "optimized");

  mkdirSync(thumbDir, { recursive: true });
  mkdirSync(optimizedDir, { recursive: true });

  const metadata = await sharp(filePath).metadata();
  const stats = statSync(filePath);

  const thumbPath = await generateThumbnail(filePath, thumbDir);
  const optimizedPath = await generateOptimized(filePath, optimizedDir);
  const exif = await extractExif(filePath);

  const mimeType =
    metadata.format === "jpeg"
      ? "image/jpeg"
      : metadata.format === "png"
        ? "image/png"
        : metadata.format === "webp"
          ? "image/webp"
          : "image/jpeg";

  return {
    width: metadata.width ?? 0,
    height: metadata.height ?? 0,
    fileSize: stats.size,
    mimeType,
    thumbPath,
    optimizedPath,
    exif,
  };
}
```

- [ ] **Step 7: Run tests to verify they pass**

```bash
npm test -- tests/lib/image.test.ts
```

Expected: All tests pass.

- [ ] **Step 8: Commit**

```bash
git add -A
git commit -m "feat: add image processing pipeline with Sharp (EXIF, thumbnail, optimized)"
```

---

### Task 5: Storage Abstraction

**Files:**
- Create: `lib/storage/local.ts`, `lib/storage/lan.ts`, `lib/storage/index.ts`
- Create: `tests/lib/storage.test.ts`

**Interfaces:**
- Produces: `saveUploadedFile(file: File, destDir: string): Promise<SavedFile>` in `lib/storage/local.ts`
- Produces: `scanLanDirectory(path: string): Promise<ScannedFile[]>` in `lib/storage/lan.ts`
- Produces: `importLanFile(lanPath: string, destDir: string): Promise<SavedFile>` in `lib/storage/lan.ts`
- Produces: `readLanFile(lanPath: string): Promise<Buffer>` in `lib/storage/lan.ts`
- `SavedFile` type: `{ filename: string; filePath: string; fileSize: number; mimeType: string }`
- `ScannedFile` type: `{ path: string; filename: string; size: number; mimeType: string }`

- [ ] **Step 1: Write failing tests for storage**

Create `tests/lib/storage.test.ts`:

```typescript
import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { existsSync, mkdirSync, rmSync, writeFileSync } from "fs";
import { join } from "path";
import { saveUploadedFile } from "@/lib/storage/local";
import { scanLanDirectory, importLanFile } from "@/lib/storage/lan";

const testDir = join(process.cwd(), "tests/fixtures/storage");
const outputDir = join(process.cwd(), "tests/fixtures/storage-output");

beforeAll(() => {
  mkdirSync(testDir, { recursive: true });
  mkdirSync(outputDir, { recursive: true });
  // Create a fake "LAN" file
  writeFileSync(join(testDir, "photo1.jpg"), Buffer.alloc(1024, 0xff));
  writeFileSync(join(testDir, "photo2.png"), Buffer.alloc(512, 0x00));
  writeFileSync(join(testDir, "readme.txt"), "not an image");
});

afterAll(() => {
  rmSync(testDir, { recursive: true, force: true });
  rmSync(outputDir, { recursive: true, force: true });
});

describe("saveUploadedFile", () => {
  it("saves a file to the destination directory", async () => {
    const file = new File([Buffer.alloc(1024, 0xab)], "upload.jpg", {
      type: "image/jpeg",
    });

    const result = await saveUploadedFile(file, outputDir);
    expect(result.filename).toBe("upload.jpg");
    expect(existsSync(result.filePath)).toBe(true);
    expect(result.fileSize).toBe(1024);
    expect(result.mimeType).toBe("image/jpeg");
  });
});

describe("scanLanDirectory", () => {
  it("scans a directory and returns only image files", async () => {
    const files = await scanLanDirectory(testDir);
    expect(files.length).toBe(2);
    expect(files.some((f) => f.filename === "photo1.jpg")).toBe(true);
    expect(files.some((f) => f.filename === "photo2.png")).toBe(true);
    expect(files.some((f) => f.filename === "readme.txt")).toBe(false);
  });

  it("returns empty array for non-existent directory", async () => {
    const files = await scanLanDirectory("/nonexistent/path/12345");
    expect(files).toEqual([]);
  });
});

describe("importLanFile", () => {
  it("copies a file from LAN path to destination", async () => {
    const lanPath = join(testDir, "photo1.jpg");
    const result = await importLanFile(lanPath, outputDir);
    expect(existsSync(result.filePath)).toBe(true);
    expect(result.fileSize).toBe(1024);
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
npm test -- tests/lib/storage.test.ts
```

Expected: FAIL — modules not found.

- [ ] **Step 3: Implement local storage**

Create `lib/storage/local.ts`:

```typescript
import { mkdirSync, writeFileSync, existsSync } from "fs";
import { join, extname } from "path";
import { createHash } from "crypto";

export interface SavedFile {
  filename: string;
  filePath: string;
  fileSize: number;
  mimeType: string;
}

export async function saveUploadedFile(
  file: File,
  destDir: string
): Promise<SavedFile> {
  mkdirSync(destDir, { recursive: true });

  const buffer = Buffer.from(await file.arrayBuffer());
  const ext = extname(file.name) || `.${file.type.split("/")[1] ?? "jpg"}`;
  const hash = createHash("sha256").update(buffer).digest("hex").slice(0, 16);
  const filename = `${hash}${ext}`;
  const filePath = join(destDir, filename);

  writeFileSync(filePath, buffer);

  return {
    filename: file.name,
    filePath,
    fileSize: buffer.length,
    mimeType: file.type || "image/jpeg",
  };
}
```

- [ ] **Step 4: Implement LAN storage**

Create `lib/storage/lan.ts`:

```typescript
import { readdirSync, statSync, copyFileSync, existsSync, readFileSync } from "fs";
import { join, extname, basename } from "path";
import type { SavedFile } from "./local";

export interface ScannedFile {
  path: string;
  filename: string;
  size: number;
  mimeType: string;
}

const IMAGE_EXTENSIONS = [".jpg", ".jpeg", ".png", ".webp", ".raw"];

function getMimeType(ext: string): string {
  const map: Record<string, string> = {
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".png": "image/png",
    ".webp": "image/webp",
    ".raw": "image/raw",
  };
  return map[ext.toLowerCase()] ?? "application/octet-stream";
}

export async function scanLanDirectory(dirPath: string): Promise<ScannedFile[]> {
  if (!existsSync(dirPath)) {
    return [];
  }

  const results: ScannedFile[] = [];

  function scan(dir: string) {
    const entries = readdirSync(dir);
    for (const entry of entries) {
      const fullPath = join(dir, entry);
      const stat = statSync(fullPath);

      if (stat.isDirectory()) {
        scan(fullPath);
      } else {
        const ext = extname(entry).toLowerCase();
        if (IMAGE_EXTENSIONS.includes(ext)) {
          results.push({
            path: fullPath,
            filename: entry,
            size: stat.size,
            mimeType: getMimeType(ext),
          });
        }
      }
    }
  }

  scan(dirPath);
  return results;
}

export async function importLanFile(
  lanPath: string,
  destDir: string
): Promise<SavedFile> {
  if (!existsSync(lanPath)) {
    throw new Error(`File not found: ${lanPath}`);
  }

  const filename = basename(lanPath);
  const destPath = join(destDir, filename);
  copyFileSync(lanPath, destPath);

  const stat = statSync(lanPath);
  const ext = extname(lanPath).toLowerCase();

  return {
    filename,
    filePath: destPath,
    fileSize: stat.size,
    mimeType: getMimeType(ext),
  };
}

export async function readLanFile(lanPath: string): Promise<Buffer> {
  if (!existsSync(lanPath)) {
    throw new Error(`File not found: ${lanPath}`);
  }
  return readFileSync(lanPath);
}
```

- [ ] **Step 5: Create storage index**

Create `lib/storage/index.ts`:

```typescript
export { saveUploadedFile, type SavedFile } from "./local";
export {
  scanLanDirectory,
  importLanFile,
  readLanFile,
  type ScannedFile,
} from "./lan";
```

- [ ] **Step 6: Run tests to verify they pass**

```bash
npm test -- tests/lib/storage.test.ts
```

Expected: All tests pass.

- [ ] **Step 7: Run all tests**

```bash
npm test
```

Expected: All tests pass.

- [ ] **Step 8: Commit**

```bash
git add -A
git commit -m "feat: add storage abstraction for local files and LAN imports"
```

---

### Task 6: Upload Directory Setup and Next.js Config

**Files:**
- Create: `public/uploads/originals/.gitkeep`, `public/uploads/thumbnails/.gitkeep`, `public/uploads/optimized/.gitkeep`
- Modify: `next.config.ts`
- Modify: `.gitignore`

**Interfaces:**
- Produces: Configured Next.js with image optimization and static file serving for uploads

- [ ] **Step 1: Create upload directories**

```bash
mkdir -p public/uploads/originals public/uploads/thumbnails public/uploads/optimized
touch public/uploads/originals/.gitkeep public/uploads/thumbnails/.gitkeep public/uploads/optimized/.gitkeep
```

- [ ] **Step 2: Configure Next.js**

Replace `next.config.ts`:

```typescript
import type { NextConfig } from "next";

const config: NextConfig = {
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

export default config;
```

- [ ] **Step 3: Update .gitignore for uploads**

Add to `.gitignore`:

```
# Keep directory structure but ignore uploaded files
public/uploads/originals/*
!public/uploads/originals/.gitkeep
public/uploads/thumbnails/*
!public/uploads/thumbnails/.gitkeep
public/uploads/optimized/*
!public/uploads/optimized/.gitkeep
```

- [ ] **Step 4: Verify build works**

```bash
npm run build
```

Expected: Build succeeds without errors.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: configure upload directories and Next.js image optimization"
```

---

## Summary

After completing Phase 1, the project will have:

1. **Next.js 15 project** with TypeScript, Tailwind CSS, Space Grotesk + Instrument Serif fonts
2. **Prisma + SQLite database** with all models (User, Category, Album, Photo, Story, PageView, Setting)
3. **Query layer** with tag/exif serialization helpers
4. **Authentication system** with JWT, bcrypt, middleware route protection
5. **Image processing pipeline** using Sharp (EXIF extraction, thumbnail, optimized WebP)
6. **Storage abstraction** for local uploads and LAN file scanning/importing
7. **Test coverage** for all foundation modules with Vitest
8. **Upload directory structure** with Next.js image optimization configured

The next phases will build on this foundation:
- **Phase 2:** Frontend pages (homepage, albums, photos, stories, about, search)
- **Phase 3:** Backend admin (dashboard, albums, photos, upload, stories, categories, settings)
- **Phase 4:** Docker deployment and E2E testing
