# Afterimage — 摄影作品展示与管理系统设计文档

## 概述

Afterimage 是一个轻量且高性能的摄影作品展示与管理系统。系统包含面向公众的前台展示（极简、极致加载速度）和面向摄影师的后台管理系统（内容发布、图片批量上传、局域网导入、数据统计、照片故事）。

## 技术栈

- **框架**：Next.js 15 (App Router) + React 19 + TypeScript
- **数据库**：Prisma ORM + SQLite
- **图片处理**：Sharp（缩略图生成、格式转换、EXIF 提取）
- **样式**：Tailwind CSS
- **认证**：Cookie + JWT（简单密码认证）
- **图片优化**：Next.js Image 组件 + 自定义 loader
- **测试**：Vitest（单元）+ Playwright（E2E）
- **部署**：单机部署，PM2 守护进程

## 架构

```
Afterimage/
├── app/                      # Next.js App Router
│   ├── (public)/             # 前台展示（路由组）
│   │   ├── page.tsx          # 首页 - 紧凑文字 hero + 作品网格
│   │   ├── category/[slug]/  # 分类页 - 相册网格卡片
│   │   ├── album/[slug]/     # 相册详情 - 瀑布流 + 灯箱
│   │   ├── photo/[id]/       # 单图详情 - 大图 + EXIF
│   │   ├── stories/          # 故事列表
│   │   ├── stories/[slug]/   # 故事详情
│   │   ├── about/            # 关于页
│   │   └── search/           # 搜索页
│   ├── admin/                # 后台管理
│   │   ├── layout.tsx        # 后台布局 + 认证守卫
│   │   ├── page.tsx          # 仪表盘 - 数据统计
│   │   ├── albums/           # 相册管理
│   │   ├── photos/           # 图片管理
│   │   ├── upload/           # 上传/导入
│   │   ├── stories/          # 故事管理
│   │   ├── categories/       # 分类管理
│   │   └── settings/         # 站点设置
│   ├── api/                  # API Routes
│   │   ├── auth/             # 登录/登出
│   │   ├── upload/           # 图片上传
│   │   ├── import/           # 局域网导入
│   │   └── stats/            # 统计数据
│   └── layout.tsx            # 根布局
├── lib/                      # 共享逻辑
│   ├── db/                   # Prisma client & queries
│   ├── auth/                 # 认证逻辑
│   ├── image/                # 图片处理（Sharp）
│   └── storage/              # 存储抽象（本地 + LAN）
├── prisma/
│   └── schema.prisma         # 数据模型
├── public/
│   └── uploads/              # 本地图片存储
│       ├── originals/        # 原图（按年月分目录）
│       ├── thumbnails/       # 缩略图（400px，WebP）
│       └── optimized/        # 优化图（1920px，WebP）
├── middleware.ts             # 后台路由认证守卫
└── next.config.ts
```

## 数据模型

```prisma
// 用户（管理员）
model User {
  id        String   @id @default(cuid())
  username  String   @unique
  password  String   // bcrypt 哈希
  createdAt DateTime @default(now())
}

// 分类（用户自定义，如 "旅行"、"人像"、"街拍"）
model Category {
  id        String   @id @default(cuid())
  name      String   @unique
  slug      String   @unique
  sortOrder Int      @default(0)
  albums    Album[]
}

// 相册
model Album {
  id          String   @id @default(cuid())
  title       String
  slug        String   @unique
  description String?
  coverId     String?
  cover       Photo?   @relation("AlbumCover", fields: [coverId], references: [id])
  categoryId  String?
  category    Category? @relation(fields: [categoryId], references: [id])
  sortOrder   Int      @default(0)
  published   Boolean  @default(false)
  photos      Photo[]
  stories     Story[]
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}

// 照片
model Photo {
  id          String   @id @default(cuid())
  title       String?
  description String?
  albumId     String?
  album       Album?   @relation(fields: [albumId], references: [id])
  filename    String   // 原始文件名
  filePath    String   // 本地存储路径
  lanPath     String?  // 局域网原始路径（如从 NAS 导入）
  width       Int
  height      Int
  fileSize    Int      // 字节
  mimeType    String
  thumbPath   String?  // 缩略图路径
  exif        Json?    // { camera, lens, aperture, shutter, iso, focalLength, takenAt }
  tags        String[] @default([])
  sortOrder   Int      @default(0)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}

// 照片故事（未来可拓展为博客）
model Story {
  id          String   @id @default(cuid())
  title       String
  slug        String   @unique
  excerpt     String   // 摘要
  content     String   // Markdown 正文
  coverId     String?
  cover       Photo?   @relation("StoryCover", fields: [coverId], references: [id])
  albumId     String?
  album       Album?   @relation(fields: [albumId], references: [id])
  published   Boolean  @default(false)
  sortOrder   Int      @default(0)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}

// 访问统计
model PageView {
  id        String   @id @default(cuid())
  path      String
  albumId   String?
  photoId   String?
  ip        String?
  userAgent String?
  createdAt DateTime @default(now())
}

// 站点设置
model Setting {
  key   String @id
  value String
}
```

