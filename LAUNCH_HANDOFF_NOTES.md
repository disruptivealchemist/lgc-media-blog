# Launch Handoff Notes

Date: 2026-05-06

## Current Status

The Payload CMS / Next.js site is live on Vercel at:

- https://lgc-media-blog.vercel.app

The intended custom subdomain is:

- https://media.lisagalea.com

DNS still needs to be completed for the custom subdomain. In Vercel, add `media.lisagalea.com` under the `lgc-media-blog` project settings, then copy the DNS record Vercel provides into the DNS provider for `lisagalea.com`.

For a normal Vercel subdomain setup, the DNS record is usually:

```txt
Type: CNAME
Name: media
Value: cname.vercel-dns.com
TTL: Auto / Default
```

## Vercel Environment Variables For Custom Domain

When moving to the custom domain, use:

```txt
NEXT_PUBLIC_SERVER_URL=https://media.lisagalea.com
CORS_ORIGINS=https://media.lisagalea.com,https://lgc-media-blog.vercel.app
CSRF_ORIGINS=https://media.lisagalea.com,https://lgc-media-blog.vercel.app
```

Redeploy after updating Vercel environment variables.

## Final Launch Check Completed

The following checks were run:

- `npm run build` passed locally.
- Live `/admin/login` returned successfully.
- Live unauthenticated `/api/posts` returned `403`.
- Live unauthenticated `/api/users` returned `403`.
- Live unauthenticated `/api/users/me` returned `{"user":null,"message":"Account"}`.
- Live `/graphql` returned `405` for GET.
- Live `/graphql-playground` returned `404`.
- `.env.example` contains placeholders only.
- `.env.local` is ignored by git and contains local/private secrets.

## Security Hardening Change Made Locally

`next.config.ts` has an uncommitted launch-hardening change:

- Removes the `X-Powered-By` framework fingerprint via `poweredByHeader: false`.
- Adds these HTTP security headers:
  - `X-Content-Type-Options: nosniff`
  - `X-Frame-Options: DENY`
  - `Referrer-Policy: strict-origin-when-cross-origin`
  - `Permissions-Policy: camera=(), microphone=(), geolocation=()`

After this edit, `npm run build` passed.

Next session should review, commit, push, and redeploy this change if still desired.

## Dependency Audit Notes

`npm audit --omit=dev` was run.

Result:

- 16 moderate vulnerabilities remain in transitive dependencies.
- The safe/non-forced audit path did not clear them.
- npm suggested `npm audit fix --force`, but that would introduce breaking dependency changes, including unexpected older/changed package versions.

Recommendation:

- Do not force dependency changes immediately before public launch.
- Handle dependency updates in a separate maintenance pass after the site is stable.

## Privacy / Legal Docs Recommendation

Before actively promoting the public site, create and publish:

- Privacy Policy
- Website Terms / Terms of Use
- Cookie notice only if analytics, pixels, ads, embedded trackers, or marketing tools are added

Privacy policy should cover:

- who operates the site
- what personal information is collected
- how it is collected and stored
- why it is used
- third-party providers, including Vercel and Supabase
- how someone can request access, correction, or deletion
- privacy contact email
- overseas storage/processing note

Useful references:

- OAIC privacy policy overview: https://www.oaic.gov.au/privacy/your-privacy-rights/your-personal-information/what-is-a-privacy-policy
- OAIC APP 1 guidance: https://www.oaic.gov.au/privacy/australian-privacy-principles-guidelines/chapter-1-app-1-open-and-transparent-management-of-personal-information/
- Payload access control overview: https://payloadcms.com/docs/access-control/overview

## Suggested Next Steps

1. Commit and push `next.config.ts` launch-hardening change.
2. Add `media.lisagalea.com` to Vercel project domains.
3. Add the DNS record at the DNS provider for `lisagalea.com`.
4. Update Vercel env vars for custom domain.
5. Redeploy.
6. Confirm:
   - `https://media.lisagalea.com`
   - `https://media.lisagalea.com/admin/login`
   - `https://media.lisagalea.com/api/users/me`
7. Draft and publish privacy/terms pages.
