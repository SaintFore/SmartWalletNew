from sqlmodel import SQLModel


class TransactionBase(SQLModel):
    name: str
    description: str | None = None


class TransactionCreate(TransactionBase):
    pass


class TransactionRead(TransactionBase):
    id: int


class TransactionUpdate(SQLModel):
    name: int | None = None
    description: str | None = None
