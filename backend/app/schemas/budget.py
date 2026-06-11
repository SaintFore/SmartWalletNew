from decimal import Decimal

from pydantic import field_validator
from sqlmodel import SQLModel


class BudgetBase(SQLModel):
    category_id: int
    amount: Decimal

    @field_validator("amount")
    @classmethod
    def amount_must_be_positive(cls, amount: Decimal) -> Decimal:
        if amount <= 0:
            raise ValueError("amount must be greater than zero")
        return amount


class BudgetCreate(BudgetBase):
    pass


class BudgetRead(BudgetBase):
    id: int


class BudgetUpdate(SQLModel):
    category_id: int | None = None
    amount: Decimal | None = None

    @field_validator("amount")
    @classmethod
    def amount_must_be_positive(cls, amount: Decimal | None) -> Decimal | None:
        if amount is not None and amount <= 0:
            raise ValueError("amount must be greater than zero")
        return amount


class BudgetStatus(SQLModel):
    category_id: int
    category_name: str
    category_icon: str | None
    budget_amount: Decimal
    spent: Decimal
    remaining: Decimal
    percentage: float
