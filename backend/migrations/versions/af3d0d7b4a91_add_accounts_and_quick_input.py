"""add accounts and quick input metadata

Revision ID: af3d0d7b4a91
Revises: 701678ab3b32
Create Date: 2026-05-24 00:00:00.000000

"""

from collections.abc import Sequence

import sqlalchemy as sa
import sqlmodel
from alembic import op

# revision identifiers, used by Alembic.
revision: str = "af3d0d7b4a91"
down_revision: str | Sequence[str] | None = "701678ab3b32"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.create_table(
        "account",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("name", sqlmodel.AutoString(), nullable=False),
        sa.Column("icon", sqlmodel.AutoString(), nullable=True),
        sa.Column("is_default", sa.Boolean(), nullable=False, server_default=sa.false()),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("name"),
    )
    op.create_index(op.f("ix_account_name"), "account", ["name"], unique=False)
    op.bulk_insert(
        sa.table(
            "account",
            sa.column("id", sa.Integer()),
            sa.column("name", sqlmodel.AutoString()),
            sa.column("icon", sqlmodel.AutoString()),
            sa.column("is_default", sa.Boolean()),
        ),
        [
            {"id": 1, "name": "现金", "icon": "💵", "is_default": True},
            {"id": 2, "name": "支付宝", "icon": "🔵", "is_default": False},
            {"id": 3, "name": "微信", "icon": "🟢", "is_default": False},
            {"id": 4, "name": "银行卡", "icon": "💳", "is_default": False},
        ],
    )

    with op.batch_alter_table("transaction") as batch_op:
        batch_op.add_column(sa.Column("account_id", sa.Integer(), nullable=True))
        batch_op.add_column(sa.Column("raw_input", sqlmodel.AutoString(), nullable=True))
        batch_op.create_foreign_key(
            "fk_transaction_account_id_account",
            "account",
            ["account_id"],
            ["id"],
        )

    op.execute('UPDATE "transaction" SET account_id = 1 WHERE account_id IS NULL')

    with op.batch_alter_table("transaction") as batch_op:
        batch_op.alter_column("account_id", existing_type=sa.Integer(), nullable=False)


def downgrade() -> None:
    with op.batch_alter_table("transaction") as batch_op:
        batch_op.drop_constraint("fk_transaction_account_id_account", type_="foreignkey")
        batch_op.drop_column("raw_input")
        batch_op.drop_column("account_id")

    op.drop_index(op.f("ix_account_name"), table_name="account")
    op.drop_table("account")