## 前台展示

### 设计风格

Swiss Minimalism — 极简白底，排版驱动，不对称网格，锐利层级。

- **字体**：Space Grotesk（标题）+ Instrument Serif（斜体衬线点缀）
- **配色**：暖纸白 `#f4f2ed` + 近黑 `#0e0e0e` + 赭石点缀 `#a64b2a`
- **签名细节**：纸张噪点纹理、滚动渐入动画、衬线/无衬线混排
- **参考 mockup**：`mockups/design-b-v2.html`

### 页面

| 路由 | 页面 | 渲染方式 |
|------|------|----------|
| `/` | 首页 - 紧凑文字 hero + 作品网格 | SSG + ISR |
| `/category/[slug]` | 分类页 - 相册网格卡片 | SSG + ISR |
| `/album/[slug]` | 相册详情 - 瀑布流 + 灯箱 | SSG + ISR |
| `/photo/[id]` | 单图详情 - 大图 + EXIF 信息 | SSG + ISR |
| `/stories` | 故事列表 - 卡片式（封面 + 标题 + 摘要） | SSG + ISR |
| `/stories/[slug]` | 故事详情 - Markdown 渲染 + 关联照片 | SSG + ISR |
| `/about` | 关于页 - 摄影师简介 + 器材展示 | SSG |
| `/search` | 搜索页 - 按 tag/标题/分类搜索 | CSR |

### 首页布局

- 紧凑文字 hero：左侧大标题（Space Grotesk + Instrument Serif 斜体混排），右侧描述 + CTA
- 无大封面图，直接引入作品网格
- 作品网格：不对称 12 列网格，不同宽高比交错，hover 显示标题 + EXIF

### 灯箱浏览

- 点击图片打开全屏灯箱
- 左右切换 + 键盘导航（← → / Esc）
- 底部可展开 EXIF 信息面板

### 图片性能优化

- Next.js Image 组件，自动生成多尺寸（640/750/1080/1920）
- 懒加载：viewport 外图片延迟加载
- 渐进式加载：LQIP（低质量占位图）→ 高清图过渡
- 缩略图由 Sharp 预生成，存储在本地
- 格式：WebP 优先

## 后台管理系统

### 认证

- 简单密码认证，JWT 写入 HttpOnly Cookie
- Middleware 守卫 `/admin/*` 路由，未认证跳转登录页
- 登录后返回原页面

### 页面

| 路由 | 页面 | 功能 |
|------|------|------|
| `/admin/login` | 登录页 | 密码认证 |
| `/admin` | 仪表盘 | 访问量、热门作品、相册浏览统计 |
| `/admin/albums` | 相册管理 | CRUD，拖拽排序，设置封面 |
| `/admin/albums/[id]` | 相册编辑 | 管理相册内照片，批量操作 |
| `/admin/photos` | 图片管理 | 所有图片列表，批量编辑、删除 |
| `/admin/upload` | 上传/导入 | 批量上传 + 局域网路径导入 |
| `/admin/stories` | 故事管理 | CRUD，发布/草稿状态 |
| `/admin/stories/[id]` | 故事编辑 | Markdown 编辑器 + 封面选择 + 关联相册 |
| `/admin/categories` | 分类管理 | CRUD |
| `/admin/settings` | 站点设置 | 标题、描述、关于页内容等 |

