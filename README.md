# SmartKart 2.0 - Full-Stack E-commerce

A modern, high-performance e-commerce platform built with **TypeScript (Strict Mode)**, featuring a modular architecture, secure authentication, and a real-time notification system.

## 🚀 Key Features

- **Secure Authentication**: JWT-based auth with access/refresh token rotation stored in HttpOnly cookies.
- **Role-Based Access**: Specialized interfaces for Consumers and Shopkeepers.
- **Product Discovery**: Advanced filtering (category, price), search, and pagination.
- **Cart & Checkout**: Seamless cart management and order placement with multi-contact delivery support.
- **Security**: Strict TypeScript (zero `any`), data encryption (sensitive PII like mobile numbers), and XSS/CSRF protections.
- **Background Tasks**: Powered by Trigger.dev for reliable asynchronous processing (notifications, emails).

## 🛠 Tech Stack

### Frontend

- **Framework**: React 18 with Vite
- **Routing**: React Router v7
- **State Management**: Redux Toolkit & TanStack Query (v5)
- **Styling**: Tailwind CSS
- **Notifications**: React Hot Toast

### Backend

- **Runtime**: Node.js & Express (ESM)
- **Database**: MongoDB with Mongoose
- **Validation**: Zod
- **Infrastructure**: Trigger.dev (Background Tasks), Stripe (Payments Ready)

---

## 📂 Project Structure

```bash
SmartKart 2.0/
├── frontend/           # React frontend application
├── server/             # Express backend (modular structure)
└── shared/             # (Optional) Future shared types/utils
```

---

## 🚦 Getting Started

### 1. Prerequisites

- Node.js (v18+)
- MongoDB (Local or Atlas)

### 2. Installation

Install dependencies for both frontend and backend:

```bash
# Install root (if monorepo) or individual folders
npm install
```

### 3. Environment Configuration

Create a `.env` file in the `server` directory:

```bash
cp server/.env.example server/.env
```

Ensure you fill in the required values for `MONGODB_URI`, `ACCESS_TOKEN_SECRET`, etc.

### 4. Running the Application

```bash
# From the root directory
npm run dev
```

- **Frontend**: [http://localhost:5173](http://localhost:5173)
- **Backend**: [http://localhost:5000](http://localhost:5000)

---

## 🛡 Auth & Security Flow

1. **Registration**: User registers -> Receives email verification token.
2. **Login**: User logs in -> Server sets `accessToken` and `refreshToken` cookies (Only after email verification).
3. **Session**: `accessToken` (short-lived) is used for requests. `refreshToken` is used to rotate sessions automatically.
4. **Encryption**: Sensitive user data (mobile numbers) is encrypted before storage in MongoDB.

## 📦 Modules (Backend)

The backend follows a strict **Modular Architecture**:

- `auth`: Identity management & session rotation.
- `user`: User account details.
- `product`: Inventory and search.
- `cart`: Temporary shopping persistence.
- `order`: Checkout logic and history.
- `notification`: Trigger.dev powered alert system.
- `payment`: Stripe integration.

---

## 📖 Documentation

- [Backend Architecture](./server/ARCHITECTURE.md)
- [Quick Start Guide](./server/QUICK_START.md)
