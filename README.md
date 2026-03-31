# Administration Dashboard - Authentication

This project implements a secure administration dashboard using the Next.js App Router framework.

## Features Added

1. **Authentication Middleware**
   All application routes (except `/login` and static assets) are protected using Next.js middleware (`middleware.ts`).
   Users attempting to access protected routes without a valid session are automatically redirected to the login page.

2. **Login Interface**
   A clean, responsive login page (`/login`) is built with React Hook Form and Zod for robust client-side validation. The UI leverages Shadcn UI (Radix primitives) and Tailwind CSS for a polished look.

3. **Secure Server Actions**
   The login logic is handled securely via Next.js Server Actions (`app/login/actions.ts`). Upon successful authentication, an `HttpOnly`, `secure`, `SameSite=lax` cookie (`auth-token`) is set to maintain the user's session without exposing the token to client-side scripts.

## Demo Credentials

To log into the administration dashboard, use the following credentials:

- **Username**: `admin`
- **Password**: `Admin@123.`

## How to Run Locally

1. Ensure you have Node.js installed.
2. Install dependencies (if not already installed):
   ```bash
   npm install
   ```
3. Run the development server:
   ```bash
   npm run dev
   ```
4. Open [http://localhost:3000](http://localhost:3000) in your browser. You will be automatically redirected to the login page.
5. Enter the demo credentials to access the secure dashboard.

## Technical Stack

- **Framework**: Next.js 15+ (App Router, Server Actions, Middleware)
- **Styling**: Tailwind CSS
- **Components**: Shadcn UI / Radix UI
- **Form Validation**: React Hook Form, Zod
- **Icons**: Lucide React
