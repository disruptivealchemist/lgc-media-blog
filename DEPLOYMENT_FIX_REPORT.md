# Deployment Fix Report

Date: 2026-05-04  
Project: `lcg-media-blog`  
Repository: `https://github.com/disruptivealchemist/lgc-media-blog`  
Deployment target: Vercel  
Final outcome: Site is live.

## Original Problem

The Vercel deployment failed during TypeScript checking after the Next.js production build compiled successfully.

The reported error was:

```text
./src/server.ts:4:40
Type error: Could not find a declaration file for module 'express'.
```

The immediate surface issue was that TypeScript could not find Express type declarations for `src/server.ts`. The deeper setup issue was that the project was configured like a custom Express server application, while Vercel expects a standard Next.js deployment surface. The Payload CMS admin/API integration for Next App Router was also incomplete, so fixing only `@types/express` would not have produced a complete live Payload deployment.

## Root Cause

The initial setup mixed two deployment models:

- A custom `src/server.ts` Express server running Next manually.
- A Vercel-hosted Next.js app.
- Payload CMS configuration without the required `@payloadcms/next` App Router routes.

This caused Vercel to type-check server code that it should not need to run, and the app did not yet expose Payload's `/admin`, REST API, GraphQL, or GraphQL Playground routes through Next.

## Changes Made

### Converted to Standard Next + Payload Deployment

Added `@payloadcms/next` and wrapped the Next config with Payload's integration:

- Updated `next.config.ts`
- Added the `@payload-config` TypeScript path alias in `tsconfig.json`

### Added Missing Payload App Router Routes

Added the required Payload route structure:

- `src/app/(payload)/layout.tsx`
- `src/app/(payload)/admin/[[...segments]]/page.tsx`
- `src/app/(payload)/admin/[[...segments]]/not-found.tsx`
- `src/app/(payload)/api/[...slug]/route.ts`
- `src/app/(payload)/graphql/route.ts`
- `src/app/(payload)/graphql-playground/route.ts`
- `src/app/(payload)/custom.scss`
- `src/app/(payload)/admin/importMap.js`

The import map was generated with:

```bash
npm run generate:importmap
```

### Removed Obsolete Express Server Setup

Removed the old custom server path:

- Deleted `src/server.ts`
- Removed `express`
- Removed `dotenv`
- Removed `@types/express`
- Removed `main: src/server.ts` from `package.json`

This made Vercel's runtime surface clear: Next.js handles the app, and Payload runs through `@payloadcms/next`.

### Updated Scripts

Changed scripts in `package.json`:

```json
"dev": "next dev",
"build": "next build --webpack",
"start": "next start",
"generate:importmap": "payload generate:importmap",
"generate:types": "payload generate:types",
"migrate": "payload migrate",
"type-check": "next typegen && tsc"
```

Webpack was pinned for production build stability because the local Payload admin build hung under Turbopack.

### Added Runtime/Environment Documentation

Added `.env.example` with required variables:

```text
PAYLOAD_SECRET=
DATABASE_URI=
NEXT_PUBLIC_SERVER_URL=
CORS_ORIGINS=
CSRF_ORIGINS=
```

Also added `*.tsbuildinfo` to `.gitignore`.

### Added Node Engine

Added:

```json
"engines": {
  "node": ">=20.9.0"
}
```

This matches the requirements of the installed Payload/Next packages and reduces Vercel environment ambiguity.

## Verification Performed

The following checks passed locally before pushing:

```bash
npm run build
npm run type-check
```

Production build output showed the expected routes:

```text
/                       static
/_not-found             static
/admin/[[...segments]]  dynamic
/api/[...slug]          dynamic
/graphql                dynamic
/graphql-playground     dynamic
```

Production smoke test:

- `/` returned `200 OK`
- `/admin` reached Payload successfully but returned `500` locally because the sandbox could not resolve the Supabase Postgres host. This was identified as local network/database connectivity, not a build problem.

After pushing, the user confirmed the site is live.

## Git Record

Committed and pushed:

```text
463e581 Fix Vercel Payload deployment setup
```

Branch:

```text
main
```

Remote:

```text
origin/main
```

## Notes for Future Maintenance

If the site builds but `/admin` fails at runtime, check Vercel Production environment variables first:

- `DATABASE_URI`
- `PAYLOAD_SECRET`
- `NEXT_PUBLIC_SERVER_URL`
- `CORS_ORIGINS`
- `CSRF_ORIGINS`

If Payload collections or admin components change, regenerate the import map:

```bash
npm run generate:importmap
```

If TypeScript route errors appear locally, run:

```bash
npm run type-check
```

This now runs `next typegen` before `tsc`, which avoids stale or missing `.next/types` issues.

