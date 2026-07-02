# Afterimage

轻量、高性能的摄影作品展示与管理系统。

## 特性

- **前台展示**：极简 Swiss Minimalism 风格，不对称网格布局，灯箱浏览，EXIF 信息，全文搜索
- **后台管理**：仪表盘统计，相册/照片/故事/分类 CRUD，批量上传，局域网文件导入
- **图片处理**：Sharp 自动生成缩略图与优化图，WebP 格式，EXIF 提取
- **部署**：Docker 多阶段构建，一键 `docker compose up`

## 技术栈

| 层 | 技术 |
|---|---|
| 框架 | Next.js 15 (App Router) + React 19 + TypeScript |
| 数据库 | Prisma 7 + SQLite |
| 图片处理 | Sharp |
| 认证 | JWT (jose) + bcryptjs + HttpOnly Cookie |
| 样式 | Tailwind CSS v3 |
| 字体 | Space Grotesk + Instrument Serif |
| 测试 | Vitest |

## 快速开始

### Docker 部署（推荐）

1. 创建 `.env` 文件：

```bash
cp .env.example .env
```

修改 `.env` 中的配置：

```env
DATABASE_URL="file:./data/afterimage.db"
JWT_SECRET="你的随机密钥"
ADMIN_USERNAME="admin"
ADMIN_PASSWORD="你的密码"    # 明文，seed 时自动 bcrypt 哈希
```

2. 启动：

```bash
docker compose up -d
```

3. 访问 http://localhost:3000

容器启动时会自动执行数据库迁移和种子初始化。

### 本地开发

```bash
npm install
cp .env.example .env          # 编辑配置
npx prisma migrate deploy
npx prisma db seed
npm run dev
```

访问 http://localhost:3000（前台）或 http://localhost:3000/admin/login（后台）。

## 项目结构

```
app/
├── (public)/            # 前台页面（ISR，5 分钟重新生成）
│   ├── page.tsx         # 首页 — 文字 hero + 作品网格
│   ├── album/[slug]/    # 相册详情 — 瀑布流 + 灯箱
│   ├── photo/[id]/      # 照片详情 — 大图 + EXIF
│   ├── category/[slug]/ # 分类页 — 相册卡片
│   ├── stories/         # 故事列表 + 详情
│   ├── about/           # 关于页
│   └── search/          # 搜索页
├── admin/               # 后台管理
│   ├── login/           # 登录
│   ├── page.tsx         # 仪表盘
│   ├── albums/          # 相册管理
│   ├── photos/          # 照片管理
│   ├── upload/          # 上传 / 局域网导入
│   ├── stories/         # 故事管理
│   ├── categories/      # 分类管理
│   └── settings/        # 站点设置
├── api/                 # API Routes
└── layout.tsx           # 根布局

lib/
├── db/                  # Prisma client + 查询层
├── auth/                # JWT + 密码 + 会话
├── image/               # Sharp 图片处理
└── storage/             # 本地存储 + 局域网文件

prisma/
├── schema.prisma        # 数据模型
├── seed.ts              # 种子脚本（管理员账号 + 默认设置）
└── migrations/          # 数据库迁移
```

## 环境变量

| 变量 | 说明 | 示例 |
|---|---|---|
| `DATABASE_URL` | SQLite 数据库路径 | `file:./data/afterimage.db` |
| `JWT_SECRET` | JWT 签名密钥 | 随机字符串 |
| `ADMIN_USERNAME` | 管理员用户名 | `admin` |
| `ADMIN_PASSWORD` | 管理员密码（明文或 bcrypt hash） | `mypassword` 或 `$2b$10$...` |

## Docker 卷挂载

| 卷 | 容器路径 | 用途 |
|---|---|---|
| afterimage-data | `/app/data` | SQLite 数据库持久化 |
| afterimage-uploads | `/app/public/uploads` | 上传图片持久化 |
| NAS（可选） | `/mnt/nas:ro` | 局域网文件导入（只读） |

## 常用命令

```bash
npm run dev          # 开发服务器
npm run build        # 生产构建
npm test             # 运行测试
npx prisma studio    # 数据库可视化管理
npx prisma migrate deploy   # 执行迁移
npx prisma db seed          # 执行种子
```

## 设计风格

- **配色**：暖纸白 `#f4f2ed` + 近黑 `#0e0e0e` + 赭石点缀 `#a64b2a`
- **字体**：Space Grotesk（标题）+ Instrument Serif（斜体衬线点缀）
- **签名细节**：纸张噪点纹理、滚动渐入动画、衬线/无衬线混排

## License

Private
