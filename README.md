# 🍱 Guy Man Order Management System

A premium SaaS platform designed for high-efficiency food order management and financial tracking. Built with modern web technologies, it features real-time order processing, granular item customization, and a robust historical revenue tracking system.

---

## 🚀 Key Features

### 🛒 Order Management
- **Granular Customization**: Support for multiple food packages and extras per order. Each size (Small, Medium, Large) can have its own independent quantity.
- **Active Lifecycle**: Track orders from "Pending" to "Fulfilled".
- **Dynamic Editing**: Edit customer details or adjust quantities on-the-fly for any active order.
- **Safe Recovery**: Delete accidental or mistake orders before they are finalized.

### 💰 Financial Intelligence
- **Decoupled Revenue**: Revenue is only recorded when **Payment Status** is explicitly set to `PAID`, ensuring accurate financial ledgering.
- **Daily vs. History**: Automated 24-hour maturation rule—transactions join the "All History" revenue pool only after a 24-hour delay.
- **Smart Filtering**: Advanced date-range filtering for transaction history with persistent payment status indicators.

### 🎨 User Experience
- **Live Interface**: Real-time status updates and status indicators.
- **Responsive Design**: Fully optimized for both desktop and mobile operational environments.
- **Dynamic Headers**: Context-aware section headers and high-contrast, premium typography.
- **Interactive Documentation**: Built-in Swagger UI for API exploration and testing.

---

## 📖 API Documentation

The system includes a built-in Swagger UI for exploring the API endpoints:
- **Primary URL**: `http://localhost:5000/docs` (Redirects to `/v1/docs`).
- **Direct URL**: `http://localhost:5000/v1/docs`.
- **JSON Spec**: `http://localhost:5000/v1/openapi.json`.

## 🔍 Debugging & Analytics

The server is equipped with an analytical logging system:
- **Request Logging**: Every non-GET request logs its body to the console for real-time debugging.
- **Traceability**: All logs are timestamped and include the HTTP method and path.

---

## 🛠️ Technical Stack

- **Frontend**: Next.js (App Router), Tailwind CSS, Lucide React, Radix UI.
- **Backend**: Node.js, Express, MongoDB (Mongoose).
- **Security**: JWT-based authentication, protected routes, and atomic database operations.

---

## 🏁 Quick Start

### 1. Environment Setup
Create a `.env` in the root and `/server` directories with your MongoDB URI and JWT Secret.

### 2. Frontend Launch
```bash
pnpm install
pnpm dev
```

### 3. Backend Launch
```bash
cd server
pnpm install
pnpm dev
```

---
*Powered by Mmabiaa-CS*
