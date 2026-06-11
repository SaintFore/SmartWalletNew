"""add_tags_transfer_budget

Revision ID: 8d3b6f534c22
Revises: 2f6c2b1a9d40
Create Date: 2026-06-11 00:48:26.213431

"""

from collections.abc import Sequence

import sqlalchemy as sa
import sqlmodel
from alembic import op

# revision identifiers, used by Alembic.
revision: str = "8d3b6f534c22"
down_revision: str | Sequence[str] | None = "2f6c2b1a9d40"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    """Upgrade schema."""
    # Create budget table
    op.create_table(
        "budget",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("category_id", sa.Integer(), nullable=False),
        sa.Column("amount", sa.Numeric(precision=12, scale=2), nullable=False),
        sa.ForeignKeyConstraint(["category_id"], ["category.id"]),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("category_id"),
    )

    # Add unique constraint on category.name using batch mode (SQLite)
    with op.batch_alter_table("category", schema=None) as batch_op:
        batch_op.create_unique_constraint("uq_category_name", ["name"])

    # Add unique constraint on account.name index using batch mode (SQLite)
    with op.batch_alter_table("account", schema=None) as batch_op:
        batch_op.drop_index("ix_account_name")
        batch_op.create_index("ix_account_name", ["name"], unique=True)

    # Add columns to transaction using batch mode (SQLite)
    with op.batch_alter_table("transaction", schema=None) as batch_op:
        batch_op.add_column(sa.Column("to_account_id", sa.Integer(), nullable=True))
        batch_op.add_column(sa.Column("tags", sqlmodel.sql.sqltypes.AutoString(), nullable=True))  # type: ignore[attr-defined]
        batch_op.create_foreign_key(
            "fk_transaction_to_account", "account", ["to_account_id"], ["id"]
        )


def downgrade() -> None:
    """Downgrade schema."""
    with op.batch_alter_table("transaction", schema=None) as batch_op:
        batch_op.drop_constraint("fk_transaction_to_account", type_="foreignkey")
        batch_op.drop_column("tags")
        batch_op.drop_column("to_account_id")

    with op.batch_alter_table("account", schema=None) as batch_op:
        batch_op.drop_index("ix_account_name")
        batch_op.create_index("ix_account_name", ["name"], unique=False)

    with op.batch_alter_table("category", schema=None) as batch_op:
        batch_op.drop_constraint("uq_category_name", type_="unique")

    op.drop_table("budget")
