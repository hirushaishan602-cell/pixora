# PIXORA build fix

This version fixes the Next.js production-build failure caused by Firebase Admin being initialized at module import time.

## Fix
Firebase Admin is now initialized lazily inside `getAdminAuth()` / `getAdminDb()`. Production secrets are therefore required only when an API route actually handles a request, not while Next.js is collecting page data during `next build`.

## Required deployment variables
Set these server-side in Vercel/GitHub Actions/runtime environment:

- `FIREBASE_ADMIN_PROJECT_ID`
- `FIREBASE_ADMIN_CLIENT_EMAIL`
- `FIREBASE_ADMIN_PRIVATE_KEY`
- `MAIN_ADMIN_EMAIL` (if admin auto-role sync is used)

Do not commit `.env.local` or service-account private keys.
