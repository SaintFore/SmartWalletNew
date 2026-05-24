from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session

from app.db.session import get_session
from app.models.account import Account
from app.schemas.account import AccountCreate, AccountRead, AccountUpdate
from app.services.account_service import create, delete, get_all, get_by_id, update

router = APIRouter(prefix="/accounts", tags=["accounts"])


@router.get("", response_model=list[AccountRead])
def read_accounts(session: Annotated[Session, Depends(get_session)]) -> list[Account]:
    return get_all(session)


@router.get("/{account_id}", response_model=AccountRead)
def read_account(account_id: int, session: Annotated[Session, Depends(get_session)]) -> Account:
    account = get_by_id(session, account_id)
    if account is None:
        raise HTTPException(status_code=404, detail="Account not found")
    return account


@router.post("", response_model=AccountRead)
def create_account(
    account_in: AccountCreate,
    session: Annotated[Session, Depends(get_session)],
) -> Account:
    return create(account_in, session)


@router.patch("/{account_id}", response_model=AccountRead)
def update_account(
    account_id: int,
    account_in: AccountUpdate,
    session: Annotated[Session, Depends(get_session)],
) -> Account:
    account = update(account_id, account_in, session)
    if account is None:
        raise HTTPException(status_code=404, detail="Account not found")
    return account


@router.delete("/{account_id}", status_code=204)
def delete_account(account_id: int, session: Annotated[Session, Depends(get_session)]):
    account = delete(account_id, session)
    if account is None:
        raise HTTPException(status_code=404, detail="Account not found")
