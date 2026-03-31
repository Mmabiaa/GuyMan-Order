# Backend Blueprint (Node.js + MongoDB)

This backend provides the APIs required by the Next.js dashboard UI:

- Login authentication (admin access)
- Add orders
- View active orders
- Mark orders as complete
- View transaction history (completed orders)

The frontend currently stores data in `localStorage`, but the backend defined below will replace that with durable storage and shared state.

---

## 1. High-Level Architecture (Simple Microservices)

To avoid over-engineering while still following microservice ideas and SOLID principles, the backend is split by *domain* into separate modules and routers:

1. `auth-service`
   - Responsible for authentication and issuing tokens.
2. `orders-service`
   - Responsible for order creation and completion.
   - Also serves transaction history via a `transactions` query (completed orders).

Implementation note:
- The initial version runs as a single Node.js process with separate Express routers per domain.
- Each domain has its own controller/service/repository layers so it can later be split into separate deployable services without rewriting business logic.

---

## 2. API Overview

Base URL:
- `http://localhost:<PORT>/v1`

All requests that access protected resources require:
- `auth-token` cookie (HttpOnly JWT)

### 2.1 Health

`GET /v1/healthz`

---

## 3. Authentication Service (`auth-service`)

### 3.1 Login

`POST /v1/auth/login`

Request body:
```json
{
  "username": "admin",
  "password": "Admin@123."
}
```

Behavior:
- Validates user credentials against MongoDB.
- Issues a JWT and stores it in an `auth-token` cookie (`HttpOnly`).

Response:
```json
{ "ok": true }
```

### 3.2 Logout

`POST /v1/auth/logout`

Behavior:
- Clears the `auth-token` cookie.

Response:
```json
{ "ok": true }
```

### 3.3 Current User (optional but useful)

`GET /v1/auth/me`

Response:
```json
{
  "id": "string",
  "username": "string",
  "role": "admin"
}
```

---

## 4. Orders Service (`orders-service`)

### 4.1 Add Order

`POST /v1/orders`

Request body:
```json
{
  "clientOrderId": "optional-frontend-generated-id",
  "customerName": "John Doe",
  "phoneNumber": "+233 XX XXX XXXX",
  "foodItem": "Banku and Tilapia",
  "size": "Small",
  "amount": 50
}
```

Notes:
- `clientOrderId` is optional.
- If missing, the server generates an `externalId` (UUID) used as `id` in responses.

Response:
```json
{
  "id": "externalId-or-clientOrderId",
  "customerName": "John Doe",
  "phoneNumber": "+233 XX XXX XXXX",
  "foodItem": "Banku and Tilapia",
  "size": "Small",
  "amount": 50,
  "createdAt": "ISO-8601",
  "completed": false
}
```

### 4.2 View Active Orders

`GET /v1/orders`

Response: active orders only, ordered FIFO by `createdAt` ascending.

```json
{
  "items": [
    {
      "id": "string",
      "customerName": "string",
      "phoneNumber": "string",
      "foodItem": "string",
      "size": "string",
      "amount": 0,
      "createdAt": "ISO-8601",
      "completed": false
    }
  ]
}
```

Optional query params (implementation-friendly):
- `limit` (default: no limit / reasonable cap)

### 4.3 Mark Order as Complete

`POST /v1/orders/:id/complete`

Request body:
```json
{}
```

Behavior:
- Finds an active order by `id` (server `externalId` / `clientOrderId`).
- Marks it as completed.
- Updates completion metadata:
  - `completedAt`
  - `completedByUserId`

Response:
```json
{
  "id": "string",
  "customerName": "string",
  "phoneNumber": "string",
  "foodItem": "string",
  "size": "string",
  "amount": 0,
  "createdAt": "ISO-8601",
  "completed": true,
  "completedAt": "ISO-8601"
}
```

Consistency decision (important):
- “Transactions” are represented as completed orders inside the *same* MongoDB collection.
- This ensures completion is a single-document update (atomic), avoiding multi-collection transaction complexity.
- The `/v1/transactions` endpoint simply filters completed orders.

### 4.4 View Transactions (Completed Orders)

`GET /v1/transactions`

Response: completed orders only, ordered FIFO by `createdAt` ascending.

Optional query params:
- `search` (string) filters by `customerName`, `phoneNumber`, or `foodItem`

Example response:
```json
{
  "items": [
    {
      "id": "string",
      "customerName": "string",
      "phoneNumber": "string",
      "foodItem": "string",
      "size": "string",
      "amount": 0,
      "createdAt": "ISO-8601",
      "completed": true,
      "completedAt": "ISO-8601"
    }
  ]
}
```

---

## 5. MongoDB Data Model

Collections:
1. `users`
   - `username` (unique)
   - `passwordHash`
   - `role` (default: `admin`)
   - `createdAt`
2. `orders`
   - `externalId` (unique UUID used as the public `id`)
   - `customerName`
   - `phoneNumber`
   - `foodItem`
   - `size`
   - `amount`
   - `status` (`ACTIVE` | `COMPLETED`)
   - `completedAt` (nullable)
   - `completedByUserId` (nullable)
   - `createdAt`

Indexes (practical):
- `orders.status`
- `orders.createdAt`
- `orders.externalId` (unique)

Why MongoDB:
- This project needs simple CRUD with evolving fields and fast iteration.
- MongoDB is efficient for this document-shaped data (orders/transactions) and keeps the schema straightforward.
- Alternatives like PostgreSQL would also work, but MongoDB matches the current data shape with less impedance mismatch.

---

## 6. Security & Validation

- Passwords are hashed with `bcrypt`.
- Authentication uses JWT signed with `JWT_SECRET`.
- JWT is stored in `auth-token` cookie:
  - `HttpOnly`
  - `SameSite=lax` (dev-friendly)
  - `Secure` only when `NODE_ENV=production`
- All request payloads are validated with `zod`.
- Protected routes use an `auth` middleware that verifies the cookie JWT.

---

## 7. Environment Variables

Backend required env:
- `PORT` (default: `4000`)
- `MONGODB_URI` (e.g. `mongodb://localhost:27017/guy-man`)
- `JWT_SECRET` (strong random string)
- `JWT_EXPIRES_IN` (default: `7d`)

Admin seeding env (creates the first admin user if not present):
- `ADMIN_USERNAME` (default: `admin`)
- `ADMIN_PASSWORD` (default: `Admin@123.`)

Cookie behavior:
- `NODE_ENV` (`development` / `production`)

---

## 8. Local Development Workflow

1. Start MongoDB (locally or via Docker).
2. Install backend dependencies:
   ```bash
   cd server
   npm install
   ```
3. Create `server/.env`:
   - set `MONGODB_URI`, `JWT_SECRET`, and optionally admin credentials.
4. Run:
   ```bash
   npm run dev
   ```
5. Test endpoints:
   - `GET /v1/healthz`
   - `POST /v1/auth/login`
   - then authenticated calls for `/v1/orders` and `/v1/transactions`

---

## 9. Frontend Integration Notes (Next.js)

The current frontend uses `localStorage` and does not yet call the backend APIs.

When wiring it up, you’ll typically:
- Use the dashboard’s existing `auth-token` cookie.
- Call backend endpoints from the client (or via Next.js route handlers/server actions) so the cookie is sent automatically.

If the frontend and backend run on different origins during development, ensure:
- cookie `SameSite`/`Secure` settings match the deployment origin expectations
- CORS allows credentials

