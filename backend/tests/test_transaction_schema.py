from datetime import date
from decimal import Decimal

import pytest
from pydantic import ValidationError

from app.schemas.transaction import TransactionCreate, TransactionUpdate


def valid_transaction_payload() -> dict[str, object]:
    return {
        "name": "午餐",
        "amount": Decimal("28.50"),
        "type": "expense",
        "category_id": 1,
        "account_id": 1,
        "date": date(2026, 5, 26),
    }


def test_transaction_create_rejects_non_positive_amount():
    payload = valid_transaction_payload()
    payload["amount"] = Decimal("0")

    with pytest.raises(ValidationError):
        TransactionCreate.model_validate(payload)


def test_transaction_create_rejects_unknown_type():
    payload = valid_transaction_payload()
    payload["type"] = "transfer"

    with pytest.raises(ValidationError):
        TransactionCreate.model_validate(payload)


def test_transaction_update_rejects_negative_amount():
    with pytest.raises(ValidationError):
        TransactionUpdate.model_validate({"amount": Decimal("-0.01")})
