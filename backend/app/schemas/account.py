from sqlmodel import SQLModel


class AccountBase(SQLModel):
    name: str
    icon: str | None = None
    is_default: bool = False


class AccountCreate(AccountBase):
    pass


class AccountRead(AccountBase):
    id: int


class AccountUpdate(SQLModel):
    name: str | None = None
    icon: str | None = None
    is_default: bool | None = None
