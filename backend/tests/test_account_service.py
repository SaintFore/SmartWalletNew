from datetime import date
from decimal import Decimal

from sqlmodel import Session

from app.models.account import Account
from app.models.category import Category
from app.models.transaction import Transaction
from app.services.account_service import (
    AccountInUseError,
    AccountNameDuplicateError,
    create,
    delete,
    get_all_with_balance,
    get_by_id,
    update,
)
from app.schemas.account import AccountCreate, AccountUpdate


def test_get_all_with_balance_empty(session: Session):
    """无账户时返回空列表。"""
    result = get_all_with_balance(session)
    assert result == []


def test_get_all_with_balance_no_transactions(session: Session):
    """有账户但无交易时余额为 0。"""
    account = Account(name="现金", icon="💵", is_default=True)
    session.add(account)
    session.commit()
    session.refresh(account)

    result = get_all_with_balance(session)

    assert len(result) == 1
    assert result[0].name == "现金"
    assert result[0].balance == Decimal("0")
    assert result[0].has_transactions is False


def test_get_all_with_balance_with_transactions(session: Session):
    """有交易的账户显示正确余额。"""
    account = Account(name="支付宝", icon="💰")
    category = Category(name="餐饮", icon="🍜")
    session.add(account)
    session.add(category)
    session.commit()
    session.refresh(account)
    session.refresh(category)
    assert account.id is not None
    assert category.id is not None

    # 收入 1000
    session.add(Transaction(
        name="工资",
        amount=Decimal("1000.00"),
        type="income",
        category_id=category.id,
        account_id=account.id,
        date=date(2026, 5, 1),
    ))
    # 支出 200
    session.add(Transaction(
        name="午餐",
        amount=Decimal("200.00"),
        type="expense",
        category_id=category.id,
        account_id=account.id,
        date=date(2026, 5, 2),
    ))
    session.commit()

    result = get_all_with_balance(session)

    assert len(result) == 1
    assert result[0].balance == Decimal("800.00")
    assert result[0].has_transactions is True


def test_get_all_with_balance_transfer_affects_source(session: Session):
    """转账只影响转出账户余额（单条记录，to_account_id 不产生独立记账）。"""
    account1 = Account(name="现金", icon="💵")
    account2 = Account(name="支付宝", icon="💰")
    category = Category(name="转账", icon="🔄")
    session.add(account1)
    session.add(account2)
    session.add(category)
    session.commit()
    session.refresh(account1)
    session.refresh(account2)
    session.refresh(category)
    assert account1.id is not None and account2.id is not None and category.id is not None

    # 转账：从 account1 到 account2，金额 500
    session.add(Transaction(
        name="转账",
        amount=Decimal("500.00"),
        type="transfer",
        category_id=category.id,
        account_id=account1.id,
        to_account_id=account2.id,
        date=date(2026, 5, 1),
    ))
    session.commit()

    result = get_all_with_balance(session)
    by_id = {r.id: r for r in result}

    # 转账记录在 account1 上，余额为 -500
    assert by_id[account1.id].balance == Decimal("-500.00")
    assert by_id[account1.id].has_transactions is True
    # account2 没有直接交易记录，余额为 0
    assert by_id[account2.id].balance == Decimal("0")
    assert by_id[account2.id].has_transactions is False


def test_create_account(session: Session):
    """创建账户。"""
    result = create(AccountCreate(name="银行卡", icon="💳"), session)

    assert result.name == "银行卡"
    assert result.icon == "💳"
    assert result.id is not None


def test_create_account_duplicate_name(session: Session):
    """重名账户抛出异常。"""
    create(AccountCreate(name="现金", icon="💵"), session)

    from pytest import raises

    with raises(AccountNameDuplicateError):
        create(AccountCreate(name="现金", icon="💰"), session)


def test_update_account(session: Session):
    """更新账户信息。"""
    account = create(AccountCreate(name="现金", icon="💵"), session)
    assert account.id is not None

    result = update(account.id, AccountUpdate(name="现金钱包"), session)

    assert result is not None
    assert result.name == "现金钱包"


def test_update_account_not_found(session: Session):
    """更新不存在的账户返回 None。"""
    result = update(999, AccountUpdate(name="测试"), session)
    assert result is None


def test_delete_account(session: Session):
    """删除无交易的账户。"""
    account = create(AccountCreate(name="临时账户", icon="🗑️"), session)
    assert account.id is not None

    result = delete(account.id, session)

    assert result is not None
    assert get_by_id(session, account.id) is None


def test_delete_account_with_transactions_raises(session: Session):
    """删除有交易的账户抛出异常。"""
    account = Account(name="现金", icon="💵")
    category = Category(name="餐饮", icon="🍜")
    session.add(account)
    session.add(category)
    session.commit()
    session.refresh(account)
    session.refresh(category)
    assert account.id is not None and category.id is not None

    session.add(Transaction(
        name="午餐",
        amount=Decimal("28.00"),
        type="expense",
        category_id=category.id,
        account_id=account.id,
        date=date(2026, 5, 1),
    ))
    session.commit()

    from pytest import raises

    with raises(AccountInUseError):
        delete(account.id, session)


def test_delete_account_not_found(session: Session):
    """删除不存在的账户返回 None。"""
    result = delete(999, session)
    assert result is None
