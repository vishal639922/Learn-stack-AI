# LearnStack AI — Educational Content Platform

A production-ready, SEO-optimized educational platform for AI, Machine Learning, Deep Learning, Computer Science, Research Papers, and Engineering content. Built with Next.js App Router, MongoDB, NextAuth, and Cloudinary.

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | Next.js 16 (App Router), TypeScript, Tailwind CSS v4, ShadCN UI |
| Backend | Next.js API Routes, Node.js |
| Database | MongoDB Atlas + Mongoose |
| Auth | NextAuth v5 (JWT), bcrypt |
| Media | Cloudinary |
| Content | Markdown + syntax highlighting |
| SEO | Dynamic sitemap, robots.txt, JSON-LD, Open Graph |

## Quick Start

```bash
# Install dependencies
npm install

# Copy environment variables
cp .env.example .env.local

# Start development server
npm run dev
```

### Environment Variables

Configure `.env.local` with:

- `MONGODB_URI` — MongoDB Atlas connection string
- `AUTH_SECRET` — Generate with `openssl rand -base64 32`
- `AUTH_URL` — `https://www.hinglearn.in` (production: your domain)
- `CLOUDINARY_*` — Cloudinary credentials
- `ADMIN_EMAIL` — First admin user email
- `NEXT_PUBLIC_SITE_URL` — Public site URL

### Seed Database

```bash
curl -X POST http://localhost:3000/api/seed \
  -H "x-seed-secret: YOUR_AUTH_SECRET"
```

## Project Structure

```
src/
├── app/                    # Next.js App Router pages & API
│   ├── api/               # REST API endpoints
│   │   ├── articles/      # CRUD + featured
│   │   ├── auth/          # NextAuth + register
│   │   ├── categories/    # Category management
│   │   ├── comments/      # Comment system
│   │   ├── search/        # Full-text search
│   │   ├── users/         # Profile, bookmarks, history
│   │   ├── admin/         # Analytics, user management
│   │   ├── upload/        # Cloudinary uploads
│   │   └── newsletter/    # Email subscriptions
│   ├── articles/          # Article listing & detail
│   ├── categories/        # Category pages
│   ├── search/            # Instant search UI
│   ├── dashboard/         # User dashboard
│   ├── admin/             # Admin panel
│   ├── login/             # Authentication
│   ├── sitemap.ts         # Dynamic SEO sitemap
│   └── robots.ts          # Crawler rules
├── components/
│   ├── ui/                # ShadCN primitives
│   ├── layout/            # Header, Footer, Breadcrumbs
│   ├── articles/          # Cards, Markdown, Comments
│   ├── admin/             # Article editor
│   └── home/              # Newsletter, hero sections
├── models/                # Mongoose schemas
├── lib/                   # Utils, SEO, rate limiting
└── config/                # Site & category config
```

## Database Schema

### Users
- `name`, `email`, `password`, `role` (user/admin/editor)
- `avatar`, `bookmarks[]`, `readingHistory[]`, `isPremium`

### Articles
- `title`, `slug`, `excerpt`, `content` (Markdown)
- `featuredImage`, `category`, `tags[]`, `author`
- `views`, `readingTime`, `status`, `isFeatured`, `isSponsored`, `isPremium`
- `publishedDate`, `metaTitle`, `metaDescription`

### Categories
- `name`, `slug`, `description`, `icon`, `color`, `articleCount`

### Comments
- `articleId`, `userId`, `content`, `parentId`, `isApproved`

## API Routes

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/articles` | List articles (paginated, filterable) | Public |
| POST | `/api/articles` | Create article | Admin/Editor |
| GET | `/api/articles/[slug]` | Get article + related | Public |
| PUT | `/api/articles/[slug]` | Update article | Admin/Editor |
| DELETE | `/api/articles/[slug]` | Delete article | Admin |
| GET | `/api/articles/featured` | Featured/trending/latest | Public |
| GET | `/api/categories` | List categories | Public |
| POST | `/api/categories` | Create category | Admin |
| GET | `/api/categories/[slug]` | Category + articles | Public |
| GET | `/api/search` | Full-text search | Public |
| GET/POST | `/api/comments` | List/create comments | Auth for POST |
| GET/PATCH | `/api/users/profile` | User profile | Auth |
| POST | `/api/users/bookmarks` | Toggle bookmark | Auth |
| POST | `/api/users/history` | Record reading history | Auth |
| GET | `/api/admin/analytics` | Dashboard analytics | Admin |
| GET/PATCH | `/api/admin/users` | Manage users | Admin |
| POST | `/api/upload` | Cloudinary image upload | Admin/Editor |
| POST | `/api/newsletter` | Newsletter subscribe | Public |
| POST | `/api/auth/register` | User registration | Public |

## Deployment

### Vercel

1. Push to GitHub
2. Import project in [Vercel](https://vercel.com)
3. Add all environment variables from `.env.example`
4. Deploy

### MongoDB Atlas

1. Create free cluster at [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Create database user and whitelist IP (`0.0.0.0/0` for Vercel)
3. Copy connection string to `MONGODB_URI`

### Cloudinary

1. Create account at [Cloudinary](https://cloudinary.com)
2. Copy Cloud Name, API Key, API Secret to env vars

## Security

- JWT sessions via NextAuth
- bcrypt password hashing (12 rounds)
- Rate limiting (100 req/min API, 10 req/min auth)
- Zod input validation on all endpoints
- XSS sanitization on comments
- Security headers (X-Frame-Options, CSP-ready)
- Role-based access control (user/editor/admin)
- CSRF protection via NextAuth

## SEO Features

- Server-side rendering + ISR (1-hour revalidation)
- Dynamic XML sitemap
- robots.txt with admin/api exclusions
- Open Graph + Twitter Card meta tags
- JSON-LD Article + Breadcrumb schema
- Canonical URLs
- Semantic HTML + breadcrumb navigation

## Monetization Ready

- Google AdSense component (`NEXT_PUBLIC_ADSENSE_CLIENT_ID`)
- Sponsored content flag on articles
- Premium membership architecture (`isPremium` on users/articles)
- Newsletter subscription system

## Performance

- ISR with 3600s revalidation on content pages
- Cloudinary auto-format/quality optimization
- Next.js Image component with lazy loading
- MongoDB connection pooling (global cache)
- Full-text search indexes
- Package import optimization for lucide-react

## License

MIT
