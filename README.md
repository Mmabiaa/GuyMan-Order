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

## Backend (Node.js + MongoDB)

The frontend currently stores orders/transactions in local state (`localStorage`), but the next step is a dedicated backend that provides the required APIs:

- Login authentication
- Add orders
- View active orders
- Mark orders as complete
- View transactions (completed orders)

See the backend contract in `server/readme.md`.

## Technical Stack (Frontend)

- **Framework**: Next.js (App Router, Server Actions, Middleware)
- **Styling**: Tailwind CSS
- **Components**: Shadcn UI / Radix UI
- **Form Validation**: React Hook Form, Zod
- **Icons**: Lucide React
