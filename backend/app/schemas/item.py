from sqlmodel import SQLModel


class ItemBase(SQLModel):
    name: str
    description: str | None = None


class ItemCreate(ItemBase):
    pass


class ItemRead(ItemBase):
    id: int


class ItemUpdate(SQLModel):
    name: int | None = None
    description: str | None = None
