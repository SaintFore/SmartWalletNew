from datetime import date

from sqlmodel import Session

from app.models.account import Account
from app.models.category import Category
from app.schemas.transaction import QuickTransactionCreate
from app.services.transaction_parser import TransactionParseError, parse_quick_transaction


def seed_reference_data(session: Session) -> tuple[Account, Category, Category]:
    account = Account(name="支付宝", icon="🔵", is_default=True)
    food = Category(name="餐饮", icon="🍜")
    other = Category(name="其他", icon="📦")
    session.add(account)
    session.add(food)
    session.add(other)
    session.commit()
    session.refresh(account)
    session.refresh(food)
    session.refresh(other)
    return account, food, other


def test_parse_quick_transaction_uses_local_rules(session: Session):
    account, food, _ = seed_reference_data(session)

    result = parse_quick_transaction(
        QuickTransactionCreate(text="午饭 28 支付宝", date=date(2026, 5, 24)),
        session,
    )

    assert result.name == "午饭"
    assert result.amount == 28.0
    assert result.type == "expense"
    assert result.account_id == account.id
    assert result.category_id == food.id
    assert result.date == date(2026, 5, 24)
    assert result.raw_input == "午饭 28 支付宝"


def test_parse_quick_transaction_rejects_input_without_amount(session: Session):
    seed_reference_data(session)

    from pytest import raises

    with raises(TransactionParseError):
        parse_quick_transaction(QuickTransactionCreate(text="午饭 支付宝"), session)
