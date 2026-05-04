# LGC-MEDIA-01 — Phase 1 Action Plan

**Project:** Blog Post Management System for Lisa Galea Consulting  
**Target:** Get 10-15 papers live as social proof ASAP  
**Start Date:** May 1, 2026 (TBD)  
**Scope:** Basic blog with category filtering, featured images, author + date  

---

## Phase 1 Blockers — MUST RESOLVE FIRST

These must be done before any frontend coding starts.

### 1. Database Setup
- [ ] **Get Supabase credentials**
  - PostgreSQL connection URI (format: `postgresql://user:password@db.supabase.co:5432/postgres`)
  - Any special config needed for Tokyo region?
  - Confirm database has pgvector extension (needed? check if required)

### 2. Environment Variables
- [ ] Update `.env.local` with:
  ```
  DATABASE_URI=<your-supabase-postgres-url>
  PAYLOAD_SECRET=<generate-strong-random-key>
  CORS_ORIGINS=http://localhost:3000,https://media.lisagalea.com
  CSRF_ORIGINS=http://localhost:3000,https://media.lisagalea.com
  NEXT_PUBLIC_SERVER_URL=https://media.lisagalea.com (production)
  ```

### 3. Local Test
- [ ] Run `npm run dev` from `lcg-media-blog/`
- [ ] Verify Payload admin loads at `http://localhost:3000/admin`
- [ ] Create test post + upload test image
- [ ] Verify data persists in database

### 4. Git + Remote
- [ ] Initialize git repo: `git init`
- [ ] Create `.gitignore` (include `.env.local`, `node_modules/`, `.next/`)
- [ ] Create GitHub repo
- [ ] Push initial commit
- [ ] Add `.env.local` to `.gitignore` (never commit secrets)

---

## Phase 1 Critical Path — Frontend Build

Once blockers cleared, build in this order:

### Task 1: Frontend Blog Layout (2-3 days)
- [ ] Create `/blog` listing page
  - Display all published posts (paginated)
  - Show featured image, title, excerpt, author, date
  - Category filter dropdown
  - Search/filtering by category
- [ ] Create `/blog/[slug]` post detail page
  - Full post body (richText rendered)
  - Author + publish date
  - Featured image with alt text
  - Related posts (optional, Phase 1.5)
- [ ] Create `/` or `/home` hero section (if separate from WordPress)
  - Featured blog posts section
  - CTA to full blog

### Task 2: Styling & Brand (1 day)
- [ ] Apply Lisa Galea brand colors + fonts
- [ ] Responsive design (mobile + desktop)
- [ ] Category badge styling
- [ ] Code syntax highlighting for technical posts (if needed)
- [ ] Tailwind or CSS (TBD)

### Task 3: API Integration (1 day)
- [ ] Payload CMS provides REST API out-of-box at `/api/posts`
- [ ] Create Next.js API routes wrapper (optional, can call Payload directly)
- [ ] Test fetching posts from frontend

### Task 4: Deployment (1 day)
- [ ] Deploy to Vercel
  - Connect GitHub repo
  - Set environment variables
  - Deploy production build
  - Configure domain `media.lisagalea.com`
- [ ] Test live deployment
- [ ] Set up cron job for backups (Supabase handles)

### Task 5: Content Upload (1-2 days)
- [ ] Gather 10-15 papers from backlog
- [ ] Format as markdown or rich text
- [ ] Upload via Payload admin:
  - Title
  - Slug (URL-friendly)
  - Excerpt (max 200 chars)
  - Body (rich text)
  - Featured image
  - Category (Leadership, Strategy, AI & Technology, etc.)
  - Author (Lisa Galea)
  - Publish date
  - Status: Published
- [ ] QA — verify each post displays correctly on live site

---

## Phase 1 Optional (Skip if time is tight)

- [ ] Full-text search across posts
- [ ] Related posts sidebar on detail page
- [ ] Comments (Disqus or Payload native)
- [ ] Social share buttons
- [ ] Newsletter CTA / subscription
- [ ] Sitemap.xml for SEO

---

## Phase 2+ (After Launch)

- [ ] AI agent integration (batch upload papers, generate SEO, optimize excerpts)
- [ ] Make.com webhook for automation
- [ ] Analytics dashboard (track views, engagement)
- [ ] Email digest feature (send new posts to subscribers)
- [ ] Advanced features (tags, authors, reading time)

---

## Data Model (Already Built)

**Posts Collection:**
```
- title (required, text)
- slug (required, unique URL)
- excerpt (required, max 200 chars)
- body (required, rich text editor)
- featuredImage (required, upload to media library)
- imageAlt (required, accessibility)
- category (required, select: Leadership, Strategy, AI & Technology, Behavioural Science, Design, Creative, Resources, Digital & Social)
- author (required, select: Lisa Galea, AI Research, Guest)
- publishedAt (required, date)
- status (select: Draft, Published)
- seoTitle (optional, for SEO metadata)
- seoDescription (optional, max 160 chars)
```

**Media Collection:**
- Handles image uploads for featured images
- Stores at `/public/media/`

---

## Hybrid Human + AI Workflow

**Option A: Manual Entry**
1. Lisa writes post in markdown or Word
2. Pastes/uploads into Payload admin
3. Fills metadata (category, date, image)
4. Click Publish

**Option B: AI-Assisted Batch Upload**
1. Lisa prepares 5 papers as markdown files
2. AI agent reads files + generates:
   - SEO title + description
   - Excerpt (auto-summarized)
   - Category suggestion
3. AI creates posts via Payload API (Phase 2)
4. Lisa reviews + publishes

For Phase 1, recommend **Option A** (faster to launch). Phase 2 can add AI agent batch processing.

---

## Success Criteria

Phase 1 is complete when:
- [ ] 10-15 papers live on `media.lisagalea.com`
- [ ] Blog displays with categories, filtering, featured images
- [ ] Mobile responsive
- [ ] Accessible (alt text, semantic HTML)
- [ ] Deployed to production
- [ ] SEO basics in place (metadata, sitemap)

---

## Estimated Timeline

| Task | Est. Days | Notes |
|---|---|---|
| Blockers (DB, env, git) | 0.5 | Depends on how fast you provide credentials |
| Frontend build | 3 | Listing + detail + styling |
| API integration | 1 | Payload API is built-in |
| Deployment | 1 | Vercel setup |
| Content upload | 2 | 10-15 papers |
| **Total** | **~7 days** | Assumes focused work + decisions made quickly |

**Reality:** More like 10-14 days with back-and-forth on design/content.

---

## Contacts / Resources

- **Payload CMS Docs:** https://payloadcms.com/docs
- **Next.js Docs:** https://nextjs.org/docs
- **Vercel Deployment:** https://vercel.com/docs

---

**Next Step:** Provide PostgreSQL credentials → unblock blockers → kickoff frontend build.
