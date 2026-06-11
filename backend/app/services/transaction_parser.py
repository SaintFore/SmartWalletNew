from __future__ import annotations

import json
import re
from datetime import date
from decimal import Decimal, InvalidOperation
from typing import Any, Literal, cast
from urllib import error, request

from sqlmodel import Session, select

from app.core.config import settings
from app.models.account import Account
from app.models.category import Category
from app.schemas.transaction import QuickTransactionCreate, TransactionCreate
from app.services.account_service import get_or_create_default

TransactionType = Literal["expense", "income"]

_AMOUNT_RE = re.compile(r"(?<!\d)([+-]?\d+(?:\.\d{1,2})?)(?!\d)")
_EXPENSE_HINTS = ("花", "买", "付", "支出", "午饭", "晚饭", "早餐", "咖啡", "地铁", "打车")
_INCOME_HINTS = ("收入", "工资", "奖金", "报销", "退款", "到账")
_CATEGORY_KEYWORDS = {
    "餐饮": ("饭", "餐", "咖啡", "奶茶", "外卖", "麦当劳", "肯德基", "食", "吃"),
    "交通": ("地铁", "公交", "打车", "出租", "滴滴", "高铁", "火车", "机票", "加油"),
    "购物": ("买", "淘宝", "京东", "拼多多", "超市", "衣", "鞋"),
    "住房": ("房租", "物业", "水电", "燃气", "宽带"),
    "娱乐": ("电影", "游戏", "会员", "演唱会", "娱乐"),
    "医疗": ("药", "医院", "门诊", "体检", "医疗"),
    "教育": ("书", "课程", "学费", "教育"),
    "工资": ("工资", "薪水", "薪资"),
    "奖金": ("奖金",),
    "投资": ("股票", "基金", "分红", "利息", "投资"),
    "其他收入": ("报销", "退款"),
}


class TransactionParseError(ValueError):
    pass


def parse_quick_transaction(
    quick_in: QuickTransactionCreate,
    session: Session,
) -> TransactionCreate:
    if settings.ai_api_key:
        ai_result = _parse_with_ai(quick_in.text)
        if ai_result is not None:
            return _build_transaction(ai_result, quick_in, session)
    return _parse_locally(quick_in, session)


def _parse_locally(quick_in: QuickTransactionCreate, session: Session) -> TransactionCreate:
    raw_text = quick_in.text.strip()
    amount_match = _AMOUNT_RE.search(raw_text)
    if amount_match is None:
        raise TransactionParseError("No amount found in input")

    amount = _to_amount(amount_match.group(1))
    text_without_amount = (
        raw_text[: amount_match.start()] + raw_text[amount_match.end() :]
    ).strip()
    transaction_type = _infer_type(raw_text)
    account = _match_account(raw_text, session) or get_or_create_default(session)
    category = _match_category(raw_text, transaction_type, session)
    if category is None:
        raise TransactionParseError("No category available")
    if account.id is None or category.id is None:
        raise TransactionParseError("Parsed account or category is not persisted")

    name = _clean_name(text_without_amount, account.name, category.name) or category.name
    return TransactionCreate(
        name=name,
        amount=amount,
        type=transaction_type,
        category_id=category.id,
        account_id=account.id,
        description=quick_in.description,
        date=quick_in.date or date.today(),
        raw_input=quick_in.text,
    )


def _parse_with_ai(text: str) -> dict[str, Any] | None:
    payload = {
        "model": settings.ai_model,
        "messages": [
            {
                "role": "system",
                "content": (
                    "你是记账解析器。只返回 JSON，不要 Markdown。字段："
                    "name, amount, type(expense/income), category, account, description。"
                ),
            },
            {"role": "user", "content": text},
        ],
        "temperature": 0,
    }
    body = json.dumps(payload).encode("utf-8")
    req = request.Request(
        f"{settings.ai_base_url.rstrip('/')}/chat/completions",
        data=body,
        headers={
            "Authorization": f"Bearer {settings.ai_api_key}",
            "Content-Type": "application/json",
        },
        method="POST",
    )
    try:
        with request.urlopen(req, timeout=settings.ai_timeout_seconds) as resp:
            data = json.loads(resp.read().decode("utf-8"))
        content = data["choices"][0]["message"]["content"]
        parsed = json.loads(content)
        return parsed if isinstance(parsed, dict) else None
    except (OSError, error.URLError, KeyError, IndexError, json.JSONDecodeError) as exc:
        from loguru import logger

        logger.warning("AI parsing failed, falling back to local: {}", exc)
        return None


def _build_transaction(
    parsed: dict[str, Any],
    quick_in: QuickTransactionCreate,
    session: Session,
) -> TransactionCreate:
    amount = _to_amount(str(parsed.get("amount", "")))
    parsed_type = parsed.get("type")
    if parsed_type in ("expense", "income"):
        transaction_type = cast(TransactionType, parsed_type)
    else:
        transaction_type = _infer_type(quick_in.text)
    account = _find_account_by_name(str(parsed.get("account") or ""), session)
    account = account or _match_account(quick_in.text, session) or get_or_create_default(session)
    category = _find_category_by_name(str(parsed.get("category") or ""), session)
    category = category or _match_category(quick_in.text, transaction_type, session)
    if category is None:
        raise TransactionParseError("No category available")
    if account.id is None or category.id is None:
        raise TransactionParseError("Parsed account or category is not persisted")

    name = str(parsed.get("name") or "").strip() or category.name
    description = str(parsed.get("description") or "").strip() or quick_in.description
    return TransactionCreate(
        name=name,
        amount=amount,
        type=transaction_type,
        category_id=category.id,
        account_id=account.id,
        description=description,
        date=quick_in.date or date.today(),
        raw_input=quick_in.text,
    )


def _to_amount(value: str) -> Decimal:
    try:
        amount = Decimal(value).copy_abs()
    except InvalidOperation as exc:
        raise TransactionParseError("Invalid amount") from exc
    if amount == 0:
        raise TransactionParseError("Amount must be greater than zero")
    return amount


def _infer_type(text: str) -> TransactionType:
    if any(hint in text for hint in _INCOME_HINTS):
        return "income"
    if any(hint in text for hint in _EXPENSE_HINTS):
        return "expense"
    return "expense"


def _match_account(text: str, session: Session) -> Account | None:
    for account in session.exec(select(Account)).all():
        if account.name in text:
            return account
    return None


def _find_account_by_name(name: str, session: Session) -> Account | None:
    if not name:
        return None
    return session.exec(select(Account).where(Account.name == name)).first()


def _match_category(text: str, transaction_type: str, session: Session) -> Category | None:
    categories = list(session.exec(select(Category)).all())
    for category in categories:
        if category.name in text:
            return category
    for category in categories:
        keywords = _CATEGORY_KEYWORDS.get(category.name, ())
        if any(keyword in text for keyword in keywords):
            return category
    fallback_name = "其他收入" if transaction_type == "income" else "其他"
    return next((category for category in categories if category.name == fallback_name), None)


def _find_category_by_name(name: str, session: Session) -> Category | None:
    if not name:
        return None
    return session.exec(select(Category).where(Category.name == name)).first()


def _clean_name(text: str, account_name: str, category_name: str) -> str:
    cleaned = text.replace(account_name, "").replace(category_name, "")
    for token in ("支出", "收入", "花了", "花", "付款", "支付"):
        cleaned = cleaned.replace(token, "")
    return " ".join(cleaned.split())
