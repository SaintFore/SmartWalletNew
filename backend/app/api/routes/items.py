from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session

from app.db.session import get_session
from app.models.item import Item
from app.schemas.item import ItemCreate, ItemRead, ItemUpdate
from app.services.item_service import create, delete, get, get_all, update

router = APIRouter(prefix="/items", tags=["items"])


@router.get("", response_model=list[ItemRead])
def read_items(session: Annotated[Session, Depends(get_session)]) -> list[Item]:
    return get(session)


@router.get("/{item_id}", response_model=ItemRead)
def read_item(item_id: int, session: Annotated[Session, Depends(get_session)]) -> Item:
    item = get_all(session, item_id)
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")
    return item


@router.post("", response_model=ItemRead)
def create_new_item(
    item_in: ItemCreate,
    session: Annotated[Session, Depends(get_session)],
) -> Item:
    return create(item_in, session)


@router.delete("/{item_id}", status_code=204)
def delete_n_item(item_id: int, session: Annotated[Session, Depends(get_session)]):
    item = delete(item_id, session)
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")


@router.patch("/{item_id}", response_model=ItemRead)
def update_n_item(
    item_id: int, item_in: ItemUpdate, session: Annotated[Session, Depends(get_session)]
) -> Item:
    item = update(item_id, item_in, session)
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")
    return item
