# Nain CSC Next.js Migration

This project has been migrated from Vite + React Router + Electron to Next.js App Router with Tailwind CSS support.

## What changed

- Vite and Electron desktop packaging removed.
- Next.js app router added under `app/`.
- Tailwind CSS configured with PostCSS.
- Existing UI preserved through legacy CSS imports in `app/globals.css` via `src/index.css`.
- React Router links and navigation converted to Next.js routing.
- Firebase pages updated to work in Next.js client components.

## Scripts

```bash
npm run dev
npm run build
npm run build:netlify
npm run build:github-pages
npm run start
npm run lint
```

## Project structure

```text
app/                  Next.js routes and root layout
src/components/       Shared UI and app shell
src/views/            Migrated page views
src/Styles/           Existing global CSS styles
public/               Static files, forms, images, favicon
```

## Tailwind setup

Tailwind is ready to use in the project.

- Config: `tailwind.config.mjs`
- PostCSS: `postcss.config.mjs`
- Global entry: `app/globals.css`

You can now move legacy styles page-by-page into Tailwind utilities or component-level styling without changing routing again.

## Firebase environment variables

The app supports `NEXT_PUBLIC_*` Firebase variables. Existing values are still used as fallback defaults.

Copy `.env.example` to `.env.local` if you want to manage Firebase config through environment variables.

For the live production domain, keep `NEXT_PUBLIC_SITE_URL=https://naincsc.in`.

If Google Search Console gives you a new custom-domain verification token, set `NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION=` before building.

## Jobs admin setup

Jobs admin login is intentionally separate from the customer vault login.

Put the admin environment variables in `.env.local` in the project root:

```env
NEXT_PUBLIC_JOBS_ADMIN_EMAIL=admin@csc.com
NEXT_PUBLIC_JOBS_ADMIN_FIREBASE_API_KEY=
NEXT_PUBLIC_JOBS_ADMIN_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_JOBS_ADMIN_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_JOBS_ADMIN_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_JOBS_ADMIN_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_JOBS_ADMIN_FIREBASE_APP_ID=
NEXT_PUBLIC_JOBS_ADMIN_FIREBASE_DATABASE_URL=
NEXT_PUBLIC_JOBS_ADMIN_TENANT_ID=
```

Get these values from Firebase Console:

- Project settings -> General -> Your apps -> Firebase SDK snippet -> Config
- Realtime Database -> Data URL for `NEXT_PUBLIC_JOBS_ADMIN_FIREBASE_DATABASE_URL`
- If you are using Firebase multi-tenancy, put the tenant id in `NEXT_PUBLIC_JOBS_ADMIN_TENANT_ID`; otherwise leave it blank

After updating `.env.local`, restart the dev server.

## Database rules

`database.rules.json` locks customer vault records to the signed-in user, and leaves the public job board readable. Deploy it from the Firebase project that stores `vault_data`:

```bash
npx firebase-tools deploy --only database
```

In Firebase Authentication, keep Email/Password sign-in on for existing staff, and turn off public sign-up. The website no longer shows a create-account form. New staff accounts are created from the Firebase console.

## Notes

- `npm run build` is passing.
- Next.js shows one non-blocking ESLint warning because the project is still using a custom flat ESLint config instead of the official Next ESLint preset.
- Old Electron output folder and service worker were removed as part of cleanup.
- Primary production and canonical domain is `https://naincsc.in`.

## GitHub Pages test repo

If `https://devnain21.github.io/CSC/` is showing this README instead of the website, that means the repository source code was uploaded, not the exported site build.

GitHub Pages can still be used as a mirror or test deployment, but the primary canonical domain remains `https://naincsc.in`.

For GitHub Pages, use the exported static output instead of the source files:

```bash
npm install
npm run build:github-pages
```

After that, upload the contents of the generated `out/` folder to the GitHub Pages repository root or to the branch/folder configured in GitHub Pages settings.

Important for GitHub Pages:

- `NEXT_PUBLIC_SITE_URL` should stay `https://naincsc.in`
- `NEXT_PUBLIC_BASE_PATH` should be `/CSC`
- `.nojekyll` is included so the `_next/` folder is served correctly

If you want a normal full Next.js deployment without static export limits, use Vercel or Netlify instead of GitHub Pages.
