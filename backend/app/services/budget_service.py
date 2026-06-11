from datetime import date
from decimal import Decimal

from sqlalchemy.exc import IntegrityError
from sqlmodel import Session, col, func, select

from app.models.budget import Budget
from app.models.category import Category
from app.models.transaction import Transaction
from app.schemas.budget import BudgetCreate, BudgetStatus, BudgetUpdate


class BudgetDuplicateError(ValueError):
    pass


def get_all(session: Session) -> list[Budget]:
    statement = select(Budget).order_by(col(Budget.id))
    return list(session.exec(statement).all())


def get_by_id(session: Session, budget_id: int) -> Budget | None:
    return session.get(Budget, budget_id)


def get_by_category(session: Session, category_id: int) -> Budget | None:
    statement = select(Budget).where(Budget.category_id == category_id)
    return session.exec(statement).first()


def create(budget_in: BudgetCreate, session: Session) -> Budget:
    budget = Budget.model_validate(budget_in)
    session.add(budget)
    try:
        session.commit()
    except IntegrityError:
        session.rollback()
        raise BudgetDuplicateError(
            f"Budget for category {budget_in.category_id} already exists"
        ) from None
    session.refresh(budget)
    return budget


def update(budget_id: int, budget_in: BudgetUpdate, session: Session) -> Budget | None:
    budget = session.get(Budget, budget_id)
    if budget is None:
        return None

    update_data = budget_in.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(budget, key, value)
    session.add(budget)
    try:
        session.commit()
    except IntegrityError:
        session.rollback()
        raise BudgetDuplicateError("Budget for this category already exists") from None
    session.refresh(budget)
    return budget


def delete(budget_id: int, session: Session) -> Budget | None:
    budget = session.get(Budget, budget_id)
    if budget is None:
        return None
    session.delete(budget)
    session.commit()
    return budget


def get_budget_status(year: int, month: int, session: Session) -> list[BudgetStatus]:
    """返回每个预算在指定月份的执行状态。"""
    start_date = date(year, month, 1)
    if month == 12:
        end_date = date(year + 1, 1, 1)
    else:
        end_date = date(year, month + 1, 1)

    budgets = list(session.exec(select(Budget)).all())
    if not budgets:
        return []

    category_ids = {b.category_id for b in budgets}
    categories = {
        c.id: c
        for c in session.exec(select(Category).where(col(Category.id).in_(category_ids))).all()
        if c.id is not None
    }

    spent_stmt = (
        select(
            Transaction.category_id,
            func.sum(Transaction.amount).label("spent"),
        )
        .where(
            Transaction.type == "expense",
            col(Transaction.date) >= start_date,
            col(Transaction.date) < end_date,
            col(Transaction.category_id).in_(category_ids),
        )
        .group_by(Transaction.category_id)  # type: ignore[arg-type]
    )
    spent_map: dict[int, Decimal] = {
        row[0]: row[1] or Decimal("0") for row in session.exec(spent_stmt).all()
    }

    results: list[BudgetStatus] = []
    for budget in budgets:
        category = categories.get(budget.category_id)
        spent = spent_map.get(budget.category_id, Decimal("0"))
        remaining = budget.amount - spent
        pct = (float(spent) / float(budget.amount) * 100) if budget.amount > 0 else 0.0
        results.append(
            BudgetStatus(
                category_id=budget.category_id,
                category_name=category.name if category else "Unknown",
                category_icon=category.icon if category else None,
                budget_amount=budget.amount,
                spent=spent,
                remaining=remaining,
                percentage=round(pct, 1),
            )
        )

    return results