### 仪表盘统计

- 总访问量、作品数、相册数趋势图
- 热门作品 Top 10（按浏览量）
- 相册浏览量排行
- 近 30 天访问趋势

### 后台 UI 风格

- 延续前台 Swiss 风格，但更功能化
- 左侧固定侧边栏导航，右侧主内容区
- 表格/网格切换视图
- 批量选择 + 操作工具栏

## 图片处理与存储

### 存储结构

```
public/uploads/
├── originals/          # 原图（按年月分目录）
│   └── 2024/11/
│       └── {cuid}.jpg
├── thumbnails/         # 缩略图（400px 宽）
│   └── 2024/11/
│       └── {cuid}.webp
└── optimized/          # 优化图（1920px 宽，WebP）
    └── 2024/11/
        └── {cuid}.webp
```

### Sharp 处理流水线

1. 读取原图 → 提取 EXIF（相机、镜头、光圈、快门、ISO、焦距、拍摄时间）
2. 获取尺寸 → 写入数据库
3. 生成缩略图（400px 宽，WebP，quality 75）
4. 生成优化图（max 1920px 宽，WebP，quality 80）
5. 清除 EXIF 后存储（隐私 + 减小体积）

### 局域网文件处理

- 支持输入路径：`/mnt/nas/photos/`（先支持本地挂载路径，SMB 协议后续扩展）
- 扫描目录：递归查找 `.jpg/.jpeg/.png/.webp/.raw` 文件
- 预览选择：展示缩略图网格，勾选要导入的文件
- 两种模式：
  - **复制到本地**：复制到 `public/uploads/originals/`，独立管理
  - **直接引用**：记录 `lanPath`，通过 API 代理读取展示（不复制）

## 测试

- **单元测试**：Vitest — 图片处理、EXIF 提取、认证逻辑、数据查询
- **E2E 测试**：Playwright — 关键用户流程（前台浏览、后台上传、登录认证）
- **测试覆盖重点**：图片处理流水线、局域网导入、认证守卫

## 错误处理

- 上传失败：保留已成功项，失败项单独标记可重试
- 图片处理异常：记录错误日志，原图保留不删除
- 局域网路径不可达：友好提示 + 重试按钮
- 认证过期：跳转登录页，登录后返回原页面

## 性能优化

- 前台页面 SSG + ISR（每 5 分钟重新生成）
- 图片 CDN 化：Next.js Image 自动多尺寸 + 格式协商
- 数据库索引：slug、albumId、categoryId、createdAt
- API 响应缓存：统计数据缓存 5 分钟

## 部署

### Docker 部署（主要方式）

- 多阶段 Dockerfile：`deps` → `builder` → `runner`，最终镜像仅含运行时产物
- `docker-compose.yml` 一键启动，包含：
  - 卷挂载：SQLite 数据库文件 + `public/uploads/` 持久化
  - 局域网文件访问：挂载 NAS/共享目录到容器内路径（如 `/mnt/nas`）
  - 环境变量通过 `.env` 或 `environment` 注入
- 示例：
  ```yaml
  services:
    afterimage:
      build: .
      ports:
        - "3000:3000"
      volumes:
        - ./data:/app/data           # SQLite 数据库
        - ./uploads:/app/public/uploads  # 图片存储
        - /mnt/nas/photos:/mnt/nas:ro   # 局域网文件（只读）
      env_file: .env
      restart: unless-stopped
  ```

### 单机部署（备选）

- `npm run build && npm start`，PM2 守护进程
- SQLite 文件 + uploads 目录需定期备份

### 环境变量

| 变量 | 说明 | 示例 |
|------|------|------|
| `DATABASE_URL` | SQLite 数据库路径 | `file:./data/afterimage.db` |
| `JWT_SECRET` | JWT 签名密钥 | 随机字符串 |
| `ADMIN_USERNAME` | 管理员用户名 | `admin` |
| `ADMIN_PASSWORD` | 管理员密码（bcrypt 哈希） | `$2b$10$...` |
