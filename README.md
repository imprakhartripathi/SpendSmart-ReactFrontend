# SpendSmart React Frontend

React + TypeScript + Vite setup with:
- Structured global styling using SCSS modules and Tailwind v4 import.
- Typed environment handling in a dedicated `env.ts`.
- Centralized runtime/app configuration in `config.ts`.

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```
2. Create your local env file:
   ```bash
   cp .env.example .env.local
   ```
3. Start dev server:
   ```bash
   npm run dev
   ```

## Project Structure

```txt
src/
  app/
    App.tsx
  config/
    config.ts
    env.ts
  styles/
    _base.scss
    _tokens.scss
    _utilities.scss
  types/
    env.d.ts
  tailwind.css
  index.scss
  main.tsx
```

## Environment Variables

Define these in `.env.local`:

- `VITE_APP_NAME`
- `VITE_API_BASE_URL`
- `VITE_API_TIMEOUT_MS`
- `VITE_ENABLE_DEVTOOLS`

All env reads are centralized in `src/config/env.ts`.
App-level config exposed to the rest of the app is in `src/config/config.ts`.
