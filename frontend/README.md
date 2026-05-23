# Vite Template React

A production-ready React + TypeScript starter template with routing, data fetching, form validation, and a type-safe API client — all wired up and ready to go.

## Tech Stack

| Layer         | Tool                                      |
| ------------- | ----------------------------------------- |
| Framework     | React 19                                  |
| Language      | TypeScript 5.9 (strict)                   |
| Build         | Vite 7 + SWC                              |
| Styling       | Tailwind CSS 4                            |
| Components    | shadcn/ui (new-york)                      |
| Routing       | React Router 7                            |
| Data Fetching | TanStack React Query 5                    |
| Forms         | React Hook Form 7 + Zod 4                 |
| API Client    | openapi-fetch (type-safe, auto-generated) |
| Animations    | Framer Motion                             |
| Icons         | Lucide React                              |

Every dependency is actually used — zero bloat.

## Getting Started

```bash
# Install dependencies
pnpm install

# Copy environment file
cp .env.example .env

# Start dev server
pnpm dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

## Scripts

| Command        | Description                            |
| -------------- | -------------------------------------- |
| `pnpm dev`     | Start dev server                       |
| `pnpm build`   | Type check + production build          |
| `pnpm preview` | Preview production build               |
| `pnpm lint`    | Run ESLint                             |
| `pnpm gen:api` | Regenerate API types from OpenAPI spec |

## Project Structure

```
src/
├── api/
│   ├── client.ts          # openapi-fetch client (reads VITE_API_BASE_URL)
│   └── types.ts           # Auto-generated from OpenAPI — do not edit
├── components/
│   ├── ErrorBoundary.tsx  # Catches render errors, shows fallback UI
│   └── ui/                # shadcn/ui components
├── hooks/
│   ├── use-dark-mode.ts   # Dark mode with localStorage persistence
│   └── use-items.ts       # React Query hooks for Items CRUD
├── lib/
│   └── utils.ts           # cn() helper
├── pages/
│   ├── LandingPage.tsx    # Home page
│   ├── ItemsPage.tsx      # CRUD demo (react-query + react-hook-form + zod)
│   └── NotFoundPage.tsx   # 404
├── schemas/
│   └── item.ts            # Zod schemas matching API types
├── App.tsx                # Router config + ErrorBoundary + code splitting
├── main.tsx               # Entry point + QueryClientProvider
├── index.css              # shadcn theme + Tailwind
└── env.d.ts               # TypeScript declarations for env vars
```

## Environment Variables

| Variable            | Description          | Default                 |
| ------------------- | -------------------- | ----------------------- |
| `VITE_API_BASE_URL` | Backend API base URL | `http://localhost:8000` |

## How to Extend

### Add a new page

1. Create `src/pages/DashboardPage.tsx`
2. Add route in `App.tsx`:

   ```tsx
   const DashboardPage = lazy(() => import("./pages/DashboardPage"));
   // in router array:
   { path: "/dashboard", element: withSuspense(<DashboardPage />) }
   ```

### Add a new API endpoint

1. Make sure your backend is running
2. Run `pnpm gen:api` to regenerate types
3. Create hooks in `src/hooks/` following the pattern in `use-items.ts`

### Add a new form with validation

1. Define schema in `src/schemas/`
2. Use `useForm` + `zodResolver` as shown in `ItemsPage.tsx`

### Add shadcn/ui components

```bash
pnpm dlx shadcn@latest add <component-name>
```

## API Types

Types are auto-generated from your backend's OpenAPI spec:

```bash
pnpm gen:api
```

This reads `http://localhost:8000/openapi.json` and writes to `src/api/types.ts`. **Do not edit that file manually** — it will be overwritten.

To change the API URL, update the `gen:api` script in `package.json` or set `VITE_API_BASE_URL` in your `.env`.
