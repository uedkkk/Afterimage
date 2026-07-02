# Phase 3: Backend Admin Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the complete admin backend — layout, login, dashboard, CRUD for albums/photos/stories/categories/settings, plus upload/import.

**Architecture:** Server Components for data fetching, API Routes for mutations, Client Components for interactivity. Admin layout uses left sidebar + right content area. Middleware already protects `/admin/*`. All mutations call `revalidatePath`.

**Tech Stack:** Next.js 15.5.19, React 19, TypeScript, Tailwind v3, Prisma 7 + SQLite, Sharp, bcryptjs, jose

## Global Constraints

- Prisma types from `@/lib/generated/prisma/client` (NOT `@prisma/client`)
- `db` singleton from `@/lib/db`
- SQLite stores `tags`/`exif` as JSON strings — query layer serializes
- Tailwind colors: `bg`(#f4f2ed), `paper`(#faf8f4), `ink`(#0e0e0e), `dim`(#6c6a64), `faint`(#d8d5cd), `accent`(#a64b2a)
- Fonts: `font-display`(Space Grotesk), `font-serif`(Instrument Serif)
- `slugify()`, `cn()`, `formatDate()` from `@/lib/utils`
- API routes must call `getSession()` and return 401 if unauthenticated
- After mutations: `revalidatePath("/", "layout")` + affected route paths
- `processImage(filePath, outputDir, id)` returns `{ width, height, fileSize, mimeType, thumbPath, optimizedPath, exif }` — filesystem paths; convert to web paths by replacing `public` with ``
- `saveUploadedFile(file, destDir)` returns `{ filename, filePath, fileSize, mimeType }`
- `scanLanDirectory(dirPath)` returns `ScannedFile[]` with `{ path, filename, size, mimeType }`
- `importLanFile(lanPath, destDir)` returns `SavedFile` with `{ filename, filePath, fileSize, mimeType }`
- No third-party UI library — Tailwind + raw React only
- Responsive: `px-4 md:px-10` for admin content padding

## File Structure

```
app/admin/
├── layout.tsx              # Wraps in AdminShell
├── page.tsx                # Dashboard
├── login/page.tsx          # Login (client component)
├── albums/
│   ├── page.tsx            # Album list
│   ├── new/page.tsx        # Create album
│   ├── [id]/page.tsx       # Edit album + photos
│   ├── AlbumForm.tsx       # Shared form (client)
│   └── [id]/AlbumPhotosManager.tsx
├── photos/
│   ├── page.tsx            # Photo list with pagination
│   ├── [id]/page.tsx       # Edit photo
│   ├── PhotoTable.tsx      # Table with bulk select (client)
│   └── PhotoEditForm.tsx   # Edit form (client)
├── upload/
│   └── page.tsx            # Upload + LAN import (client)
├── stories/
│   ├── page.tsx            # Story list
│   ├── new/page.tsx        # Create story
│   ├── [id]/page.tsx       # Edit story
│   ├── StoryForm.tsx       # Shared form (client)
│   └── MarkdownEditor.tsx  # Editor with preview (client)
├── categories/
│   ├── page.tsx            # List
│   └── CategoryManager.tsx # Inline CRUD (client)
└── settings/
    └── page.tsx            # Settings form (client)

components/admin/
├── AdminShell.tsx          # Conditional sidebar wrapper (client)
├── Sidebar.tsx             # Left nav (client)
├── StatCard.tsx            # Dashboard stat
├── ConfirmDialog.tsx       # Delete confirmation (client)
├── EmptyState.tsx          # Empty state
└── Pagination.tsx          # Page navigation

app/api/admin/
├── categories/route.ts     # CRUD API
├── albums/route.ts         # CRUD API
├── albums/cover/route.ts   # Set cover
├── photos/route.ts         # Update/delete/bulk
└── upload/route.ts         # Upload + LAN import

lib/db/queries.ts           # Extended with admin queries
```

---

### Task 1: Admin Layout, Login, and Shared Components

**Files:**
- Create: `components/admin/AdminShell.tsx`, `components/admin/Sidebar.tsx`, `components/admin/ConfirmDialog.tsx`, `components/admin/EmptyState.tsx`, `components/admin/Pagination.tsx`
- Create: `app/admin/layout.tsx`, `app/admin/login/page.tsx`, `app/admin/page.tsx` (placeholder)
- Test: `tests/admin/login.test.tsx`

**Interfaces:**
- Consumes: `getSession()`, `destroySession()`, `authenticateUser()`, `createSession()` from `@/lib/auth/session`
- Produces: `AdminShell`, `Sidebar`, `ConfirmDialog`, `EmptyState`, `Pagination` components

- [ ] **Step 1: Create AdminShell** — Client component. Uses `usePathname()`. If path is `/admin/login`, render children bare. Otherwise render `<div className="flex min-h-screen bg-bg"><Sidebar /><main className="flex-1 overflow-auto px-4 py-8 md:px-10 md:py-10">{children}</main></div>`.

- [ ] **Step 2: Create Sidebar** — Client component. Nav items: 仪表盘(`/admin`,exact), 相册(`/admin/albums`), 照片(`/admin/photos`), 上传(`/admin/upload`), 故事(`/admin/stories`), 分类(`/admin/categories`), 设置(`/admin/settings`). Active link: `bg-ink text-bg`. Inactive: `text-dim hover:bg-faint hover:text-ink`. Sidebar is `sticky top-0 h-screen w-16 md:w-56 border-r border-faint bg-paper`. Bottom section: "查看前台 ↗" (external link to `/`) and logout form (POST to `/api/auth/logout`). Mobile: show first character of label only (`hidden md:inline` / `md:hidden`).

- [ ] **Step 3: Create ConfirmDialog** — Client component. Props: `{ trigger, title, description?, confirmLabel?, cancelLabel?, onConfirm, variant? }`. Renders trigger as clickable span. On click, shows modal overlay (`fixed inset-0 z-50 bg-ink/40`) with dialog card (`bg-paper p-6 rounded-lg max-w-sm`). Confirm button: `bg-ink` or `bg-accent` for danger variant. Has loading state.

- [ ] **Step 4: Create EmptyState** — Props: `{ title, description?, action? }`. Centered: `py-20 text-center`.

- [ ] **Step 5: Create Pagination** — Props: `{ currentPage, totalPages, basePath }`. Returns null if `totalPages <= 1`. Renders prev/next links + page numbers with ellipsis. Uses Next.js `Link`. Active page: `bg-ink text-bg`. Inactive: `border border-faint text-dim hover:bg-paper`.

- [ ] **Step 6: Create admin layout** — `app/admin/layout.tsx` imports `AdminShell` and wraps children.

- [ ] **Step 7: Create login page** — Client component. Form with username/password inputs. On submit, POSTs to `/api/auth/login`. On success, `router.push(redirectPath)` + `router.refresh()`. Reads `redirect` from `searchParams`. Styled: centered card on `bg-bg`, max-w-sm. Title "Afterimage" in `font-display text-3xl font-bold`. Inputs: `border border-faint bg-paper px-3 py-2 rounded-md`. Submit: `bg-ink text-bg`. Link "← 返回前台" to `/`.

- [ ] **Step 8: Create placeholder dashboard** — Simple page with `<h1>仪表盘</h1>` and placeholder text. Will be replaced in Task 2.

- [ ] **Step 9: Write login test** — Mock `next/navigation` (`useRouter`, `useSearchParams`). Render `LoginPage`. Assert "Afterimage" text, "用户名" label, "密码" label, "登录" button exist.

- [ ] **Step 10: Run `npm test && npx tsc --noEmit && npm run lint`** — All pass.

- [ ] **Step 11: Commit** — `feat: add admin layout, login page, and shared admin components`

---

### Task 2: Dashboard with Statistics

**Files:**
- Modify: `lib/db/queries.ts` (add stats queries)
- Create: `components/admin/StatCard.tsx`
- Modify: `app/admin/page.tsx` (replace placeholder)
- Test: `tests/admin/dashboard.test.ts`

**Interfaces:**
- Produces: `getDashboardStats(): Promise<DashboardStats>`, `getPopularPhotos(limit?): Promise<PopularPhoto[]>`, `getAlbumViewStats(limit?): Promise<AlbumViewStat[]>`

- [ ] **Step 1: Add stats queries to `lib/db/queries.ts`**

```typescript
export interface DashboardStats {
  totalPhotos: number;
  totalAlbums: number;
  totalStories: number;
  totalViews: number;
  publishedAlbums: number;
  recentViews: { date: string; count: number }[];
}

export async function getDashboardStats(): Promise<DashboardStats> {
  const [totalPhotos, totalAlbums, totalStories, publishedAlbums, totalViews, recentPageViews] =
    await Promise.all([
      db.photo.count(),
      db.album.count(),
      db.story.count(),
      db.album.count({ where: { published: true } }),
      db.pageView.count(),
      db.pageView.findMany({
        where: { createdAt: { gte: new Date(Date.now() - 30 * 86400000) } },
        select: { createdAt: true },
      }),
    ]);
  const viewMap = new Map<string, number>();
  for (const pv of recentPageViews) {
    const key = pv.createdAt.toISOString().slice(0, 10);
    viewMap.set(key, (viewMap.get(key) || 0) + 1);
  }
  const recentViews = Array.from({ length: 30 }, (_, i) => {
    const d = new Date(Date.now() - (29 - i) * 86400000);
    const key = d.toISOString().slice(0, 10);
    return { date: key, count: viewMap.get(key) || 0 };
  });
  return { totalPhotos, totalAlbums, totalStories, totalViews, publishedAlbums, recentViews };
}

export interface PopularPhoto { photo: PhotoWithTags; views: number; }

export async function getPopularPhotos(limit = 10): Promise<PopularPhoto[]> {
  const results = await db.pageView.groupBy({
    by: ["photoId"], where: { photoId: { not: null } },
    _count: { photoId: true }, orderBy: { _count: { photoId: "desc" } }, take: limit,
  });
  const photos = await Promise.all(
    results.filter((r) => r.photoId).map(async (r) => {
      const photo = await getPhotoById(r.photoId!);
      return photo ? { photo, views: r._count.photoId } : null;
    })
  );
  return photos.filter((p): p is PopularPhoto => p !== null);
}

export interface AlbumViewStat { album: Album; views: number; }

export async function getAlbumViewStats(limit = 10): Promise<AlbumViewStat[]> {
  const results = await db.pageView.groupBy({
    by: ["albumId"], where: { albumId: { not: null } },
    _count: { albumId: true }, orderBy: { _count: { albumId: "desc" } }, take: limit,
  });
  const stats = await Promise.all(
    results.filter((r) => r.albumId).map(async (r) => {
      const album = await db.album.findUnique({ where: { id: r.albumId! } });
      return album ? { album, views: r._count.albumId } : null;
    })
  );
  return stats.filter((s): s is AlbumViewStat => s !== null);
}
```

- [ ] **Step 2: Create StatCard** — Props: `{ label, value, hint? }`. Card: `rounded-lg border border-faint bg-paper p-5`. Label: `text-sm text-dim`. Value: `font-display text-3xl font-bold text-ink`. Hint: `text-xs text-dim`.

- [ ] **Step 3: Create dashboard page** — `export const dynamic = "force-dynamic"`. Fetches stats, popular photos (5), album stats (5). Layout: 4 StatCards in grid (`grid-cols-2 md:grid-cols-4 gap-4`). 30-day bar chart: flex container with bars (`flex-1 rounded-t bg-ink/20 hover:bg-ink/40`), height proportional to `count/maxViews`. Popular photos list: ranked links to `/admin/photos/[id]`. Album stats: ranked links to `/admin/albums/[id]`. Use `EmptyState` for empty sections.

- [ ] **Step 4: Write test** — Test `getDashboardStats()` returns correct shape with `recentViews` array of length 30. Clean up in `afterAll` with `db.$disconnect()`.

- [ ] **Step 5: Run tests, typecheck, lint** — All pass.

- [ ] **Step 6: Commit** — `feat: add admin dashboard with stats and charts`

---

### Task 3: Category Management

**Files:**
- Modify: `lib/db/queries.ts` (add `getAllCategoriesAdmin`, `updateCategory`, `deleteCategory`)
- Create: `app/api/admin/categories/route.ts`
- Create: `app/admin/categories/page.tsx`, `app/admin/categories/CategoryManager.tsx`
- Test: `tests/admin/categories.test.ts`

- [ ] **Step 1: Add admin category queries**

```typescript
export async function getAllCategoriesAdmin(): Promise<(Category & { _count: { albums: number } })[]> {
  return db.category.findMany({
    include: { _count: { select: { albums: true } } },
    orderBy: { sortOrder: "asc" },
  });
}

export async function updateCategory(id: string, data: { name?: string; slug?: string; sortOrder?: number }): Promise<Category | null> {
  return db.category.update({ where: { id }, data });
}

export async function deleteCategory(id: string): Promise<void> {
  await db.category.delete({ where: { id } });
}
```

- [ ] **Step 2: Create category API route** — `app/api/admin/categories/route.ts`. POST (create): validates name, calls `createCategory(name, slugify(name))`, revalidates `/` and `/category/[slug]`. PUT (update): calls `updateCategory(id, {name, slug, sortOrder})`. DELETE: calls `deleteCategory(id)`. All check `getSession()` first, return 401 if null.

- [ ] **Step 3: Create category page** — Server component. Fetches `getAllCategoriesAdmin()`. Renders `<h1>分类管理</h1>` + `<CategoryManager initialCategories={categories} />`.

- [ ] **Step 4: Create CategoryManager** — Client component. Inline CRUD. Create form at top: input + "添加" button, POSTs to `/api/admin/categories`. List below: each category shows name, slug, album count, "编辑" and "删除" buttons. Edit mode: inline inputs for name/slug/sortOrder + save/cancel. Delete uses `ConfirmDialog`. All operations call API then `router.refresh()`.

- [ ] **Step 5: Write test** — Test `createCategory` → `updateCategory` → `deleteCategory` cycle. Test `getAllCategoriesAdmin` returns `_count.albums`.

- [ ] **Step 6: Run tests, typecheck, lint** — All pass.

- [ ] **Step 7: Commit** — `feat: add category management with inline CRUD`

---

### Task 4: Album Management

**Files:**
- Modify: `lib/db/queries.ts` (add album admin queries)
- Create: `app/api/admin/albums/route.ts`, `app/api/admin/albums/cover/route.ts`
- Create: `app/admin/albums/page.tsx`, `app/admin/albums/new/page.tsx`, `app/admin/albums/[id]/page.tsx`, `app/admin/albums/AlbumForm.tsx`, `app/admin/albums/[id]/AlbumPhotosManager.tsx`
- Test: `tests/admin/albums.test.ts`

- [ ] **Step 1: Add admin album queries**

```typescript
export async function getAllAlbumsAdmin(): Promise<(Album & { cover: Photo | null; category: Category | null; _count: { photos: number } })[]> {
  return db.album.findMany({
    include: { cover: true, category: true, _count: { select: { photos: true } } },
    orderBy: { createdAt: "desc" },
  });
}

export async function getAlbumByIdAdmin(id: string): Promise<{ album: Album & { cover: Photo | null; category: Category | null }; photos: PhotoWithTags[] } | null> {
  const album = await db.album.findUnique({ where: { id }, include: { cover: true, category: true } });
  if (!album) return null;
  const photos = await getPhotosByAlbum(id);
  return { album, photos };
}

export async function updateAlbum(id: string, data: { title?: string; slug?: string; description?: string; categoryId?: string | null; published?: boolean; sortOrder?: number }): Promise<Album | null> {
  return db.album.update({ where: { id }, data });
}

export async function deleteAlbum(id: string): Promise<void> {
  await db.album.delete({ where: { id } });
}

export async function setAlbumCover(albumId: string, photoId: string | null): Promise<void> {
  await db.album.update({ where: { id: albumId }, data: { coverId: photoId } });
}
```

- [ ] **Step 2: Create album API route** — `app/api/admin/albums/route.ts`. POST: create album (title required, slug auto-generated via `slugify` if empty). PUT: update album by id. DELETE: delete album by id. All check auth, revalidate `/`, `/category/[slug]`, `/album/[slug]`.

- [ ] **Step 3: Create album cover API route** — `app/api/admin/albums/cover/route.ts`. POST with `{ albumId, photoId }`, calls `setAlbumCover`, revalidates.

- [ ] **Step 4: Create album list page** — Server component. Fetches `getAllAlbumsAdmin()`. Header with "新建相册" link. List: each album is a link to `/admin/albums/[id]` showing cover thumb (or placeholder), title, photo count, date, category badge, published/draft badge.

- [ ] **Step 5: Create AlbumForm** — Client component. Props: `{ album?, categories }`. Fields: title (required), slug, description (textarea), category (select), published (checkbox). Submit: POST (create) or PUT (update) to `/api/admin/albums`. Delete button (only in edit mode): DELETE to `/api/admin/albums`. On create success: `router.push("/admin/albums")`. On update: `router.refresh()`.

- [ ] **Step 6: Create new album page** — Server component. Fetches `getAllCategories()`. Renders `<AlbumForm categories={categories} />`.

- [ ] **Step 7: Create album edit page** — Server component. Params: `{ id }`. Fetches `getAlbumByIdAdmin(id)` and `getAllCategories()`. If not found, `notFound()`. Renders `<AlbumForm album={album} categories={categories} />` + `<AlbumPhotosManager albumId={album.id} photos={photos} />`.

- [ ] **Step 8: Create AlbumPhotosManager** — Client component. Props: `{ albumId, photos }`. Grid of photo thumbnails (`grid-cols-3 md:grid-cols-6 gap-3`). On hover: overlay with "封面" (set cover) and "移除" (remove from album) buttons. Set cover: POST to `/api/admin/albums/cover`. Remove: PUT to `/api/admin/photos` with `{ id, albumId: null }`. Both call `router.refresh()`. Empty state if no photos.

- [ ] **Step 9: Write test** — Test create → getAllAlbumsAdmin → getAlbumByIdAdmin → updateAlbum → deleteAlbum cycle.

- [ ] **Step 10: Run tests, typecheck, lint** — All pass.

- [ ] **Step 11: Commit** — `feat: add album management with CRUD and photo management`

---

### Task 5: Photo Management

**Files:**
- Modify: `lib/db/queries.ts` (add photo admin queries)
- Create: `app/api/admin/photos/route.ts`
- Create: `app/admin/photos/page.tsx`, `app/admin/photos/PhotoTable.tsx`, `app/admin/photos/[id]/page.tsx`, `app/admin/photos/PhotoEditForm.tsx`
- Test: `tests/admin/photos.test.ts`

- [ ] **Step 1: Add admin photo queries**

```typescript
export async function getAllPhotosAdmin(limit = 50, offset = 0): Promise<(PhotoWithTags & { album: Album | null })[]> {
  const photos = await db.photo.findMany({
    include: { album: true },
    orderBy: { createdAt: "desc" },
    take: limit, skip: offset,
  });
  return photos.map(serializePhoto);
}

export async function getPhotoCountAdmin(): Promise<number> {
  return db.photo.count();
}

export async function getPhotoByIdAdmin(id: string): Promise<(PhotoWithTags & { album: Album | null }) | null> {
  const photo = await db.photo.findUnique({ where: { id }, include: { album: true } });
  if (!photo) return null;
  return serializePhoto(photo);
}

export async function bulkAssignAlbum(photoIds: string[], albumId: string | null): Promise<void> {
  await db.photo.updateMany({ where: { id: { in: photoIds } }, data: { albumId } });
}

export async function bulkDeletePhotos(photoIds: string[]): Promise<void> {
  await db.photo.deleteMany({ where: { id: { in: photoIds } } });
}
```

Note: `serializePhoto` is the internal function already used in the file that converts `tags`/`exif` from JSON strings. Check the existing code for the exact function name — it may be a local helper. If it's not exported, use the same inline pattern: `JSON.parse(photo.tags || "[]")` and `photo.exif ? JSON.parse(photo.exif) : null`.

- [ ] **Step 2: Create photo API route** — `app/api/admin/photos/route.ts`. PUT: if `photoIds` array present → bulk assign album. Otherwise single update by `id` (title, description, albumId, tags, sortOrder). DELETE: if `photoIds` array → bulk delete. Otherwise single delete by `id`. All check auth, revalidate paths.

- [ ] **Step 3: Create photo list page** — Server component. `searchParams: { page? }`. 30 per page. Fetches `getAllPhotosAdmin(30, offset)`, `getPhotoCountAdmin()`, `getAllAlbumsAdmin()`. Renders header with count + "上传照片" link. Passes photos + albums to `<PhotoTable>`. Uses `<Pagination>`.

- [ ] **Step 4: Create PhotoTable** — Client component. Props: `{ photos, albums }`. Checkbox column with select-all. Columns: thumbnail, title/filename, album name, date, actions (edit link). Bulk action bar appears when selected: "分配相册" (select dropdown) and "删除" (with ConfirmDialog). Bulk operations call API then `router.refresh()`.

- [ ] **Step 5: Create photo edit page** — Server component. Params: `{ id }`. Fetches `getPhotoByIdAdmin(id)` and `getAllAlbumsAdmin()`. If not found, `notFound()`. Renders `<PhotoEditForm photo={photo} albums={albums} />`. Also shows large preview image and EXIF info if available.

- [ ] **Step 6: Create PhotoEditForm** — Client component. Props: `{ photo, albums }`. Fields: title, description (textarea), album (select), tags (comma-separated input). Submit: PUT to `/api/admin/photos`. Delete: DELETE with ConfirmDialog. On success: `router.refresh()` or `router.push("/admin/photos")` for delete.

- [ ] **Step 7: Write test** — Test `getAllPhotosAdmin` returns photos with album relation. Test `bulkAssignAlbum` and `bulkDeletePhotos`. Clean up test data in afterAll.

- [ ] **Step 8: Run tests, typecheck, lint** — All pass.

- [ ] **Step 9: Commit** — `feat: add photo management with bulk operations`

---

### Task 6: Upload and LAN Import

**Files:**
- Create: `app/api/admin/upload/route.ts`
- Create: `app/admin/upload/page.tsx`
- Test: `tests/admin/upload.test.ts`

**Interfaces:**
- Consumes: `saveUploadedFile` from `@/lib/storage`, `processImage` from `@/lib/image/process`, `createPhoto` from `@/lib/db/queries`, `scanLanDirectory`, `importLanFile` from `@/lib/storage/lan`

- [ ] **Step 1: Create upload API route** — `app/api/admin/upload/route.ts`.

POST handler accepts `FormData` with:
- `files`: File[] (multiple files)
- `albumId`: string (optional)

For each file:
1. Save to `public/uploads/originals/` via `saveUploadedFile(file, path.join(process.cwd(), "public/uploads/originals"))`
2. Process via `processImage(savedFile.filePath, path.join(process.cwd(), "public/uploads"), crypto.randomUUID())`
3. Convert filesystem paths to web paths: `thumbPath.replace("public", "")` and `optimizedPath.replace("public", "")`
4. Create photo via `createPhoto({ filename: savedFile.filename, filePath: webOptimizedPath, width, height, fileSize, mimeType, thumbPath: webThumbPath, exif, albumId })`
5. Return `{ success: true, count: N, errors: [] }`

Also handle LAN import mode:
- `lanPath`: string (single file path to import)
- `albumId`: string (optional)
- `mode`: "copy" | "reference"

For "copy" mode: `importLanFile(lanPath, originalsDir)` → process → createPhoto.
For "reference" mode: process the LAN file in-place, store `lanPath` in photo record, use `filePath` pointing to an API proxy route.

GET handler for LAN scan: accepts `?path=`, calls `scanLanDirectory(path)`, returns `{ files: ScannedFile[] }`.

All check `getSession()`, return 401 if null. Revalidate `/`, `/album/[slug]`, `/photo/[id]` after upload.

- [ ] **Step 2: Create upload page** — Client component. Two tabs: "批量上传" and "局域网导入".

Upload tab:
- File input (`<input type="file" multiple accept="image/*">`) styled as drop zone
- Album select dropdown (fetched from `/api/admin/albums` or passed as prop)
- Upload button: creates FormData, POSTs to `/api/admin/upload`
- Progress: show count of uploaded/total, error messages per file
- Success: show "上传成功 N 张" with link to photo management

LAN import tab:
- Path input: `<input type="text" placeholder="/mnt/nas/photos/">`
- Scan button: GET `/api/admin/upload?path=...`
- Results: grid of scanned files with checkboxes
- Import button: POST selected files to `/api/admin/upload` with `lanPath` and `mode` ("copy" or "reference")
- Mode toggle: "复制到本地" vs "直接引用"

- [ ] **Step 3: Write test** — Test upload API route with a mock file (use the existing test fixture `tests/fixtures/test-image.jpg`). Verify photo is created in DB with correct fields. Clean up in afterAll.

- [ ] **Step 4: Run tests, typecheck, lint** — All pass.

- [ ] **Step 5: Commit** — `feat: add photo upload and LAN import`

---

### Task 7: Story Management

**Files:**
- Modify: `lib/db/queries.ts` (add story admin queries)
- Create: `app/api/admin/stories/route.ts`
- Create: `app/admin/stories/page.tsx`, `app/admin/stories/new/page.tsx`, `app/admin/stories/[id]/page.tsx`, `app/admin/stories/StoryForm.tsx`, `app/admin/stories/MarkdownEditor.tsx`
- Test: `tests/admin/stories.test.ts`

- [ ] **Step 1: Add admin story queries**

```typescript
export async function getAllStoriesAdmin(): Promise<(Story & { cover: Photo | null; album: Album | null; _count: never })[]> {
  return db.story.findMany({
    include: { cover: true, album: true },
    orderBy: { createdAt: "desc" },
  });
}

export async function getStoryByIdAdmin(id: string): Promise<(Story & { cover: Photo | null; album: Album | null }) | null> {
  return db.story.findUnique({ where: { id }, include: { cover: true, album: true } });
}

export async function createStory(input: { title: string; slug: string; excerpt: string; content: string; coverId?: string; albumId?: string; published?: boolean }): Promise<Story> {
  return db.story.create({ data: input });
}

export async function updateStory(id: string, data: { title?: string; slug?: string; excerpt?: string; content?: string; coverId?: string | null; albumId?: string | null; published?: boolean }): Promise<Story | null> {
  return db.story.update({ where: { id }, data });
}

export async function deleteStory(id: string): Promise<void> {
  await db.story.delete({ where: { id } });
}
```

- [ ] **Step 2: Create story API route** — `app/api/admin/stories/route.ts`. POST (create): title + excerpt + content required, slug auto-generated if empty. PUT (update): update by id. DELETE: delete by id. All check auth, revalidate `/stories`, `/stories/[slug]`.

- [ ] **Step 3: Create MarkdownEditor** — Client component. Props: `{ value, onChange }`. Two-panel layout: textarea on left, preview on right. Preview renders markdown as formatted text (use simple regex-based rendering: `# ` → h1, `## ` → h2, `**text**` → bold, `*text*` → italic, `- ` → list, `\n\n` → paragraph). No external library — keep it simple. Tabs to switch between "编辑" and "预览" on mobile.

- [ ] **Step 4: Create StoryForm** — Client component. Props: `{ story?, albums, photos }`. Fields: title (required), slug, excerpt (textarea), content (MarkdownEditor), album (select), cover (photo picker — simple select from photos list), published (checkbox). Submit: POST or PUT to `/api/admin/stories`. Delete button with ConfirmDialog.

- [ ] **Step 5: Create story list page** — Server component. Fetches `getAllStoriesAdmin()`. Table/list: title, excerpt preview, album, published/draft badge, date. Links to edit pages.

- [ ] **Step 6: Create new story page** — Server component. Fetches `getAllAlbumsAdmin()` and `getAllPhotosAdmin(100, 0)` for cover selection. Renders `<StoryForm albums={albums} photos={photos} />`.

- [ ] **Step 7: Create story edit page** — Server component. Params: `{ id }`. Fetches `getStoryByIdAdmin(id)`, `getAllAlbumsAdmin()`, `getAllPhotosAdmin(100, 0)`. If not found, `notFound()`. Renders `<StoryForm story={story} albums={albums} photos={photos} />`.

- [ ] **Step 8: Write test** — Test create → getAllStoriesAdmin → getStoryByIdAdmin → updateStory → deleteStory cycle.

- [ ] **Step 9: Run tests, typecheck, lint** — All pass.

- [ ] **Step 10: Commit** — `feat: add story management with markdown editor`

---

### Task 8: Settings Management

**Files:**
- Create: `app/api/admin/settings/route.ts`
- Create: `app/admin/settings/page.tsx`
- Test: `tests/admin/settings.test.ts`

**Interfaces:**
- Consumes: `getAllSettings()`, `setSetting()` from `@/lib/db/queries` (already exist)

- [ ] **Step 1: Create settings API route** — `app/api/admin/settings/route.ts`. GET: returns `getAllSettings()`. PUT: accepts `{ settings: Record<string, string> }`, loops and calls `setSetting(key, value)` for each. Check auth. Revalidate `/`, "layout" (settings affect all pages including Nav, Footer, About).

- [ ] **Step 2: Create settings page** — Client component. Fetches current settings on mount via `GET /api/admin/settings`. Form fields for known settings keys:
  - `site.title` — 站点标题
  - `site.description` — 站点描述
  - `about.content` — 关于页内容 (textarea, supports markdown)
  - `about.gear` — 器材列表 (textarea, one item per line)
  - `nav.title` — 导航栏标题

  Also show any unknown keys from the DB. Submit: PUT to `/api/admin/settings` with all settings. Success message: "设置已保存".

- [ ] **Step 3: Write test** — Test `setSetting` + `getAllSettings` round-trip. Set `test.key` → `test.value`, verify `getAllSettings()` returns it, clean up.

- [ ] **Step 4: Run tests, typecheck, lint** — All pass.

- [ ] **Step 5: Commit** — `feat: add site settings management`
