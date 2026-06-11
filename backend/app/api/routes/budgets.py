from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session

from app.db.session import get_session
from app.models.budget import Budget
from app.schemas.budget import BudgetCreate, BudgetRead, BudgetStatus, BudgetUpdate
from app.services.budget_service import (
    BudgetDuplicateError,
    create,
    delete,
    get_all,
    get_budget_status,
    update,
)

router = APIRouter(prefix="/budgets", tags=["budgets"])


@router.get("", response_model=list[BudgetRead])
def read_budgets(session: Annotated[Session, Depends(get_session)]) -> list[Budget]:
    return get_all(session)


@router.post("", response_model=BudgetRead)
def create_budget(
    budget_in: BudgetCreate,
    session: Annotated[Session, Depends(get_session)],
) -> Budget:
    try:
        return create(budget_in, session)
    except BudgetDuplicateError as exc:
        raise HTTPException(status_code=409, detail=str(exc)) from exc


@router.patch("/{budget_id}", response_model=BudgetRead)
def update_budget(
    budget_id: int,
    budget_in: BudgetUpdate,
    session: Annotated[Session, Depends(get_session)],
) -> Budget:
    try:
        budget = update(budget_id, budget_in, session)
    except BudgetDuplicateError as exc:
        raise HTTPException(status_code=409, detail=str(exc)) from exc
    if budget is None:
        raise HTTPException(status_code=404, detail="Budget not found")
    return budget


@router.delete("/{budget_id}", status_code=204)
def delete_budget(
    budget_id: int,
    session: Annotated[Session, Depends(get_session)],
):
    budget = delete(budget_id, session)
    if budget is None:
        raise HTTPException(status_code=404, detail="Budget not found")


@router.get("/status/{year}/{month}", response_model=list[BudgetStatus])
def read_budget_status(
    year: int,
    month: int,
    session: Annotated[Session, Depends(get_session)],
) -> list[BudgetStatus]:
    if month < 1 or month > 12:
        raise HTTPException(status_code=400, detail="Month must be between 1 and 12")
    return get_budget_status(year, month, session)
