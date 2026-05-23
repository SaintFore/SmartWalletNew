from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session

from app.db.session import get_session
from app.models.transaction import Transaction
from app.schemas.transaction import (
    TransactionCreate,
    TransactionRead,
    TransactionSummary,
    TransactionUpdate,
)
from app.services.transaction_service import (
    create,
    delete,
    get_all,
    get_by_id,
    get_by_type,
    get_monthly_summary,
    update,
)

router = APIRouter(prefix="/transactions", tags=["transactions"])


@router.get("", response_model=list[TransactionRead])
def read_transactions(
    session: Annotated[Session, Depends(get_session)],
    type: str | None = None,
) -> list[Transaction]:
    """获取所有交易，可按类型过滤。"""
    if type:
        return get_by_type(session, type)
    return get_all(session)


@router.get("/{transaction_id}", response_model=TransactionRead)
def read_transaction(
    transaction_id: int,
    session: Annotated[Session, Depends(get_session)],
) -> Transaction:
    """获取单个交易。"""
    transaction = get_by_id(session, transaction_id)
    if not transaction:
        raise HTTPException(status_code=404, detail="Transaction not found")
    return transaction


@router.post("", response_model=TransactionRead)
def create_transaction(
    transaction_in: TransactionCreate,
    session: Annotated[Session, Depends(get_session)],
) -> Transaction:
    """创建新交易。"""
    return create(transaction_in, session)


@router.delete("/{transaction_id}", status_code=204)
def delete_transaction(
    transaction_id: int,
    session: Annotated[Session, Depends(get_session)],
):
    """删除交易。"""
    transaction = delete(transaction_id, session)
    if not transaction:
        raise HTTPException(status_code=404, detail="Transaction not found")


@router.patch("/{transaction_id}", response_model=TransactionRead)
def update_transaction(
    transaction_id: int,
    transaction_in: TransactionUpdate,
    session: Annotated[Session, Depends(get_session)],
) -> Transaction:
    """更新交易。"""
    transaction = update(transaction_id, transaction_in, session)
    if not transaction:
        raise HTTPException(status_code=404, detail="Transaction not found")
    return transaction


@router.get("/summary/monthly/{year}/{month}", response_model=TransactionSummary)
def get_monthly_transaction_summary(
    year: int,
    month: int,
    session: Annotated[Session, Depends(get_session)],
) -> TransactionSummary:
    """获取指定月份的交易汇总。"""
    if month < 1 or month > 12:
        raise HTTPException(status_code=400, detail="Month must be between 1 and 12")
    return get_monthly_summary(year, month, session)
