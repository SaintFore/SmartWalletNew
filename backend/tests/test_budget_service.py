from datetime import date
from decimal import Decimal

from sqlmodel import Session

from app.models.account import Account
from app.models.budget import Budget
from app.models.category import Category
from app.models.transaction import Transaction
from app.schemas.budget import BudgetCreate, BudgetUpdate
from app.services.budget_service import (
    BudgetDuplicateError,
    create,
    delete,
    get_all,
    get_budget_status,
    get_by_id,
    update,
)


def create_budget_with_transactions(session: Session) -> tuple[Budget, Category, int]:
    """创建预算和关联的交易数据。"""
    account = Account(name="现金", icon="💵", is_default=True)
    category = Category(name="餐饮", icon="🍜")
    session.add(account)
    session.add(category)
    session.commit()
    session.refresh(account)
    session.refresh(category)
    assert account.id is not None
    assert category.id is not None

    budget = create(BudgetCreate(category_id=category.id, amount=Decimal("500.0")), session)

    # 创建本月支出 200
    session.add(
        Transaction(
            name="午餐",
            amount=Decimal("200.0"),
            type="expense",
            category_id=category.id,
            account_id=account.id,
            date=date(2026, 5, 10),
        )
    )
    session.commit()

    return budget, category, account.id


def test_budget_crud(session: Session):
    """测试预算的增删改查。"""
    category = Category(name="餐饮", icon="🍜")
    session.add(category)
    session.commit()
    session.refresh(category)
    assert category.id is not None

    # 创建
    budget = create(BudgetCreate(category_id=category.id, amount=Decimal("500.0")), session)
    assert budget.id is not None
    assert budget.amount == Decimal("500.0")

    # 查询
    found = get_by_id(session, budget.id)
    assert found is not None
    assert found.category_id == category.id

    # 列表
    all_budgets = get_all(session)
    assert len(all_budgets) == 1

    # 更新
    updated = update(budget.id, BudgetUpdate(amount=Decimal("800.0")), session)
    assert updated is not None
    assert updated.amount == Decimal("800.0")

    # 删除
    deleted = delete(budget.id, session)
    assert deleted is not None
    assert get_by_id(session, budget.id) is None


def test_budget_duplicate_category(session: Session):
    """测试同一分类不能创建两个预算。"""
    category = Category(name="餐饮", icon="🍜")
    session.add(category)
    session.commit()
    session.refresh(category)
    assert category.id is not None

    create(BudgetCreate(category_id=category.id, amount=Decimal("500.0")), session)

    from pytest import raises

    with raises(BudgetDuplicateError):
        create(BudgetCreate(category_id=category.id, amount=Decimal("300.0")), session)


def test_budget_status(session: Session):
    """测试预算执行状态查询。"""
    budget, category, _ = create_budget_with_transactions(session)

    results = get_budget_status(2026, 5, session)

    assert len(results) == 1
    status = results[0]
    assert status.category_id == category.id
    assert status.budget_amount == Decimal("500.0")
    assert status.spent == Decimal("200.0")
    assert status.remaining == Decimal("300.0")
    assert status.percentage == 40.0


def test_budget_status_empty_month(session: Session):
    """测试没有支出月份的预算状态。"""
    category = Category(name="餐饮", icon="🍜")
    session.add(category)
    session.commit()
    session.refresh(category)
    assert category.id is not None

    create(BudgetCreate(category_id=category.id, amount=Decimal("500.0")), session)

    results = get_budget_status(2026, 1, session)

    assert len(results) == 1
    assert results[0].spent == Decimal("0")
    assert results[0].remaining == Decimal("500.0")
    assert results[0].percentage == 0.0
