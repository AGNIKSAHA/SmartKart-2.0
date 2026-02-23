# Backend Server

Node.js + Express backend with strict TypeScript, MongoDB (Mongoose), JWT auth in cookies, role-based guards, and e-commerce endpoints.

Email verification and password reset emails are sent via SMTP using:
- `MAIL_SERVICE`
- `EMAIL_USER`
- `EMAIL_PASS`

Mobile encryption uses:
- `MOBILE_ENCRYPTION_KEY`

## Scripts
- `npm run dev`
- `npm run build`
- `npm run typecheck`
- `npm run migrate:roles`
