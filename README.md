# EASY TECH LONDON LTD

EASY TECH LONDON LTD-এর public company website এবং private admin ledger একই Next.js App Router project-এ তৈরি। Website visitors service ও contact information দেখতে পারেন; অনুমোদিত admin-রা client work, payment এবং WhatsApp notification পরিচালনা করেন।

## প্রযুক্তি

- Next.js 16 App Router, React 19, TypeScript
- Firebase Authentication (Google sign-in) এবং Firebase Admin token verification
- MongoDB ও Mongoose দিয়ে client, payment এবং notification data সংরক্ষণ
- SWR দিয়ে dashboard/ledger data fetching ও cache update
- Meta WhatsApp Cloud API দিয়ে event-based message এবং delivery log
- CSS Modules, shared CSS এবং `react-icons`

## তৈরি করা feature

### Public website

- Responsive homepage, company logo, navigation, hero, company introduction এবং contact section।
- Services তিনটি group-এ দেখানো হয়:
  - **Work & Driver Support:** insurance agent tasks, maternity/paternity pay, sick/accident claims।
  - **Accounts & Technology:** delivery account create/recover, Just Eat zone change ও tax information, credit card assistance, Amazon/Yodel/Evri account support।
  - **Education & Travel:** university admission/student maintenance, air ticket, Hajj/Umrah, passport renewal/No Visa assistance।
- Company owner হিসেবে Md Kamrul Islam-এর পরিচিতি ও contact CTA।
- Email: `easytechsolutionuk@gmail.com`; WhatsApp: `+44 7514 585898`।
- Footer-এ Instagram ও Facebook profile link।
- ডান-নিচে স্থায়ী floating WhatsApp button; একই WhatsApp নম্বরে chat খোলে।
- Page metadata, favicon এবং Facebook domain verification metadata।

### Admin ও ledger

- `/admin/login`-এ অনুমোদিত Google account দিয়ে sign-in; public registration নেই। Email client এবং server allowlist-এ অনুমোদিত হতে হবে।
- `/dashboard`-এ active deal, received amount, outstanding due, commission/net balance, month-by-month summary এবং follow-up করার মতো outstanding client দেখা যায়। Month filter থেকে নির্দিষ্ট মাস বা সব মাস দেখা যায়।
- `/ledger`-এ entry add/edit/delete, details দেখা, Pending entry শুরু করা এবং payment নেওয়া যায়।
- Entry-তে date, client, service, status, deal, advance, later payments, commission, reference, agent/client phone, email ও notes রাখা যায়। Update history-ও সংরক্ষিত হয়।
- Search, status filter, date/due/deal/name অনুযায়ী sort, pagination, responsive mobile entry view এবং browser print/Save as PDF report আছে।
- Service type নতুন করে লিখলে browser local storage-এ মনে রাখা হয়।
- Payment date ও amount-সহ একাধিক payment রাখা যায়; বাকি due ও received amount হিসাব করা হয়। সম্পূর্ণ টাকা পাওয়া হলে status স্বয়ংক্রিয়ভাবে `Complete` হয়।
- Status: `Complete`, `Progress`, `Due Later`, `Pending`, `Cancelled`।
- JSON file দিয়ে পুরোনো entry import করা যায়; নমুনা [data/entries-import.json](data/entries-import.json)-এ আছে।

### WhatsApp notification log

- Entry status/work event এবং payment event-এ client-কে Meta WhatsApp template message পাঠানোর integration।
- Notification history-তে sent/failed status, client, phone, event, template, সময় এবং error/message দেখা যায়; search, status filter, details, single delete ও delete all আছে।
- MongoDB TTL index notification log-কে প্রায় ৩০ দিন পর মুছে ফেলার জন্য configure করা।

## Pages ও API

| Path | কাজ |
| --- | --- |
| `/` | Public company homepage |
| `/admin/login` | Google admin sign-in |
| `/login` | পুরোনো login URL; `/admin/login`-এ redirect করে |
| `/dashboard` | Financial overview ও follow-up |
| `/ledger` | Client entry ও payment management |
| `/notifications` | WhatsApp notification history |
| `POST /api/auth/firebase` | Firebase ID token ও admin allowlist যাচাই |
| `GET /api/auth/me` | Bearer token থেকে admin পরিচয় যাচাই |
| `POST /api/auth/login` | Legacy MongoDB user/password login; বর্তমান UI login flow নয় |
| `GET, POST /api/entries` | Entry list ও create |
| `POST /api/entries/import` | JSON entry array import |
| `PUT, DELETE /api/entries/:id` | Entry update ও delete |
| `POST /api/entries/:id/payments` | Payment যোগ |
| `GET, DELETE /api/notifications` | Notification list ও সব log delete |
| `GET, DELETE /api/notifications/:id` | Notification details ও একক log delete |

Ledger ও notification API-গুলো `Authorization: Bearer <token>` নেয়। `requireAdmin()` Firebase ID token verify করে email verification এবং `ADMIN_EMAILS` allowlist পরীক্ষা করে; legacy JWT verification fallback-ও code-এ আছে।

