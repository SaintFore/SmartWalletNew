from sqlmodel import Session, select

from app.db.session import engine
from app.models.account import Account

DEFAULT_ACCOUNTS = [
    {"name": "现金", "icon": "💵", "is_default": True},
    {"name": "支付宝", "icon": "🔵", "is_default": False},
    {"name": "微信", "icon": "🟢", "is_default": False},
    {"name": "银行卡", "icon": "💳", "is_default": False},
]


def seed_accounts() -> None:
    """插入不存在的默认账户，并保证至少有一个默认账户。"""
    with Session(engine) as session:
        has_default = session.exec(select(Account).where(Account.is_default == True)).first()  # noqa: E712
        for account_data in DEFAULT_ACCOUNTS:
            existing = session.exec(
                select(Account).where(Account.name == account_data["name"])
            ).first()
            if existing is None:
                session.add(Account(**account_data))
            elif account_data["is_default"] and has_default is None:
                existing.is_default = True
                session.add(existing)
        session.commit()
