from decimal import Decimal

from sqlmodel import Field, SQLModel


class Budget(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    category_id: int = Field(foreign_key="category.id", unique=True)
    amount: Decimal = Field(max_digits=12, decimal_places=2)
