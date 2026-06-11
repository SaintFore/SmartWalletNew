from datetime import UTC, date, datetime
from decimal import Decimal

from sqlmodel import Field, SQLModel


class Transaction(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    name: str | None = None
    amount: Decimal = Field(max_digits=12, decimal_places=2)
    type: str = Field(default="expense")
    category_id: int = Field(foreign_key="category.id")
    account_id: int = Field(foreign_key="account.id")
    to_account_id: int | None = Field(default=None, foreign_key="account.id")
    description: str | None = None
    raw_input: str | None = None
    tags: str | None = None
    date: date
    created_at: datetime = Field(default_factory=lambda: datetime.now(UTC))
