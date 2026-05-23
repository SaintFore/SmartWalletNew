# FastAPI Template

A production-ready FastAPI project template with clean architecture, type safety, and modern Python tooling.

## Stack

| Category        | Tool                                                                              |
| --------------- | --------------------------------------------------------------------------------- |
| Framework       | [FastAPI](https://fastapi.tiangolo.com/)                                          |
| ORM             | [SQLModel](https://sqlmodel.tiangolo.com/) (SQLAlchemy + Pydantic)                |
| Migrations      | [Alembic](https://alembic.sqlalchemy.org/)                                        |
| Config          | [pydantic-settings](https://docs.pydantic.dev/latest/concepts/pydantic_settings/) |
| Testing         | [pytest](https://docs.pytest.org/) + [httpx](https://www.python-httpx.org/)       |
| Linting         | [Ruff](https://docs.astral.sh/ruff/)                                              |
| Type Check      | [Pyright](https://microsoft.github.io/pyright/)                                   |
| Package Manager | [uv](https://docs.astral.sh/uv/)                                                  |

## Project Structure

```
fastapi-template/
├── app/
│   ├── api/
│   │   └── routes/         # Request handlers
│   │       ├── health.py   # Health check endpoint
│   │       └── items.py    # CRUD endpoints for items
│   ├── core/
│   │   └── config.py       # App settings via pydantic-settings
│   ├── db/
│   │   └── session.py      # Database engine & session
│   ├── models/
│   │   └── item.py         # SQLModel table models
│   ├── schemas/
│   │   └── item.py         # Pydantic request/response schemas
│   ├── services/
│   │   └── item_service.py # Business logic layer
│   └── main.py             # FastAPI app entry point
├── migrations/             # Alembic migration scripts
├── tests/
│   └── test_health.py
├── pyproject.toml
├── alembic.ini
└── .env.example
```

## Use Project

```bash
pnpm dlx degit SaintFore/fastapi-template backend
```

## Quick Start

### 1. Install dependencies

```bash
uv sync
```

### 2. Configure environment

```bash
cp .env.example .env
# Edit .env with your settings
```

### 3. Run database migrations

```bash
uv run alembic upgrade head
```

### 4. Start the server

```bash
uv run fastapi dev app/main.py
```

The API will be available at `http://localhost:8000`. Interactive docs at `http://localhost:8000/docs`.

## API Endpoints

| Method   | Path              | Description     |
| -------- | ----------------- | --------------- |
| `GET`    | `/api/health`     | Health check    |
| `GET`    | `/api/items`      | List all items  |
| `GET`    | `/api/items/{id}` | Get item by ID  |
| `POST`   | `/api/items`      | Create new item |
| `PATCH`  | `/api/items/{id}` | Update item     |
| `DELETE` | `/api/items/{id}` | Delete item     |

## Development

### Run tests

```bash
uv run pytest
```

### Run tests with coverage

```bash
uv run pytest --cov=app --cov-report=term-missing
```

### Lint & format

```bash
uv run ruff check .
uv run ruff format .
```

### Type check

```bash
uv run pyright
```

### Create a migration

```bash
uv run alembic revision --autogenerate -m "description"
```

## Configuration

Environment variables (set in `.env`):

| Variable       | Default              | Description                |
| -------------- | -------------------- | -------------------------- |
| `APP_NAME`     | `FastAPI Template`   | Application name           |
| `DEBUG`        | `false`              | Enable debug mode          |
| `DATABASE_URL` | `sqlite:///./app.db` | Database connection string |

## Architecture

The project follows a layered architecture:

```
Route → Service → Model
  ↓        ↓        ↓
Schema   Logic    DB
```

- **Routes** (`app/api/routes/`) handle HTTP requests and responses
- **Services** (`app/services/`) contain business logic
- **Models** (`app/models/`) define database tables
- **Schemas** (`app/schemas/`) define request/response shapes

This separation keeps code testable and maintainable.

## License

MIT
