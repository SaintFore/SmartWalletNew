from __future__ import annotations

from datetime import date as Date
from datetime import datetime
from decimal import Decimal
from typing import Literal

from pydantic import field_validator
from sqlmodel import SQLModel


class TransactionBase(SQLModel):
    name: str | None = None
    amount: Decimal
    type: Literal["expense", "income"]
    category_id: int
    account_id: int
    description: str | None = None
    raw_input: str | None = None
    date: Date

    @field_validator("amount")
    @classmethod
    def amount_must_be_positive(cls, amount: Decimal) -> Decimal:
        if amount <= 0:
            raise ValueError("amount must be greater than zero")
        return amount


class TransactionCreate(TransactionBase):
    pass


class TransactionRead(TransactionBase):
    id: int
    date: Date
    created_at: datetime


class TransactionUpdate(SQLModel):
    name: str | None = None
    amount: Decimal | None = None
    type: Literal["expense", "income"] | None = None
    category_id: int | None = None
    account_id: int | None = None
    description: str | None = None
    raw_input: str | None = None
    date: Date | None = None
    @field_validator("amount")
    @classmethod
    def amount_must_be_positive(cls, amount: Decimal | None) -> Decimal | None:
        if amount is not None and amount <= 0:
            raise ValueError("amount must be greater than zero")
        return amount


class CategorySummary(SQLModel):
    category_id: int
    category_name: str
    category_icon: str | None
    total: Decimal
    count: int

class DailySummary(SQLModel):
    date: Date
    total_expense: Decimal
    total_income: Decimal
    net: Decimal



class TransactionSummary(SQLModel):
    total_expense: Decimal
    total_income: Decimal
    net: Decimal
    by_category: list[CategorySummary]
    by_day: list[DailySummary]


class QuickTransactionCreate(SQLModel):
    text: str
    date: Date | None = None
    description: str | None = None
