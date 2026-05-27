from dataclasses import dataclass
from datetime import date
from decimal import Decimal

from sqlmodel import Session, col, select

from app.models.account import Account
from app.models.category import Category
from app.models.transaction import Transaction
from app.schemas.transaction import (
    AccountSummary,
    CategorySummary,
    DailySummary,
    TransactionCreate,
    TransactionSummary,
    TransactionUpdate,
)


@dataclass
class CategoryTotal:
    category_id: int
    category_name: str
    category_icon: str | None
    total: Decimal
    count: int



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

    total_expense = Decimal("0")
    total_income = Decimal("0")
    category_totals: dict[int, CategoryTotal] = {}
    daily_totals: dict[date, dict[str, Decimal]] = {}
    account_totals: dict[int, dict[str, Decimal | int | str]] = {}

    category_ids = {transaction.category_id for transaction in transactions}
    account_ids = {transaction.account_id for transaction in transactions}
    categories_by_id = {
        category.id: category
        for category in session.exec(
            select(Category).where(col(Category.id).in_(category_ids))
        ).all()
        if category.id is not None
    }

    accounts_by_id = {
        account.id: account
        for account in session.exec(
            select(Account).where(col(Account.id).in_(account_ids))
        ).all()
        if account.id is not None
    }

    for transaction in transactions:
        if transaction.type == "income":
            total_income += transaction.amount
        else:
            total_expense += transaction.amount

        if transaction.category_id not in category_totals:
            category = categories_by_id.get(transaction.category_id)
            category_totals[transaction.category_id] = CategoryTotal(
                category_id=transaction.category_id,
                category_name=category.name if category else "Unknown",
                category_icon=category.icon if category else None,
                total=Decimal("0"),
                count=0,
            )
        category_total = category_totals[transaction.category_id]
        category_total.total += transaction.amount
        category_total.count += 1

        day_total = daily_totals.setdefault(
            transaction.date,
            {"total_expense": Decimal("0"), "total_income": Decimal("0")},
        )
        if transaction.type == "income":
            day_total["total_income"] += transaction.amount
        else:
            day_total["total_expense"] += transaction.amount

        if transaction.account_id not in account_totals:
            account = accounts_by_id.get(transaction.account_id)
            account_totals[transaction.account_id] = {
                "account_name": account.name if account else "Unknown",
                "total_expense": Decimal("0"),
                "total_income": Decimal("0"),
                "count": 0,
            }
        acct = account_totals[transaction.account_id]
        if transaction.type == "income":
            acct["total_income"] = acct["total_income"] + transaction.amount  # type: ignore[assignment]
        else:
            acct["total_expense"] = acct["total_expense"] + transaction.amount  # type: ignore[assignment]
        acct["count"] = acct["count"] + 1  # type: ignore[assignment]

    by_category = [
        CategorySummary(
            category_id=data.category_id,
            category_name=data.category_name,
            category_icon=data.category_icon,
            total=data.total,
            count=data.count,
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

    by_account = [
        AccountSummary(
            account_id=account_id,
            account_name=data["account_name"],
            total_expense=data["total_expense"],
            total_income=data["total_income"],
            net=data["total_income"] - data["total_expense"],
            count=data["count"],
        )
        for account_id, data in account_totals.items()
    ]

    return TransactionSummary(
        total_expense=total_expense,
        total_income=total_income,
        net=total_income - total_expense,
        by_category=by_category,
        by_day=by_day,
        by_account=by_account,
    )
