from datetime import date
from decimal import Decimal

import pytest
from sqlmodel import Session, SQLModel, create_engine

from app.models.account import Account
from app.models.category import Category
from app.models.transaction import Transaction
from app.services.transaction_service import get_monthly_summary


@pytest.fixture(name="session")
def session_fixture(tmp_path):
    """创建隔离的测试数据库会话。"""
    test_engine = create_engine(
        f"sqlite:///{tmp_path / 'test.db'}",
        connect_args={"check_same_thread": False},
    )
    SQLModel.metadata.create_all(test_engine)
    with Session(test_engine) as session:
        yield session
    SQLModel.metadata.drop_all(test_engine)


def create_account_id(session: Session) -> int:
    account = Account(name="现金", icon="💵", is_default=True)
    session.add(account)
    session.commit()
    session.refresh(account)
    assert account.id is not None
    return account.id


def create_test_data(session: Session):
    """创建测试数据。"""
    account_id = create_account_id(session)
    # 创建分类
    food_category = Category(name="餐饮", icon="🍜")
    transport_category = Category(name="交通", icon="🚗")
    salary_category = Category(name="工资", icon="💰")
    session.add(food_category)
    session.add(transport_category)
    session.add(salary_category)
    session.commit()
    session.refresh(food_category)
    session.refresh(transport_category)
    session.refresh(salary_category)

    # 确保 ID 已生成
    assert food_category.id is not None
    assert transport_category.id is not None
    assert salary_category.id is not None

    # 创建 2026 年 5 月的交易
    transactions = [
        # 支出
        Transaction(
            name="午餐",
            amount=Decimal("50.0"),
            type="expense",
            category_id=food_category.id,
            account_id=account_id,
            date=date(2026, 5, 1),
        ),
        Transaction(
            name="晚餐",
            amount=Decimal("80.0"),
            type="expense",
            category_id=food_category.id,
            account_id=account_id,
            date=date(2026, 5, 15),
        ),
        Transaction(
            name="地铁",
            amount=Decimal("20.0"),
            type="expense",
            category_id=transport_category.id,
            account_id=account_id,
            date=date(2026, 5, 10),
        ),
        # 收入
        Transaction(
            name="工资",
            amount=Decimal("10000.0"),
            type="income",
            category_id=salary_category.id,
            account_id=account_id,
            date=date(2026, 5, 5),
        ),
        # 其他月份的交易（不应该被计算）
        Transaction(
            name="4月午餐",
            amount=Decimal("30.0"),
            type="expense",
            category_id=food_category.id,
            account_id=account_id,
            date=date(2026, 4, 15),
        ),
        Transaction(
            name="6月午餐",
            amount=Decimal("40.0"),
            type="expense",
            category_id=food_category.id,
            account_id=account_id,
            date=date(2026, 6, 1),
        ),
    ]
    for t in transactions:
        session.add(t)
    session.commit()

    return {
        "food_category": food_category,
        "transport_category": transport_category,
        "salary_category": salary_category,
    }


def test_get_monthly_summary_basic(session: Session):
    """测试基本的月度汇总功能。"""
    create_test_data(session)

    result = get_monthly_summary(2026, 5, session)

    # 验证总支出和总收入
    assert result.total_expense == 150.0  # 50 + 80 + 20
    assert result.total_income == 10000.0
    assert result.net == 9850.0  # 10000 - 150

    # 验证分类汇总
    assert len(result.by_category) == 3


def test_get_monthly_summary_category_details(session: Session):
    """测试分类汇总的详细信息。"""
    create_test_data(session)

    result = get_monthly_summary(2026, 5, session)

    # 按分类 ID 排序以便比较
    sorted_categories = sorted(result.by_category, key=lambda c: c.category_id)

    # 验证餐饮分类
    food_summary = next(
        (c for c in sorted_categories if c.category_name == "餐饮"), None
    )
    assert food_summary is not None
    assert food_summary.total == 130.0  # 50 + 80
    assert food_summary.count == 2
    assert food_summary.category_icon == "🍜"

    # 验证交通分类
    transport_summary = next(
        (c for c in sorted_categories if c.category_name == "交通"), None
    )
    assert transport_summary is not None
    assert transport_summary.total == 20.0
    assert transport_summary.count == 1
    assert transport_summary.category_icon == "🚗"

    # 验证工资分类
    salary_summary = next(
        (c for c in sorted_categories if c.category_name == "工资"), None
    )
    assert salary_summary is not None
    assert salary_summary.total == 10000.0
    assert salary_summary.count == 1
    assert salary_summary.category_icon == "💰"


