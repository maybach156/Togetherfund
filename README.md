# TogetherFund v2 — real-payment-ready MVP

## What is implemented
- Registration/login with bcrypt password hashing and JWT sessions
- Neon PostgreSQL schema
- Campaign creation (pending admin approval) and public approved campaign listing
- Paystack transaction initialization in NGN and server-side verification
- Paystack signed webhook endpoint
- Contribution history endpoint
- Campaign-owner withdrawal requests with admin review (manual bank transfer only)
- Contribution-circle creation and admin approval status
- Mutual-support request creation and public open requests
- Admin API for approving/rejecting campaigns and reviewing withdrawal requests

## Setup and deploy
1. Create a Neon PostgreSQL database.
2. Run `schema.sql` in Neon SQL Editor.
3. Push this project to GitHub and import it in Vercel.
4. Add Vercel environment variables:
   - `DATABASE_URL`: Neon connection string
   - `JWT_SECRET`: long random secret (32+ random characters)
   - `PAYSTACK_SECRET_KEY`: use `sk_test_...` while testing
   - `APP_URL`: exact deployed HTTPS URL, e.g. `https://your-project.vercel.app`
5. Redeploy after adding environment variables.
6. Register your own account.
7. In Neon SQL Editor, promote that account:
   `UPDATE users SET role='admin' WHERE email='your-email@example.com';`
8. In Paystack Dashboard → Settings/API Keys & Webhooks, add webhook URL:
   `https://YOUR_DOMAIN/api/paystack-webhook`
9. Test with Paystack test keys and test cards before any live use.
10. Only after Paystack approves the business and live collections, replace the test secret with the live `sk_live_...` key and redeploy.

## Admin API
- `GET /api/admin` (admin JWT)
- `POST /api/admin` JSON examples:
  - `{ "type":"campaign", "id":1, "action":"active" }`
  - `{ "type":"campaign", "id":1, "action":"rejected" }`
  - `{ "type":"withdrawal", "id":1, "action":"approved", "note":"Verified details" }`
The code intentionally does not execute a bank transfer or mark a withdrawal paid automatically. Admins must verify the recipient and complete a bank transfer through an approved banking/payment channel before recording a paid status in a future audited admin workflow.

## Important limitations before real launch
This is a deployable software MVP, not a bank, stored-value wallet, escrow, investment scheme, or regulatory approval. The code does not custody funds or automatically disburse them. Paystack processes each donor payment; withdrawals are requests to the campaign owner and are reviewed separately. Do not advertise or activate Ajo/Esusu circles that pool or rotate funds until Nigerian legal/regulatory review, payment-provider approval and safeguards are completed. Add KYC, privacy policy, terms, consent, complaints/disputes, refund handling, rate limiting, email verification, password reset, audit logging, monitoring, backups, and security testing before production. Protect the admin account and never share secret keys in chat or GitHub.
