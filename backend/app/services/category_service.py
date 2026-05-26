from sqlmodel import Session, select

from app.models.category import Category
from app.models.transaction import Transaction
from app.schemas.category import CategoryCreate, CategoryUpdate


class CategoryInUseError(ValueError):
    pass


def get_all(session: Session, category_id: int) -> Category | None:
    return session.get(Category, category_id)


def get(session: Session) -> list[Category]:
    statement = select(Category)
    return list(session.exec(statement).all())


def create(category_in: CategoryCreate, session: Session) -> Category:
    category = Category.model_validate(category_in)
    session.add(category)
    session.commit()
    session.refresh(category)
    return category


def delete(category_id: int, session: Session) -> Category | None:
    category = session.get(Category, category_id)

    if category is None:
        return None
    has_transactions = session.exec(
        select(Transaction).where(Transaction.category_id == category_id)
    ).first()
    if has_transactions is not None:
        raise CategoryInUseError("Category has transactions")
    session.delete(category)
    session.commit()
    return category


def update(category_id: int, category_in: CategoryUpdate, session: Session) -> Category | None:
    category = session.get(Category, category_id)

    if category is None:
        return None

    update_data = category_in.model_dump(exclude_unset=True)

    for key, value in update_data.items():
        setattr(category, key, value)
    session.add(category)
    session.commit()
    session.refresh(category)
    return category
