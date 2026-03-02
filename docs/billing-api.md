# Billing API

- Base path: `/api/v1/billing`
- Auth:
  - Token required for user billing info (`routes/billingRoutes.js:6-8`)
  - Admin required for bank and payroll management (`routes/billingRoutes.js:9-12,14-16`)
  - Public: `GET /banks` (`routes/billingRoutes.js:13`)

## POST /
- Route: `routes/billingRoutes.js:6`
- Handler: `controllers/billingController.js:112`
- Summary: Creates billing info for the authenticated user (one record per user).
- Request body: billing fields; `userId` is taken from the token.
- Response 201: created billing document
- Errors:
  - 400 when billing info already exists
  - 500

## PUT /
- Route: `routes/billingRoutes.js:7`
- Handler: `controllers/billingController.js:125`
- Summary: Updates the authenticated user's billing info.
- Request body: partial or full billing fields
- Response 200: updated billing document
- Errors:
  - 404 when billing info not found
  - 500

## GET /
- Route: `routes/billingRoutes.js:8`
- Handler: `controllers/billingController.js:141`
- Summary: Retrieves the authenticated user's billing info.
- Response 200: billing document
- Errors:
  - 404 when billing info not found
  - 500

## POST /banks/add
- Route: `routes/billingRoutes.js:9`
- Handler: `controllers/billingController.js:7`
- Summary: Creates a new bank record (admin only).
- Request body: bank fields (e.g., `bankName`, etc.)
- Response 201:
  - `{ "message": "Bank created successfully", "bank": { ... } }`
- Errors:
  - 409 when bank with same `bankName` exists
  - 500

## GET /banks/:id
- Route: `routes/billingRoutes.js:10`
- Handler: `controllers/billingController.js:24`
- Summary: Retrieves a bank by its id (admin only).
- URL params: `id`
- Response 200: bank document
- Errors:
  - 404 when bank not found
  - 500

## PATCH /banks/update/:id
- Route: `routes/billingRoutes.js:11`
- Handler: `controllers/billingController.js:34`
- Summary: Updates a bank record by id (admin only).
- URL params: `id`
- Request body: partial or full bank fields
- Response 200: updated bank document
- Errors:
  - 404 when bank not found
  - 500

## DELETE /banks/delete/:id
- Route: `routes/billingRoutes.js:12`
- Handler: `controllers/billingController.js:47`
- Summary: Deletes a bank record by id (admin only).
- URL params: `id`
- Response 200:
  - `{ "message": "Bank deleted successfully" }`
- Errors:
  - 404 when bank not found
  - 500

## GET /banks
- Route: `routes/billingRoutes.js:13`
- Handler: `controllers/billingController.js:59`
- Summary: Lists all banks (public).
- Response 200: array of bank documents
- Errors: 500

## POST /payroll
- Route: `routes/billingRoutes.js:14`
- Handler: `controllers/billingController.js:68`
- Summary: Creates a payroll record (admin only). Auto-generates `traceId`, `idempotencyKey`, `trxReference`.
- Request body: payroll fields
- Response 200: created payroll document
- Errors: 500

## GET /payroll/:id
- Route: `routes/billingRoutes.js:15`
- Handler: `controllers/billingController.js:101`
- Summary: Retrieves a payroll record by id (admin only).
- URL params: `id`
- Response 200: payroll document
- Errors:
  - 404 when payroll not found
  - 500

## POST /payroll/update/:id
- Route: `routes/billingRoutes.js:16`
- Handler: `controllers/billingController.js:83`
- Summary: Updates a payroll record by id (admin only). System-managed fields (`traceId`, `idempotencyKey`, `trxReference`) are ignored.
- URL params: `id`
- Request body: partial or full payroll fields
- Response 200: updated payroll document
- Errors:
  - 403 when `paymentStatus` is `scheduled` or `failed`
  - 500
