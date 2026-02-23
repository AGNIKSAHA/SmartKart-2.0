# Architecture

## Backend Layers
- `common/config`: environment loading, validation, and MongoDB connection.
- `common/middleware`: auth guard, role guard, validation, error handling.
- `common/types`: domain and request context types.
- `common/utils`: JWT, IDs, duration parsing, response formatter.
- `modules/*`: route + controller + service + MongoDB-backed store.

## Database
- MongoDB via Mongoose.
- Each module owns its schema and persistence logic in `*.store.ts`.
- Product seeding runs at startup when product collection is empty.
- User mobile numbers are encrypted at application layer before persistence.

## Auth Strategy
- Access token and refresh token are both set as `HttpOnly` cookies.
- `accessToken` is short-lived and used for protected API calls.
- `refreshToken` rotates on each refresh call and previous token is revoked.
- Refresh token records are stored in MongoDB (`modules/token`).
- Email verification token and forgot/reset password tokens are issued and validated by auth module.

## E-commerce Domain
- `products`: list/view for public with search, filters, pagination; create/update for shopkeeper.
- `cart`: consumer-only cart management.
- `orders`: consumer-only checkout and order history.
- `profile`: role-specific profile read/update for consumer and shopkeeper.
