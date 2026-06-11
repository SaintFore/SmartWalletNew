# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

SmartWallet is a personal finance / expense tracker with a Python backend and React frontend living side-by-side in `backend/` and `frontend/`. Each half has its own independent toolchain — no shared monorepo tooling.

## Development Commands

### Backend (run from `backend/`)

```bash
uv sync                                          # install deps
uv run fastapi dev app/main.py                   # dev server on :8000
uv run pytest                                    # run all tests
uv run pytest tests/test_transaction_parser.py   # run single test file
uv run pytest -k "test_name"                     # run single test by name
uv run ruff check .                              # lint
uv run ruff format .                             # format
uv run pyright                                   # type check
uv run alembic upgrade head                      # run migrations
uv run alembic revision --autogenerate -m "desc" # create migration
```

### Frontend (run from `frontend/`)

```bash
pnpm install           # install deps
pnpm dev               # dev server on :5173
pnpm build             # typecheck + production build
pnpm lint              # eslint
pnpm typecheck         # tsc --noEmit
pnpm format            # prettier
pnpm gen:api           # regenerate types from backend OpenAPI spec (backend must be running)
```

### Environment Setup

Both halves need `.env` files copied from their respective `.env.example`:
- Backend: `cp backend/.env.example backend/.env`
- Frontend: `cp frontend/.env.example frontend/.env`

**Backend env vars** (`backend/.env.example`):

| Variable | Purpose | Default |
|----------|---------|---------|
| `DATABASE_URL` | SQLite path (or other DB URL) | `sqlite:///./app.db` |
| `AI_BASE_URL` | OpenAI-compatible API endpoint for transaction parser | `https://api.openai.com/v1` |
| `AI_API_KEY` | API key for the LLM service | (empty — regex fallback used if unset) |
| `AI_MODEL` | Model name for transaction parsing | `gpt-4o-mini` |
| `AI_TIMEOUT_SECONDS` | Timeout for LLM API calls | `10` |
| `APP_NAME` | Application name | `SaintFore` |
| `DEBUG` | Enable debug mode | `true` |

**Frontend env vars** (`frontend/.env.example`):

| Variable | Purpose | Default |
|----------|---------|---------|
| `VITE_API_BASE_URL` | Backend API URL | `http://localhost:8000` |

## Architecture

### Backend — Layered Architecture (FastAPI + SQLModel)

```
Route (app/api/routes/)  →  Service (app/services/)  →  Model (app/models/)
    |                           |                          |
  Schema (app/schemas/)      Business logic             DB tables (SQLModel)
```

- **Routes** handle HTTP, delegate to services, return schemas
- **Services** contain all business logic and DB operations
- **Models** are SQLModel table definitions (Account, Category, Transaction)
- **Core** (`app/core/`) — app configuration and settings (pydantic-settings)
- **DB** (`app/db/`) — database engine/session management
- **Seeds** (`app/seeds/`) run at startup via FastAPI lifespan — default categories (Chinese: 餐饮, 交通, 购物...) and accounts (现金, 支付宝, 微信, 银行卡)
- **Transaction parser** (`app/services/transaction_parser.py`) supports natural-language input (e.g. "午饭 28 支付宝") using OpenAI-compatible API or local regex fallback (runs when `AI_API_KEY` is set)

### Frontend — Feature-Sliced Design (FSD)

Layers import only from layers below them:

```
app/       → entry point, routing, global config
pages/     → route-level compositions
widgets/   → complex UI blocks (app-layout, account-list, charts, etc.)
features/  → user actions with mutations + UI forms (create-*, update-*, delete-*)
entities/  → domain types, API hooks, zod schemas (account, category, transaction)
shared/    → UI primitives (shadcn/ui), utilities, api client
```

Each slice exposes a public API barrel (`index.ts`). Import from the barrel, not internal files.

### API Contract

Frontend types are **auto-generated** from the backend's OpenAPI spec:
1. Start the backend server
2. Run `pnpm gen:api` in frontend
3. Types land in `src/shared/api/types.ts` — **never edit this file manually**

The frontend uses `openapi-fetch` for type-safe API calls against these generated types.

### Key Tech Decisions

- **Database**: SQLite by default, configurable via `DATABASE_URL` env var
- **Amounts**: stored as `Decimal(12,2)`, not float
- **Charts**: custom D3.js components (BarChart, LineChart, PieChart) — no charting library
- **Forms**: React Hook Form + Zod 4 validation
- **Styling**: Tailwind CSS 4 + shadcn/ui (new-york style, zinc base color)
- **Locale**: zh-CN, CNY currency formatting

## Tests

Only the backend has tests (pytest). There are no frontend tests. Test files are in `backend/tests/` covering: health check, transaction parser, transaction schema, transaction service, and delete constraints.
