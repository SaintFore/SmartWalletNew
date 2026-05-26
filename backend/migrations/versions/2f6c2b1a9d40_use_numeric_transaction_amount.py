"""use numeric transaction amount

Revision ID: 2f6c2b1a9d40
Revises: af3d0d7b4a91
Create Date: 2026-05-26 00:00:00.000000

"""

from collections.abc import Sequence

import sqlalchemy as sa
from alembic import op

# revision identifiers, used by Alembic.
revision: str = "2f6c2b1a9d40"
down_revision: str | Sequence[str] | None = "af3d0d7b4a91"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    with op.batch_alter_table("transaction") as batch_op:
        batch_op.alter_column(
            "amount",
            existing_type=sa.Float(),
            type_=sa.Numeric(12, 2),
            existing_nullable=False,
        )


def downgrade() -> None:
    with op.batch_alter_table("transaction") as batch_op:
        batch_op.alter_column(
            "amount",
            existing_type=sa.Numeric(12, 2),
            type_=sa.Float(),
            existing_nullable=False,
        )
