# Full-Stack E-commerce (TypeScript Strict)

This repository contains a complete e-commerce starter with strict TypeScript and no `any` usage.

## Stack
- Frontend: React, React Router v7, TanStack Query, Redux Toolkit, Tailwind CSS, react-hot-toast
- Backend: Node.js, Express, MongoDB (Mongoose), JWT auth (access + refresh tokens in HttpOnly cookies)

## Structure
- `/frontend`: frontend application
- `/backend/server`: backend with role-based modular structure

## Run
1. Install dependencies from root:
   - `npm install`
2. Configure backend env:
   - copy `/backend/server/.env.example` to `/backend/server/.env`
3. Start both apps:
   - `npm run dev`
4. URLs:
   - Frontend: `http://localhost:5173`
   - Backend: `http://localhost:5000`

## Auth Behavior
- Register sends an email verification link/token.
- Login sets both `accessToken` and `refreshToken` cookies (only after email verification).
- Forgot password sends a reset token/link, and reset updates password after token verification.
- Protected routes use access token.
- Session refresh endpoint rotates refresh tokens.

## Product Discovery
- Product listing supports search, category filter, price range filter, and pagination.
- Shopkeeper dashboard supports edit product, update stock, and remove product.
- Shopkeepers receive order notifications when consumers place orders.

## Profile
- Consumers can manage: name, multiple delivery contacts (name + address), mobile number, alternate number.
- Shopkeepers can manage: company name, company address, mobile number.
- Mobile numbers are encrypted before being stored in MongoDB.
- During checkout, consumers can select saved delivery contact or enter new name/address/mobile/alternate details.
- Consumers can cancel pending orders from order list.
