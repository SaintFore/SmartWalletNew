from sqlmodel import Session, select

from app.models.transaction import Transaction
from app.schemas.transaction import (
    CategorySummary,
    TransactionCreate,
    TransactionSummary,
    TransactionUpdate,
)


def get_by_id(session: Session, transaction_id: int) -> Transaction | None:
    return session.get(Transaction, transaction_id)


def get_by_type(session: Session, transaction_type: str) -> list[Transaction]:
    statement = select(Transaction).where(Transaction.type == transaction_type)
    return list(session.exec(statement).all())


def get_all(session: Session) -> list[Transaction]:
    statement = select(Transaction)
    return list(session.exec(statement).all())


def create(transaction_in: TransactionCreate, session: Session) -> Transaction:
    transaction = Transaction.model_validate(transaction_in)
    session.add(transaction)
    session.commit()
    session.refresh(transaction)
    return transaction


def delete(transaction_id: int, session: Session) -> Transaction | None:
    transaction = session.get(Transaction, transaction_id)

    if transaction is None:
        return None
    session.delete(transaction)
    session.commit()
    return transaction


def update(
    transaction_id: int, transaction_in: TransactionUpdate, session: Session
) -> Transaction | None:
    transaction = session.get(Transaction, transaction_id)

    if transaction is None:
        return None

    update_data = transaction_in.model_dump(exclude_unset=True)

    for key, value in update_data.items():
        setattr(transaction, key, value)
    session.add(transaction)
    session.commit()
    session.refresh(transaction)
    return transaction


def get_monthly_summary(year: int, month: int, session: Session) -> TransactionSummary:
    """获取指定月份的交易汇总。"""
    from datetime import date

    from app.models.category import Category

    # 计算月份的开始和结束日期
    start_date = date(year, month, 1)
    if month == 12:
        end_date = date(year + 1, 1, 1)
    else:
        end_date = date(year, month + 1, 1)

    # 查询指定月份的所有交易
    statement = select(Transaction).where(
        Transaction.date >= start_date, Transaction.date < end_date
    )
    transactions = list(session.exec(statement).all())

    # 计算总支出和总收入
    total_expense = sum(t.amount for t in transactions if t.type == "expense")
    total_income = sum(t.amount for t in transactions if t.type == "income")
    net = total_income - total_expense

    # 按分类汇总
    category_totals: dict[int, dict] = {}
    for t in transactions:
        if t.category_id not in category_totals:
            # 获取分类信息
            category = session.get(Category, t.category_id)
            category_totals[t.category_id] = {
                "category_id": t.category_id,
                "category_name": category.name if category else "Unknown",
                "category_icon": category.icon if category else None,
                "total": 0.0,
                "count": 0,
            }
        category_totals[t.category_id]["total"] += t.amount
        category_totals[t.category_id]["count"] += 1

    # 转换为 CategorySummary 列表
    by_category = [
        CategorySummary(
            category_id=data["category_id"],
            category_name=data["category_name"],
            category_icon=data["category_icon"],
            total=data["total"],
            count=data["count"],
        )
        for data in category_totals.values()
    ]

    return TransactionSummary(
        total_expense=total_expense,
        total_income=total_income,
        net=net,
        by_category=by_category,
    )
