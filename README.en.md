# Afterimage

A lightweight, high-performance photography portfolio and management system.

## Features

- **Public Frontend**: Swiss Minimalism design, asymmetric grid layout, lightbox viewer, EXIF display, full-text search
- **Admin Backend**: Dashboard analytics, album/photo/story/category CRUD, batch upload, LAN file import
- **Image Processing**: Sharp-powered thumbnail and optimized image generation, WebP format, EXIF extraction
- **Deployment**: Multi-stage Docker build, one-command `docker compose up`

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 15 (App Router) + React 19 + TypeScript |
| Database | Prisma 7 + SQLite |
| Image Processing | Sharp |
| Auth | JWT (jose) + bcryptjs + HttpOnly Cookie |
| Styling | Tailwind CSS v3 |
| Fonts | Space Grotesk + Instrument Serif |
| Testing | Vitest |

## Quick Start

### Docker (Recommended)

1. Create `.env`:

```bash
cp .env.example .env
```

Edit the configuration:

```env
DATABASE_URL="file:./data/afterimage.db"
JWT_SECRET="your-random-secret"
ADMIN_USERNAME="admin"
ADMIN_PASSWORD="your-password"    # plaintext, auto-hashed with bcrypt on seed
```

2. Launch:

```bash
docker compose up -d
```

3. Visit http://localhost:3000

Database migration and seeding run automatically on container startup.

### Local Development

```bash
npm install
cp .env.example .env          # edit config
npx prisma migrate deploy
npx prisma db seed
npm run dev
```

Visit http://localhost:3000 (public) or http://localhost:3000/admin/login (admin).

## Project Structure

```
app/
├── (public)/            # Public pages (ISR, 5-min revalidation)
│   ├── page.tsx         # Home — text hero + photo grid
│   ├── album/[slug]/    # Album detail — masonry + lightbox
│   ├── photo/[id]/      # Photo detail — large image + EXIF
│   ├── category/[slug]/ # Category — album cards
│   ├── stories/         # Stories list + detail
│   ├── about/           # About page
│   └── search/          # Search page
├── admin/               # Admin backend
│   ├── login/           # Login
│   ├── page.tsx         # Dashboard
│   ├── albums/          # Album management
│   ├── photos/          # Photo management
│   ├── upload/          # Upload / LAN import
│   ├── stories/         # Story management
│   ├── categories/      # Category management
│   └── settings/        # Site settings
├── api/                 # API Routes
└── layout.tsx           # Root layout

lib/
├── db/                  # Prisma client + query layer
├── auth/                # JWT + password + session
├── image/               # Sharp image processing
└── storage/             # Local storage + LAN files

prisma/
├── schema.prisma        # Data models
├── seed.ts              # Seed script (admin account + default settings)
└── migrations/          # Database migrations
```

## Environment Variables

| Variable | Description | Example |
|---|---|---|
| `DATABASE_URL` | SQLite database path | `file:./data/afterimage.db` |
| `JWT_SECRET` | JWT signing secret | random string |
| `ADMIN_USERNAME` | Admin username | `admin` |
| `ADMIN_PASSWORD` | Admin password (plaintext or bcrypt hash) | `mypassword` or `$2b$10$...` |

## Docker Volumes

| Volume | Container Path | Purpose |
|---|---|---|
| afterimage-data | `/app/data` | SQLite database persistence |
| afterimage-uploads | `/app/public/uploads` | Uploaded images persistence |
| NAS (optional) | `/mnt/nas:ro` | LAN file import (read-only) |

## Commands

```bash
npm run dev          # Development server
npm run build        # Production build
npm test             # Run tests
npx prisma studio    # Visual database manager
npx prisma migrate deploy   # Run migrations
npx prisma db seed          # Run seed
```

## Design

- **Colors**: Warm paper white `#f4f2ed` + near-black `#0e0e0e` + ochre accent `#a64b2a`
- **Fonts**: Space Grotesk (headings) + Instrument Serif (italic accents)
- **Signature details**: Paper noise texture, scroll reveal animations, serif/sans-serif mix

## License

Private
