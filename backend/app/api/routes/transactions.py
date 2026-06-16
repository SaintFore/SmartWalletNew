from datetime import date
from typing import Annotated, Literal

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlmodel import Session

from app.db.session import get_session
from app.models.account import Account
from app.models.category import Category
from app.models.transaction import Transaction
from app.schemas.transaction import (
    PaginatedTransactions,
    QuickTransactionCreate,
    TransactionCreate,
    TransactionRead,
    TransactionSummary,
    TransactionUpdate,
)
from app.services.transaction_parser import TransactionParseError, parse_quick_transaction
from app.services.transaction_service import (
    create,
    delete,
    get_by_id,
    get_filtered,
    get_monthly_summary,
    update,
)

router = APIRouter(prefix="/transactions", tags=["transactions"])


@router.get("", response_model=PaginatedTransactions)
def read_transactions(
    session: Annotated[Session, Depends(get_session)],
    type: Literal["expense", "income", "transfer"] | None = None,
    account_id: int | None = None,
    category_id: int | None = None,
    date_from: date | None = None,
    date_to: date | None = None,
    search: str | None = None,
    tag: str | None = None,
    limit: int = Query(default=50, ge=1, le=200),
    offset: int = Query(default=0, ge=0),
) -> PaginatedTransactions:
    """获取交易列表，支持筛选和分页。"""
    transactions, total = get_filtered(
        session,
        type=type,
        account_id=account_id,
        category_id=category_id,
        date_from=date_from,
        date_to=date_to,
        search=search,
        tag=tag,
        limit=limit,
        offset=offset,
    )
    return PaginatedTransactions(items=transactions, total=total, limit=limit, offset=offset)  # type: ignore[arg-type]


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
    # 校验外键存在性
    if not session.get(Account, transaction_in.account_id):
        raise HTTPException(status_code=422, detail="Account not found")
    if not session.get(Category, transaction_in.category_id):
        raise HTTPException(status_code=422, detail="Category not found")
    if transaction_in.to_account_id is not None:
        if not session.get(Account, transaction_in.to_account_id):
            raise HTTPException(status_code=422, detail="Target account not found")
    return create(transaction_in, session)


@router.post("/quick", response_model=TransactionRead)
def create_quick_transaction(
    quick_in: QuickTransactionCreate,
    session: Annotated[Session, Depends(get_session)],
) -> Transaction:
    """使用自然语言快速创建交易；配置 AI 时优先使用 AI 解析。"""
    try:
        transaction_in = parse_quick_transaction(quick_in, session)
    except TransactionParseError as exc:
        raise HTTPException(status_code=422, detail=str(exc)) from exc
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
