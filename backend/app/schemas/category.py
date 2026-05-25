from sqlmodel import SQLModel


class CategoryBase(SQLModel):
    name: str
    icon: str | None = None


class CategoryCreate(CategoryBase):
    pass


class CategoryRead(CategoryBase):
    id: int


class CategoryUpdate(SQLModel):
    name: str | None = None
    icon: str | None = None
