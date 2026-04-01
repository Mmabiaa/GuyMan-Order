# GuyMan Administration Dashboard (Orders + Transactions)

This project implements a secure administration dashboard using the Next.js App Router framework. The dashboard supports:

- Admin login (protected routes via `middleware.ts`)
- Creating active orders
- Viewing active orders
- Marking orders as complete (which becomes part of transaction history)
- Viewing completed transactions

## Demo Credentials (current frontend-only login)

To log into the dashboard, use:

- **Username**: `admin`
- **Password**: `Admin@123.`

## How to Run the Frontend Locally

1. Ensure you have Node.js installed.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run:
   ```bash
   npm run dev
   ```
4. Open [http://localhost:3000](http://localhost:3000). You will be redirected to `/login`.

## Environment (frontend)

When the UI and API are on **different hosts** (e.g. `guyman-order.vercel.app` and `api-*.vercel.app`), the browser cannot send the httpOnly `auth-token` cookie to the API. The app uses a **same-origin proxy** at `/api/proxy/*` that forwards requests and attaches the cookie server-side.

- **`BACKEND_URL`** (recommended, server-only): full origin of the API, e.g. `https://api-guyman-order.vercel.app`. Used by the dashboard server load and the `/api/proxy` route.

There is **no app logic registering a service worker**. A minimal `public/sw.js` and `ClearStaleServiceWorker` exist only so browsers can **drop legacy workers/caches** from older deploys. Data stays fresh (`cache: 'no-store'` where used, `router.refresh()` after mutations).
- **`NEXT_PUBLIC_BACKEND_URL`**: optional fallback for `BACKEND_URL` (exposed to the client; prefer `BACKEND_URL` in production).

On the **API** deployment, set **`CORS_ORIGIN`** to your Next.js origin (e.g. `https://guyman-order.vercel.app`).

## Backend (Node.js + MongoDB)

The **backend** owns authentication, validation, and persistence. The Next.js app is a UI shell: it loads data via the API (server-side `loadDashboardInitialData` for the home page, `/api/proxy` for browser mutations and login), and does not duplicate business rules. The backend provides:

- Login authentication
- Add orders
- View active orders
- Mark orders as complete
- View transactions (completed orders)

See the backend contract in `server/readme.md`.

## How to Run the Backend

1. Ensure you have MongoDB available and create `server/.env` with:
   - `MONGODB_URI`
   - `JWT_SECRET`
   - (optional) `PORT`, `ADMIN_USERNAME`, `ADMIN_PASSWORD`, `CORS_ORIGIN`
2. Install and run:
   ```bash
   cd server
   npm install
   npm run dev
   ```
3. The backend exposes:
   - `GET http://localhost:<PORT>/v1/healthz`
   - `POST http://localhost:<PORT>/v1/auth/login`
   - `GET http://localhost:<PORT>/v1/orders`

## Technical Stack (Frontend)

- **Framework**: Next.js (App Router, Server Actions, Middleware)
- **Styling**: Tailwind CSS
- **Components**: Shadcn UI / Radix UI
- **Form Validation**: React Hook Form, Zod
- **Icons**: Lucide React
