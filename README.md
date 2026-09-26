 # Easy Tech Solution

The old Vite `frontend` and Express `backend` are now represented by this single Next.js App Router application. The browser UI lives in `src/app`, server-only integrations live in `src/lib` and `src/models`, and the former Express endpoints are Next Route Handlers.

## Structure

```text
src/
	app/                         # pages and /api route handlers
	components/DashboardApp.tsx  # client ledger workflows
	lib/                         # MongoDB, Firebase, WhatsApp, client API
	models/                      # Mongoose models
	types/                       # shared UI types
```

## Local setup

Copy `env.example` to `.env.local`, then fill in real values. Never commit either file with secrets. `MONGO_URI`, Firebase Admin credentials, `ADMIN_EMAILS`, `JWT_SECRET`, and WhatsApp credentials are server-only; `NEXT_PUBLIC_*` values are safe Firebase browser configuration.

Install and run:

```bash
npm run dev
# or
yarn dev
Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

The first login must be a Google account listed in both `ADMIN_EMAILS` and `NEXT_PUBLIC_ADMIN_EMAILS`. Enable Google sign-in in Firebase Authentication and add `localhost` to Firebase authorised domains.

## Migrated API

All routes require a Firebase ID token in `Authorization: Bearer <token>`:

```text
POST   /api/auth/firebase
GET    /api/auth/me
GET    /api/entries
POST   /api/entries
POST   /api/entries/import
PUT    /api/entries/:id
DELETE /api/entries/:id
POST   /api/entries/:id/payments
```

## Import data template

Use [data/entries-import.json](data/entries-import.json) as the template for old entries. On the All entries page, click `Import JSON` and select this file. Replace the example records with a JSON array using the same field names. Do not add `_id`, `createdAt`, or `updatedAt`; MongoDB creates those values.

Dates must use `YYYY-MM-DD`. Valid statuses are `Complete`, `Progress`, `Due Later`, `Pending`, and `Cancelled`. Payment records use `{ "date": "YYYY-MM-DD", "amount": 0 }`.

MongoDB connections are cached on `globalThis`, which avoids opening a new connection for every Vercel function invocation. Entry status automation and Meta WhatsApp notifications were carried over from the Express backend.

## Deploy to Vercel

1. Import the repository into Vercel and set the project root to `easytech` if the repository contains the sibling legacy folders.
2. Add every variable from `.env.local.example` in Vercel Project Settings for the Production, Preview, and Development environments as appropriate.
3. In MongoDB Atlas, allow Vercel access and create a database user with access to the target database.
4. In Firebase, add the Vercel domain to authorised domains and configure the production OAuth redirect settings.
5. Deploy. Vercel automatically runs `npm run build`; the app does not need a separate Node/Express service.

For a clean migration, keep the existing `frontend` and `backend` folders during verification, then archive or remove them only after the Next app has been tested against the production MongoDB data.

## Validation

```bash
npm run lint
npm run build
```
