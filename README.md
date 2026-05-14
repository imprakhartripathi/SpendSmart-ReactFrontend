# SpendSmart React Frontend

SpendSmart is a React + TypeScript + Vite frontend integrated with 8 Spring Boot microservices:
- Auth
- Expense
- Income
- Category
- Budget
- Analytics
- Recurring
- Notification

The default integration path is through API Gateway (`http://localhost:8080/api/*`).

## What This App Includes

- Authentication: register + login
- Profile management: profile update, currency update, monthly budget goal, account deactivation
- Expense management: create, edit, delete, search
- Income management: create, edit, delete, search
- Category management: create, edit, delete, default seeding
- Budget management: create, edit, delete, progress tracking, alert dispatch
- Recurring management: create, edit, deactivate, delete, process due now, upcoming list
- Notifications center: mark read, acknowledge, mark all read, delete
- Analytics dashboard:
  - Monthly summary
  - Category pie chart
  - Income vs expense chart
  - Daily expense trend
  - Savings rate trend
  - Cashflow trend
  - Forecast + health score

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```
2. Create local env file:
   ```bash
   cp .env.example .env.local
   ```
3. Run dev server:
   ```bash
   npm run dev
   ```
4. Build production bundle:
   ```bash
   npm run build
   ```

## Environment Variables

Set these in `.env.local`:

- `VITE_APP_NAME`
- `VITE_API_BASE_URL`
- `VITE_AUTH_API_URL`
- `VITE_EXPENSE_API_URL`
- `VITE_INCOME_API_URL`
- `VITE_CATEGORY_API_URL`
- `VITE_BUDGET_API_URL`
- `VITE_ANALYTICS_API_URL`
- `VITE_RECURRING_API_URL`
- `VITE_NOTIFICATION_API_URL`
- `VITE_API_TIMEOUT_MS`
- `VITE_ENABLE_DEVTOOLS`

For gateway mode, keep each `VITE_*_API_URL` at `http://localhost:8080/api`.

All env parsing is in `src/config/env.ts`.
Runtime app config is in `src/config/config.ts`.
