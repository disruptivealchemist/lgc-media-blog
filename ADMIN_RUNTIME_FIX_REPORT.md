# Admin Runtime Fix Report

Date: 2026-05-06  
Project: `lcg-media-blog`  
Repository: `https://github.com/disruptivealchemist/lgc-media-blog`  
Live URL: `https://lgc-media-blog.vercel.app`  
Deployment target: Vercel  
Database: Supabase Postgres  
Final outcome: `/admin` and `/admin/login` return `200 OK`.

## Executive Summary

After the initial Vercel build was fixed and the homepage went live, the Payload admin route still failed at runtime. The public homepage loaded, but clicking the admin link showed:

```text
This page couldn't load
A server error occurred. Reload to try again.
```

The build was green, so this was no longer a compile/deploy problem. It was a runtime initialization problem in the Payload admin path.

The issue had multiple layers:

- Vercel could not resolve the direct Supabase database hostname.
- The Supabase pooler URL then exposed an SSL certificate verification issue.
- Payload admin server functions were being passed to a client boundary without a proper Next server action wrapper.
- The existing Supabase database tables were empty but used an older camelCase Payload schema, while the current Payload v3 Drizzle schema expected snake_case columns.

All known runtime blockers were resolved and verified on the live Vercel deployment.

## Timeline

### 1. Build Was Green, Admin Was Broken

The site loaded at `/`, showing the `Blog CMS` screen and the `Go to Admin Panel` link.

Clicking the link to `/admin` failed with a generic server error.

### 2. Vercel Logs Confirmed Database DNS Failure

Recent production logs were inspected with Vercel CLI. The first runtime error was:

```text
Error: cannot connect to Postgres. Details: getaddrinfo ENOTFOUND db.fnckqpljkkpoqynxjraj.supabase.co
```

This showed that Vercel could not resolve/connect to the direct Supabase database host:

```text
db.<project-ref>.supabase.co:5432
```

### 3. Vercel DATABASE_URI Was Moved to Supabase Pooler

The local Supabase CLI cache contained the pooler host:

```text
aws-1-ap-northeast-2.pooler.supabase.com
```

Vercel Production `DATABASE_URI` was updated to use the Supabase pooler URL instead of the direct DB URL.

Important: the report intentionally does not store the database password or full connection string.

Expected production shape:

```text
postgresql://postgres.<project-ref>:<password>@aws-1-ap-northeast-2.pooler.supabase.com:5432/postgres?sslmode=no-verify
```

### 4. SSL Certificate Error Appeared

After switching to the pooler URL and redeploying, the DNS error was gone. The next Vercel log error was:

```text
SELF_SIGNED_CERT_IN_CHAIN
self-signed certificate in certificate chain
```

The `pg` driver supports `sslmode=no-verify`, so the Vercel `DATABASE_URI` was updated from `sslmode=require` to:

```text
sslmode=no-verify
```

That resolved the certificate chain failure for the Vercel runtime.

### 5. Payload Server Action Error Was Reproduced Locally

After database connectivity was working, local production reproduction showed a Next/Payload admin error:

```text
Functions cannot be passed directly to Client Components unless you explicitly expose it by marking it with "use server".
```

The admin layout was passing `handleServerFunctions` directly into Payload's `RootLayout`. That function crosses into client-rendered admin components and must be exposed as a server action.

### 6. Server Action Wrapper Was Added

Added:

```text
src/app/(payload)/serverFunctions.ts
```

with:

```ts
'use server'

import config from '@payload-config'
import { handleServerFunctions } from '@payloadcms/next/layouts'
import type { ServerFunctionClient } from 'payload'
import { importMap } from './admin/importMap.js'

export const serverFunction: ServerFunctionClient = async args =>
  handleServerFunctions({
    ...args,
    config,
    importMap,
  })
```

Updated:

```text
src/app/(payload)/layout.tsx
```

to pass `serverFunction={serverFunction}` instead of passing `handleServerFunctions` directly.

### 7. Database Schema Mismatch Was Found

After the server action issue, the next local production error was a database schema mismatch:

```text
column users_sessions.created_at does not exist
Perhaps you meant to reference the column "users_sessions.createdAt".
```

The live Supabase tables existed, but they used older camelCase columns such as:

```text
createdAt
updatedAt
resetPasswordToken
loginAttempts
```

The current generated Payload/Drizzle schema expected snake_case columns such as:

```text
created_at
updated_at
reset_password_token
login_attempts
```

The affected tables were inspected and had zero rows:

```text
media: 0
posts: 0
users: 0
users_sessions: 0
```

Because there was no content or user data to preserve yet, the empty old Payload tables were dropped and Payload was allowed to create the current v3 schema cleanly.

Dropped empty tables:

```sql
drop table if exists users_sessions, users, posts, media cascade;
```

Then Payload dev mode was run against the Supabase pooler and `/admin/login` was requested once. Payload created the current schema successfully.

### 8. Final Deployment

The server action fix was committed and pushed:

```text
e741c57 Fix Payload admin server action
```

Vercel deployed the new commit to Production.

Live verification then showed:

```text
https://lgc-media-blog.vercel.app/admin        200 OK
https://lgc-media-blog.vercel.app/admin/login  200 OK
```

No recent Vercel production error logs were present after the final check.

## Git Commits Related to the Session

```text
463e581 Fix Vercel Payload deployment setup
f5d36d4 Doc: Add comprehensive deployment fix report
e741c57 Fix Payload admin server action
```

The latest checked state was:

```text
main...origin/main
```

with no local uncommitted changes at the end of the fix.

## Files Changed

