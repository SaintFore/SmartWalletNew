from sqlmodel import Session, select

from app.models.account import Account
from app.schemas.account import AccountCreate, AccountUpdate


def get_all(session: Session) -> list[Account]:
    statement = select(Account).order_by(Account.name)
    return list(session.exec(statement).all())


def get_by_id(session: Session, account_id: int) -> Account | None:
    return session.get(Account, account_id)


def get_default(session: Session) -> Account | None:
    statement = select(Account).where(Account.is_default == True)  # noqa: E712
    return session.exec(statement).first()


def get_or_create_default(session: Session) -> Account:
    account = get_default(session)
    if account is not None:
        return account

    account = Account(name="现金", icon="💵", is_default=True)
    session.add(account)
    session.commit()
    session.refresh(account)
    return account


def create(account_in: AccountCreate, session: Session) -> Account:
    if account_in.is_default:
        _clear_default(session)
    account = Account.model_validate(account_in)
    session.add(account)
    session.commit()
    session.refresh(account)
    return account


def update(account_id: int, account_in: AccountUpdate, session: Session) -> Account | None:
    account = session.get(Account, account_id)
    if account is None:
        return None

    update_data = account_in.model_dump(exclude_unset=True)
    if update_data.get("is_default") is True:
        _clear_default(session)

    for key, value in update_data.items():
        setattr(account, key, value)
    session.add(account)
    session.commit()
    session.refresh(account)
    return account


def delete(account_id: int, session: Session) -> Account | None:
    account = session.get(Account, account_id)
    if account is None:
        return None
    session.delete(account)
    session.commit()
    return account


def _clear_default(session: Session) -> None:
    for account in session.exec(select(Account).where(Account.is_default == True)).all():  # noqa: E712
        account.is_default = False
        session.add(account)
