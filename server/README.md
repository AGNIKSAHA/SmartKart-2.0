# SmartKart 2.0 - Server Architecture

A robust, modular Node.js backend built with Express and TypeScript.

## 🏗 Modular Structure

Each feature is encapsulated within `src/app/modules/`. A typical module contains:

- `*.routes.ts`: Defines API endpoints and attaches middleware.
- `*.controller.ts`: Handles request/response orchestration.
- `*.service.ts`: Contains core business logic (framework-agnostic).
- `*.store.ts`: Database interactions (Mongoose schemas and queries).

## 🛡 Security & Auth

- **JWT Strategy**: Dual-token system (Access/Refresh) stored in `HttpOnly` cookies.
- **Refresh Token Rotation**: Refresh tokens are revoked and rotated on every use to prevent replay attacks.
- **Role Guards**: Middleware-based access control (`ROLE_CONSUMER`, `ROLE_SHOPKEEPER`).
- **PII Encryption**: Mobile numbers are encrypted at the application layer using AES-256 before being saved to MongoDB.

## 🧪 Background Tasks (Trigger.dev)

We use [Trigger.dev v3](https://trigger.dev) for reliable background task processing:

- **Location**: `src/app/trigger/`
- **Config**: `trigger.config.ts`
- **Use Cases**: Sending transactional emails, processing order notifications, and long-running data syncs.

## 📦 Core Layers

- `common/config`: Environment validation (using Zod) and DB connections.
- `common/middlewares`: Global error handling, rate limiting, and auth guards.
- `common/utils`: Shared utilities for JWT, cryptographic helpers, and response formatting.

## 🚀 Scripts

- `npm run dev`: Hot-reloading development server (using `tsx`).
- `npm run build`: Compiles TypeScript to `dist/`.
- `npm run typecheck`: Runs strict TypeScript compiler check.
- `npm run migrate:roles`: Pre-seeds necessary role data.

## 🔑 Required Environment Variables

| Variable                | Description                              |
| ----------------------- | ---------------------------------------- |
| `MONGODB_URI`           | Connection string for MongoDB            |
| `ACCESS_TOKEN_SECRET`   | Secret for signing access tokens         |
| `REFRESH_TOKEN_SECRET`  | Secret for signing refresh tokens        |
| `STRIPE_SECRET_KEY`     | Stripe API key for payments              |
| `TRIGGER_SECRET_KEY`    | API key for Trigger.dev background tasks |
| `MOBILE_ENCRYPTION_KEY` | 32-character key for PII encryption      |
