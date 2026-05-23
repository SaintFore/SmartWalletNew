from datetime import date, datetime

from sqlmodel import SQLModel


class TransactionBase(SQLModel):
    name: str | None = None
    amount: float
    type: str
    category_id: int
    description: str | None = None


class TransactionCreate(TransactionBase):
    pass


class TransactionRead(TransactionBase):
    id: int
    date: date
    created_at: datetime


class TransactionUpdate(SQLModel):
    name: int | None = None
    amount: float | None = None
    type: str | None = None
    category_id: int | None = None
    description: str | None = None
