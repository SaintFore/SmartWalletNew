from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session

from app.db.session import get_session
from app.models.category import Category
from app.schemas.category import CategoryCreate, CategoryRead, CategoryUpdate
from app.services.category_service import CategoryInUseError, create, delete, get_all, get_by_id, update

router = APIRouter(prefix="/categories", tags=["categories"])


@router.get("", response_model=list[CategoryRead])
def read_categories(
    session: Annotated[Session, Depends(get_session)],
) -> list[Category]:
    return get_all(session)


@router.get("/{category_id}", response_model=CategoryRead)
def read_category(category_id: int, session: Annotated[Session, Depends(get_session)]) -> Category:
    category = get_by_id(session, category_id)
    if not category:
        raise HTTPException(status_code=404, detail="category not found")
    return category


@router.post("", response_model=CategoryRead)
def create_new_category(
    category_in: CategoryCreate,
    session: Annotated[Session, Depends(get_session)],
) -> Category:
    return create(category_in, session)


@router.delete("/{category_id}", status_code=204)
def delete_n_category(category_id: int, session: Annotated[Session, Depends(get_session)]):
    try:
        category = delete(category_id, session)
    except CategoryInUseError as exc:
        raise HTTPException(status_code=409, detail="Category has transactions") from exc
    if not category:
        raise HTTPException(status_code=404, detail="category not found")


@router.patch("/{category_id}", response_model=CategoryRead)
def update_n_category(
    category_id: int,
    item_in: CategoryUpdate,
    session: Annotated[Session, Depends(get_session)],
) -> Category:
    category = update(category_id, item_in, session)
    if not category:
        raise HTTPException(status_code=404, detail="category not found")
    return category
