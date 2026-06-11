from decimal import Decimal

from sqlalchemy import case
from sqlalchemy.exc import IntegrityError
from sqlmodel import Session, func, select

from app.models.account import Account
from app.models.transaction import Transaction
from app.schemas.account import AccountCreate, AccountUpdate, AccountWithBalance


class AccountInUseError(ValueError):
    pass


class AccountNameDuplicateError(ValueError):
    pass


def get_all(session: Session) -> list[Account]:
    statement = select(Account).order_by(Account.name)
    return list(session.exec(statement).all())


def get_all_with_balance(session: Session) -> list[AccountWithBalance]:
    """获取所有账户及其余额。"""
    accounts = get_all(session)

    # 计算每个账户的余额：收入为正，支出为负
    balance_stmt = select(
        Transaction.account_id,
        func.sum(
            case(
                (Transaction.type == "income", Transaction.amount),  # type: ignore[arg-type]
                else_=-Transaction.amount,
            )
        ).label("balance"),
    ).group_by(Transaction.account_id)  # type: ignore[arg-type]
    balance_results = session.exec(balance_stmt).all()
    balance_map: dict[int, Decimal] = {row[0]: row[1] or Decimal("0") for row in balance_results}

    # 查找有交易记录的账户
    txn_account_ids = set(session.exec(select(Transaction.account_id).distinct()).all())

    return [
        AccountWithBalance(
            id=account.id,  # type: ignore[arg-type]
            name=account.name,
            icon=account.icon,
            is_default=account.is_default,
            balance=balance_map.get(account.id, Decimal("0")),  # type: ignore[arg-type]
            has_transactions=account.id in txn_account_ids,  # type: ignore[arg-type]
        )
        for account in accounts
    ]


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
    try:
        session.commit()
    except IntegrityError:
        session.rollback()
        raise AccountNameDuplicateError(f"账户名 '{account_in.name}' 已存在") from None
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
    try:
        session.commit()
    except IntegrityError:
        session.rollback()
        raise AccountNameDuplicateError(
            f"账户名 '{update_data.get('name', account.name)}' 已存在"
        ) from None
    session.refresh(account)
    return account


def delete(account_id: int, session: Session) -> Account | None:
    account = session.get(Account, account_id)
    if account is None:
        return None
    has_transactions = session.exec(
        select(Transaction).where(Transaction.account_id == account_id)
    ).first()
    if has_transactions is not None:
        raise AccountInUseError("Account has transactions")
    session.delete(account)
    session.commit()
    return account


def _clear_default(session: Session) -> None:
    for account in session.exec(select(Account).where(Account.is_default == True)).all():  # noqa: E712
        account.is_default = False
        session.add(account)
