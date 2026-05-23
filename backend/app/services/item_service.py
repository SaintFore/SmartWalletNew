from sqlmodel import Session, select

from app.models.item import Item
from app.schemas.item import ItemCreate, ItemUpdate


def get_all(session: Session, item_id: int) -> Item | None:
    return session.get(Item, item_id)


def get(session: Session) -> list[Item]:
    statement = select(Item)
    return list(session.exec(statement).all())


def create(item_in: ItemCreate, session: Session) -> Item:
    item = Item.model_validate(item_in)
    session.add(item)
    session.commit()
    session.refresh(item)
    return item


def delete(item_id: int, session: Session) -> Item | None:
    item = session.get(Item, item_id)

    if item is None:
        return None
    session.delete(item)
    session.commit()
    return item


def update(item_id: int, item_in: ItemUpdate, session: Session) -> Item | None:
    item = session.get(Item, item_id)

    if item is None:
        return None

    update_data = item_in.model_dump(exclude_unset=True)

    for key, value in update_data.items():
        setattr(item, key, value)
    session.add(item)
    session.commit()
    session.refresh(item)
    return item
