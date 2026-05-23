from sqlmodel import Session, select

from app.db.session import engine
from app.models.category import Category

DEFAULT_CATEGORIES = [
    # 支出
    {"name": "餐饮", "icon": "🍜"},
    {"name": "交通", "icon": "🚗"},
    {"name": "购物", "icon": "🛒"},
    {"name": "住房", "icon": "🏠"},
    {"name": "娱乐", "icon": "🎮"},
    {"name": "医疗", "icon": "💊"},
    {"name": "教育", "icon": "📚"},
    {"name": "其他", "icon": "📦"},
    {"name": "游戏", "icon": "🎮"},
    # 收入
    {"name": "工资", "icon": "💰"},
    {"name": "奖金", "icon": "🎁"},
    {"name": "投资", "icon": "📈"},
    {"name": "其他收入", "icon": "💵"},
]


def seed_categories() -> None:
    """插入不存在的默认分类。"""
    with Session(engine) as session:
        for cat_data in DEFAULT_CATEGORIES:
            existing = session.exec(
                select(Category).where(Category.name == cat_data["name"])
            ).first()
            if not existing:
                session.add(
                    Category(
                        name=cat_data["name"],
                        icon=cat_data["icon"],
                    )
                )
        session.commit()