## গুরুত্বপূর্ণ source file

```text
src/app/page.tsx                    Public homepage
src/app/home.module.css             Homepage styles
src/components/DashboardApp.tsx     Dashboard ও ledger workflows
src/app/notifications/page.tsx      Notification history UI
src/lib/firebase-client.ts          Browser Firebase/Google Auth
src/lib/firebase-admin.ts           Server token verification/admin allowlist
src/lib/api-auth.ts                 Protected API authorization
src/lib/db.ts                       Cached Mongoose connection
src/lib/whatsapp.ts                 WhatsApp send logic and notification logging
src/models/Entry.ts                 Entry/payment schema
src/models/Notification.ts          Notification schema and 30-day TTL index
src/models/Admin.ts                 Legacy password login model
src/lib/money.ts                    Currency/payment/date calculations
```

## Local development

প্রয়োজন: Node.js 20.9+ এবং npm। এই repository-তে বর্তমানে `.env.example` নেই; project root-এ নিজে `.env.local` তৈরি করে নিচের variable-গুলো বসান। Secret কখনও commit করবেন না।

```bash
npm install
npm run dev
```

তারপর [http://localhost:3000](http://localhost:3000) খুলুন। Firebase Authentication-এ Google provider enable করুন এবং local/deployment domain Firebase authorized domains-এ যোগ করুন। যে admin email ব্যবহার করবেন সেটি `NEXT_PUBLIC_ADMIN_EMAILS` ও `ADMIN_EMAILS`—দুই জায়গাতেই রাখতে হবে। MongoDB-র জন্য accessible database URI প্রয়োজন।

### Environment variables

Browser Firebase configuration এবং client-side allowlist:

```text
NEXT_PUBLIC_FIREBASE_API_KEY
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
NEXT_PUBLIC_FIREBASE_PROJECT_ID
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
NEXT_PUBLIC_FIREBASE_APP_ID
NEXT_PUBLIC_ADMIN_EMAILS
```

Server configuration:

```text
MONGO_URI
FIREBASE_PROJECT_ID
FIREBASE_CLIENT_EMAIL
FIREBASE_PRIVATE_KEY
ADMIN_EMAILS
JWT_SECRET                 # Legacy JWT login/verification-এর জন্য
JWT_EXPIRES_IN             # Optional
```

ঐচ্ছিক WhatsApp Cloud API integration:

```text
WHATSAPP_ACCESS_TOKEN
WHATSAPP_PHONE_NUMBER_ID
WHATSAPP_TEMPLATE_DOC
WHATSAPP_TEMPLATE_STARTED
WHATSAPP_TEMPLATE_PAYMENT
WHATSAPP_TEMPLATE_FINISHED
WHATSAPP_TEMPLATE_COMPLETED
WHATSAPP_TEMPLATE_LANGUAGE       # Optional; default en
WHATSAPP_GRAPH_API_VERSION       # Optional; default v22.0
```

`NEXT_PUBLIC_*` variable browser bundle-এ প্রকাশিত হয়; সেখানে private key, database URI, JWT secret বা WhatsApp access token দেবেন না। WhatsApp message-এর জন্য Meta-তে সংশ্লিষ্ট approved template ও placeholder order configure থাকতে হবে।

## Import format

`data/entries-import.json`-এর মতো non-empty JSON array দিন। প্রতিটি entry-তে `client` প্রয়োজন; `date` ও payment date `YYYY-MM-DD` format-এ দিন। Supported statuses: `Complete`, `Progress`, `Due Later`, `Pending`, `Cancelled`। Payment object-এর format `{ "date": "YYYY-MM-DD", "amount": 0 }`। `_id`, `createdAt`, `updatedAt` দেবেন না; database সেগুলো তৈরি করে। Import flow status alias-ও normalize করে, যেমন `completed` থেকে `Complete`।

## Deploy ও validation

Vercel-এ project deploy করা যায়। Vercel environment settings-এ প্রয়োজনীয় `.env.local` variable যোগ করুন, MongoDB Atlas-এ deployment access দিন এবং Firebase authorized domains-এ production domain যোগ করুন। Firebase Admin private key newline-সহ সঠিকভাবে configure করুন।

```bash
npm run lint
npm run build
npm start
```

`package.json`-এ automated test script বর্তমানে নেই। MongoDB connection `globalThis`-এ cache করা হয়, যাতে serverless runtime-এ connection reuse করা যায়।

## AI- Project Context Prompt

নিচের prompt অন্য AI assistant-এ copy করে এই repository-তে কাজ শুরু করতে ব্যবহার করুন:

```text
তুমি EASY TECH LONDON LTD-এর বিদ্যমান Next.js project-এ senior coding assistant হিসেবে কাজ করবে। কোনো পরিবর্তন করার আগে README.md, architecture.md এবং সংশ্লিষ্ট source file পড়ে বর্তমান implementation বুঝবে। README/architecture-তে উল্লেখ আছে বলে কোনো feature-কে অসম্পূর্ণ বা শুধু পরিকল্পিত ধরে নেবে না; source code দেখে নিশ্চিত হবে। অপ্রাসঙ্গিক refactor করবে না, বিদ্যমান feature/API অকারণে ভাঙবে না, secret প্রকাশ করবে না এবং কাজ শেষে প্রাসঙ্গিক lint/build/diagnostic চালাবে।

PROJECT
- Next.js 16 App Router, React 19, TypeScript; source `src/`-এ।
- Firebase Google Auth হলো বর্তমান admin UI login। Client allowlist `NEXT_PUBLIC_ADMIN_EMAILS`, server allowlist `ADMIN_EMAILS`; server Firebase Admin verified ID token পরীক্ষা করে। `/login` শুধু `/admin/login`-এ redirect করে। `/api/auth/login`, Admin model ও JWT code legacy path; বর্তমান UI flow নয়।
- MongoDB/Mongoose-এ client ledger এবং notification log থাকে। `src/lib/db.ts` connection cache করে। Protected API-তে `requireAdmin()` ব্যবহার হয়; Firebase verification-এর পরে legacy JWT fallback আছে।
- SWR dashboard/ledger data fetch/cache করে। Shared client API helper Firebase ID token-সহ request পাঠায়।
- WhatsApp integration `src/lib/whatsapp.ts` Meta Cloud API template message পাঠায়, sent/failed notification log MongoDB-তে রাখে. Template event-үүд: document_pending, work_started, payment_received, work_finished, completed. WhatsApp env values optional;။

EXISTING USER FEATURES
- `/` public responsive company homepage: hero, service groups, About/company owner section, contact CTA, footer.
- Services: Work & Driver Support (insurance agent tasks, maternity/paternity, sick/accident claims, CBT); Accounts & Technology (delivery account creation/recovery, Just Eat zone/tax update, credit card assistance, Amazon/Yodel/Evri); Education & Travel (university admission/student maintenance, air ticket, Hajj/Umrah, passport renewal/No Visa).
- Footer contact: easytechsolutionuk@gmail.com, WhatsApp +44 7514 585898, Instagram https://www.instagram.com/easytechlondon.ltd/?hl=en, Facebook https://www.facebook.com/profile.php?id=61594847097764. Fixed WhatsApp icon is at bottom-right and opens the same number.
- `/admin/login`: authorized Google sign-in, no public registration.
- `/dashboard`: month filter, active deal, received and due totals, commission/net balance, monthly summary, outstanding-client follow-up.
- `/ledger`: create/edit/delete/detail entries, status filtering, text search, sorting, pagination, mobile entry view, print/Save as PDF, Pending-to-Progress action, payment entry, due/received calculations. Service names can be remembered in browser localStorage.
- Entry data includes date, client, service, status, deal, advance, payments, commission, reference, email, phone, notes, start date and update history. Statuses are Complete, Progress, Due Later, Pending, Cancelled. Fully paid entries become Complete automatically in relevant API flows.
- `/notifications`: sent/failed WhatsApp event history, search/status filter/details/delete one/delete all. MongoDB TTL index is configured for approximately 30-day expiry.
- `/api/entries/import` imports a non-empty JSON array; `data/entries-import.json` is an example. Date format YYYY-MM-DD. Database generates IDs/timestamps.

MAIN FILES
- Public homepage: `src/app/page.tsx`, `src/app/home.module.css`
- Admin workflows: `src/components/DashboardApp.tsx`, pages in `src/app/dashboard`, `src/app/ledger`
- Notification UI: `src/app/notifications/page.tsx`
- APIs: `src/app/api/**`
- Firebase/auth/database/WhatsApp: `src/lib/**`
- Schemas/types: `src/models/**`, `src/types/index.ts`
- Detailed system flow: `architecture.md`

API surface includes POST `/api/auth/firebase`, GET `/api/auth/me`, legacy POST `/api/auth/login`; GET/POST `/api/entries`, POST `/api/entries/import`, PUT/DELETE `/api/entries/:id`, POST `/api/entries/:id/payments`; GET/DELETE `/api/notifications`, GET/DELETE `/api/notifications/:id`. Ledger/notification APIs need an authorized Bearer token.

Configuration uses `.env.local`; this repository currently has no `.env.example`. Variables include NEXT_PUBLIC_FIREBASE_* and NEXT_PUBLIC_ADMIN_EMAILS; server-side MONGO_URI, FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY, ADMIN_EMAILS; legacy JWT_SECRET/JWT_EXPIRES_IN; optional WhatsApp token, phone-number ID, event-specific template names, language and Graph API version. Never put server secrets in NEXT_PUBLIC_*.

When implementing a requested change, follow existing CSS/module/API conventions, keep scope narrow, preserve Bengali/English content already present, and clearly report files changed plus checks run. Available commands: `npm run dev`, `npm run lint`, `npm run build`, `npm start`; package.json currently defines no test script.
```
