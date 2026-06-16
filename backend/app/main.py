from collections.abc import AsyncGenerator
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.router import api_router
from app.core.config import settings
from app.db.session import engine
from app.seeds.accounts import seed_accounts
from app.seeds.categories import seed_categories


def _ensure_indexes() -> None:
    """创建索引（如果不存在），用于兼容已有数据库。"""
    with engine.begin() as conn:
        conn.exec_driver_sql("CREATE INDEX IF NOT EXISTS ix_transaction_date ON \"transaction\" (date)")
        conn.exec_driver_sql("CREATE INDEX IF NOT EXISTS ix_transaction_account_id ON \"transaction\" (account_id)")
        conn.exec_driver_sql("CREATE INDEX IF NOT EXISTS ix_transaction_category_id ON \"transaction\" (category_id)")
        conn.exec_driver_sql("CREATE INDEX IF NOT EXISTS ix_transaction_type ON \"transaction\" (type)")


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncGenerator[None, None]:
    _ensure_indexes()
    seed_categories()
    seed_accounts()
    yield


app = FastAPI(
    title=settings.app_name,
    debug=settings.debug,
    lifespan=lifespan,
)
origins = [
    "http://localhost:5173",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router, prefix="/api")