def test_get_monthly_summary_empty_month(session: Session):
    """测试空月份返回零值。"""
    # 不创建任何交易数据
    result = get_monthly_summary(2026, 1, session)

    assert result.total_expense == 0.0
    assert result.total_income == 0.0
    assert result.net == 0.0
    assert len(result.by_category) == 0


def test_get_monthly_summary_december(session: Session):
    """测试12月年份切换。"""
    # 创建12月的交易
    food_category = Category(name="餐饮", icon="🍜")
    session.add(food_category)
    session.commit()
    session.refresh(food_category)
    assert food_category.id is not None
    account_id = create_account_id(session)

    transaction = Transaction(
        name="年夜饭",
        amount=Decimal("500.0"),
        type="expense",
        category_id=food_category.id,
        account_id=account_id,
        date=date(2026, 12, 31),
    )
    session.add(transaction)

    # 创建1月的交易（不应该被计算）
    transaction_jan = Transaction(
        name="元旦",
        amount=Decimal("100.0"),
        type="expense",
        category_id=food_category.id,
        account_id=account_id,
        date=date(2027, 1, 1),
    )
    session.add(transaction_jan)
    session.commit()

    result = get_monthly_summary(2026, 12, session)

    assert result.total_expense == 500.0
    assert result.total_income == 0.0
    assert result.net == -500.0
    assert len(result.by_category) == 1
    assert result.by_category[0].category_name == "餐饮"
    assert result.by_category[0].total == 500.0


def test_get_monthly_summary_only_expense(session: Session):
    """测试只有支出的月份。"""
    food_category = Category(name="餐饮", icon="🍜")
    session.add(food_category)
    session.commit()
    session.refresh(food_category)
    assert food_category.id is not None
    account_id = create_account_id(session)

    transactions = [
        Transaction(
            name="午餐",
            amount=Decimal("50.0"),
            type="expense",
            category_id=food_category.id,
            account_id=account_id,
            date=date(2026, 3, 1),
        ),
        Transaction(
            name="晚餐",
            amount=Decimal("80.0"),
            type="expense",
            category_id=food_category.id,
            account_id=account_id,
            date=date(2026, 3, 15),
        ),
    ]
    for t in transactions:
        session.add(t)
    session.commit()

    result = get_monthly_summary(2026, 3, session)

    assert result.total_expense == 130.0
    assert result.total_income == 0.0
    assert result.net == -130.0
    assert len(result.by_category) == 1


def test_get_monthly_summary_only_income(session: Session):
    """测试只有收入的月份。"""
    salary_category = Category(name="工资", icon="💰")
    session.add(salary_category)
    session.commit()
    session.refresh(salary_category)
    assert salary_category.id is not None
    account_id = create_account_id(session)

    transaction = Transaction(
        name="工资",
        amount=Decimal("10000.0"),
        type="income",
        category_id=salary_category.id,
        account_id=account_id,
        date=date(2026, 2, 5),
    )
    session.add(transaction)
    session.commit()

    result = get_monthly_summary(2026, 2, session)

    assert result.total_expense == 0.0
    assert result.total_income == 10000.0
    assert result.net == 10000.0
    assert len(result.by_category) == 1
    assert result.by_category[0].category_name == "工资"


def test_get_monthly_summary_preserves_decimal_precision(session: Session):
    category = Category(name="餐饮", icon="🍜")
    session.add(category)
    session.commit()
    session.refresh(category)
    assert category.id is not None
    account_id = create_account_id(session)

    transactions = [
        Transaction(
            name="早餐",
            amount=Decimal("0.10"),
            type="expense",
            category_id=category.id,
            account_id=account_id,
            date=date(2026, 5, 1),
        ),
        Transaction(
            name="午餐",
            amount=Decimal("0.20"),
            type="expense",
            category_id=category.id,
            account_id=account_id,
            date=date(2026, 5, 1),
        ),
    ]
    for transaction in transactions:
        session.add(transaction)
    session.commit()

    result = get_monthly_summary(2026, 5, session)

    assert result.total_expense == Decimal("0.30")
    assert result.total_income == Decimal("0")
    assert result.net == Decimal("-0.30")
    assert result.by_category[0].total == Decimal("0.30")
    assert result.by_day[0].total_expense == Decimal("0.30")
