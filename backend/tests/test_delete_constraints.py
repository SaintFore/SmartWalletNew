from datetime import date
from decimal import Decimal

from sqlmodel import Session

from app.models.account import Account
from app.models.category import Category
from app.models.transaction import Transaction
from app.services.account_service import AccountInUseError
from app.services.account_service import delete as delete_account
from app.services.category_service import CategoryInUseError
from app.services.category_service import delete as delete_category


def create_referenced_transaction(session: Session) -> tuple[int, int]:
    account = Account(name="现金", icon="💵", is_default=True)
    category = Category(name="餐饮", icon="🍜")
    session.add(account)
    session.add(category)
    session.commit()
    session.refresh(account)
    session.refresh(category)
    assert account.id is not None
    assert category.id is not None

    session.add(
        Transaction(
            name="午餐",
            amount=Decimal("28.50"),
            type="expense",
            category_id=category.id,
            account_id=account.id,
            date=date(2026, 5, 26),
        )
    )
    session.commit()
    return account.id, category.id


def test_delete_account_rejects_referenced_account(session: Session):
    account_id, _ = create_referenced_transaction(session)

    from pytest import raises

    with raises(AccountInUseError):
        delete_account(account_id, session)

    assert session.get(Account, account_id) is not None


def test_delete_category_rejects_referenced_category(session: Session):
    _, category_id = create_referenced_transaction(session)

    from pytest import raises

    with raises(CategoryInUseError):
        delete_category(category_id, session)

    assert session.get(Category, category_id) is not None
