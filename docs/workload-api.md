# Workload API

- Base path: `/api/v1/task`
- Auth: `authenticateToken` and `authorizeAdmin` required for all endpoints (`routes/myTaskRoutes.js:14-20`)

## GET /workload
- Route: `routes/myTaskRoutes.js:14`
- Handler: `controllers/workloadController.js:7`
- Summary: Returns all workload entries and a per-user summary.
- Response 200:
  - `workloads`: array of documents with populated `user`, `task`, `assignedBy`
  - `summary`: object keyed by `userId` with `totalPoints`, `tasks`, and `items`
- Errors: 500

## POST /workload/assign
- Route: `routes/myTaskRoutes.js:15`
- Handler: `controllers/workloadController.js:38`
- Summary: Assigns a task to a user; enforces user's max active workload limit if configured.
- Request body:
  - `userId` (string, required)
  - `taskId` (string, required)
  - `workloadPoints` (number, optional, default `1`)
  - `status` (string, optional, default `Pending`)
- Response 201:
  - `{ "message": "Workload assigned", "workload": { ... } }`
- Errors:
  - 400 when `userId`/`taskId` missing or user has reached limit
  - 404 when user or task not found
  - 500

## PUT /workload/:id
- Route: `routes/myTaskRoutes.js:16`
- Handler: `controllers/workloadController.js:75`
- Summary: Updates workload fields and returns the populated document.
- URL params:
  - `id` (string, required)
- Request body (any subset):
  - `userId` (string)
  - `taskId` (string)
  - `status` (string)
  - `workloadPoints` (number)
- Response 200:
  - `{ "message": "Workload updated", "workload": { ... } }`
- Errors:
  - 404 when workload, new user, or task not found
  - 500

## DELETE /workload/:id
- Route: `routes/myTaskRoutes.js:17`
- Handler: `controllers/workloadController.js:110`
- Summary: Deletes a workload entry.
- URL params:
  - `id` (string, required)
- Response 200:
  - `{ "message": "Workload removed" }`
- Errors:
  - 404 when workload not found
  - 500

## GET /workload/limit/:userId
- Route: `routes/myTaskRoutes.js:19`
- Handler: `controllers/workloadController.js:124`
- Summary: Returns a user's configured max active tasks limit.
- URL params:
  - `userId` (string, required)
- Response 200:
  - `{ "userId": "<id>", "limit": <number|null> }`
- Errors: 500

## PUT /workload/limit/:userId
- Route: `routes/myTaskRoutes.js:20`
- Handler: `controllers/workloadController.js:136`
- Summary: Creates or updates a user's max active tasks limit.
- URL params:
  - `userId` (string, required)
- Request body:
  - `maxTasksPerUser` (number, required)
- Response 200:
  - `{ "message": "Workload limit updated", "setting": { ... } }`
- Errors:
  - 400 when `maxTasksPerUser` missing
  - 500
