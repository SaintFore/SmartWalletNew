from sqlmodel import Session, col, select

from app.models.transaction import Transaction
from app.schemas.transaction import (
    CategorySummary,
    DailySummary,
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

    start_date = date(year, month, 1)
    if month == 12:
        end_date = date(year + 1, 1, 1)
    else:
        end_date = date(year, month + 1, 1)

    statement = (
        select(Transaction)
        .where(col(Transaction.date) >= start_date, col(Transaction.date) < end_date)
        .order_by(col(Transaction.date))
    )
    transactions = list(session.exec(statement).all())

    total_expense = sum(t.amount for t in transactions if t.type == "expense")
    total_income = sum(t.amount for t in transactions if t.type == "income")
    net = total_income - total_expense

    category_totals: dict[int, dict] = {}
    daily_totals: dict[date, dict[str, float]] = {}

    for transaction in transactions:
        if transaction.category_id not in category_totals:
            category = session.get(Category, transaction.category_id)
            category_totals[transaction.category_id] = {
                "category_id": transaction.category_id,
                "category_name": category.name if category else "Unknown",
                "category_icon": category.icon if category else None,
                "total": 0.0,
                "count": 0,
            }
        category_totals[transaction.category_id]["total"] += transaction.amount
        category_totals[transaction.category_id]["count"] += 1

        day_total = daily_totals.setdefault(
            transaction.date,
            {"total_expense": 0.0, "total_income": 0.0},
        )
        if transaction.type == "income":
            day_total["total_income"] += transaction.amount
        else:
            day_total["total_expense"] += transaction.amount

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

    by_day = [
        DailySummary(
            date=day,
            total_expense=data["total_expense"],
            total_income=data["total_income"],
            net=data["total_income"] - data["total_expense"],
        )
        for day, data in sorted(daily_totals.items())
    ]

    return TransactionSummary(
        total_expense=total_expense,
        total_income=total_income,
        net=net,
        by_category=by_category,
        by_day=by_day,
    )