### Initial Deployment Setup

- `next.config.ts`
- `package.json`
- `package-lock.json`
- `tsconfig.json`
- `.gitignore`
- `.env.example`
- `src/app/(payload)/layout.tsx`
- `src/app/(payload)/admin/[[...segments]]/page.tsx`
- `src/app/(payload)/admin/[[...segments]]/not-found.tsx`
- `src/app/(payload)/admin/importMap.js`
- `src/app/(payload)/api/[...slug]/route.ts`
- `src/app/(payload)/graphql/route.ts`
- `src/app/(payload)/graphql-playground/route.ts`
- `src/app/(payload)/custom.scss`
- `src/payload-next.d.ts`
- deleted `src/server.ts`

### Admin Runtime Fix

- `src/app/(payload)/layout.tsx`
- `src/app/(payload)/serverFunctions.ts`
- `.gitignore`

## Vercel Configuration Changes

The Vercel project was linked locally, creating `.vercel`. This folder is ignored and should not be committed.

Added to `.gitignore`:

```text
.vercel
```

Vercel Production `DATABASE_URI` was updated to use Supabase's pooler and `sslmode=no-verify`.

Recommended Production environment variables:

```text
DATABASE_URI=<Supabase pooler URL, not direct DB URL>
PAYLOAD_SECRET=<strong secret>
NEXT_PUBLIC_SERVER_URL=https://lgc-media-blog.vercel.app
CORS_ORIGINS=https://lgc-media-blog.vercel.app
CSRF_ORIGINS=https://lgc-media-blog.vercel.app
```

For local development, `.env.local` should contain real values. `.env.example` must contain placeholders only.

## Supabase Notes

The direct host format:

```text
db.<project-ref>.supabase.co:5432
```

failed from Vercel with DNS resolution errors.

Use the pooler for Vercel/serverless runtime:

```text
aws-1-ap-northeast-2.pooler.supabase.com:5432
```

The project currently uses:

```text
sslmode=no-verify
```

because `sslmode=require` caused `SELF_SIGNED_CERT_IN_CHAIN` in Vercel's Node runtime.

Future schema changes should be handled deliberately. During this incident, dropping tables was acceptable only because the affected Payload tables had zero rows. Once content or users exist, do not drop tables casually.

## Verification Commands

Local build:

```bash
npm run build
```

Local type-check:

```bash
npm run type-check
```

Local production smoke test:

```bash
npm run start
curl -I http://127.0.0.1:3000/admin
curl -I http://127.0.0.1:3000/admin/login
```

Live production smoke test:

```bash
curl -I https://lgc-media-blog.vercel.app/admin
curl -I https://lgc-media-blog.vercel.app/admin/login
```

Vercel logs:

```bash
vercel logs -p lgc-media-blog --environment production --level error --since 10m --limit 20 --expand --no-branch
```

Recent deployments:

```bash
vercel ls lgc-media-blog
```

## Future Build Guardrails

### 1. Do Not Reintroduce `src/server.ts`

This project should deploy as a standard Next + Payload App Router app on Vercel.

Do not reintroduce:

```text
src/server.ts
express
dotenv
next custom server startup
```

### 2. Keep Payload Routes in App Router

Payload needs these route surfaces:

```text
/admin
/api/[...slug]
/graphql
/graphql-playground
```

If these files are removed or renamed, the admin/API runtime will break.

### 3. Regenerate Import Map After Admin/Field Changes

Run:

```bash
npm run generate:importmap
```

when adding or changing Payload admin components, rich text features, custom fields, or admin UI imports.

### 4. Keep Server Functions Behind `'use server'`

Do not pass `handleServerFunctions` directly to Payload's `RootLayout`.

Use:

```text
src/app/(payload)/serverFunctions.ts
```

as the stable server action wrapper.

### 5. Use Supabase Pooler on Vercel

For Vercel Production, use Supabase pooler URL, not the direct database hostname.

Expected shape:

```text
postgresql://postgres.<project-ref>:<password>@<region>.pooler.supabase.com:5432/postgres?sslmode=no-verify
```

### 6. Never Commit Secrets

Safe:

```text
.env.example
```

with blanks/placeholders.

Private:

```text
.env.local
Vercel dashboard environment variables
```

Before committing, run a simple scan:

```bash
rg "postgresql://|DATABASE_URI=.+|PAYLOAD_SECRET=.+" -n . -g '!node_modules' -g '!.next' -g '!.git' -g '!package-lock.json'
```

### 7. Treat Schema Drift Carefully

Payload v3 expects snake_case database columns. If errors mention missing `created_at` but suggest `createdAt`, the database likely has an older Payload schema.

If tables are empty, a reset may be acceptable.

If tables contain real content or users, create a migration instead. Do not drop tables with production content.

### 8. After Every Deploy, Test More Than the Homepage

The homepage can work while admin is broken. Always test:

```text
/
/admin
/admin/login
/api/users/me
```

Expected:

- `/` returns `200`
- `/admin` returns `200` or redirects/loads admin UI
- `/admin/login` returns `200`
- `/api/users/me` should return a Payload JSON response, even if unauthenticated

## Known Non-Blocking Warning

Payload logs:

```text
No email adapter provided. Email will be written to console.
```

This is not currently breaking admin access. It means password reset and email-based flows will write emails to logs/console until an email adapter is configured.

Before relying on email in production, configure a real Payload email adapter.

## References Checked

- Supabase changelog: `https://supabase.com/changelog`
- Payload package/runtime types in `node_modules/@payloadcms/next`
- `pg` / `pg-connection-string` behavior for `sslmode=no-verify`

