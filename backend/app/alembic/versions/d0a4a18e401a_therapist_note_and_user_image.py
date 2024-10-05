"""therapist note and user image

Revision ID: d0a4a18e401a
Revises: 5f969d1643b2
Create Date: 2024-10-05 21:06:16.115950

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'd0a4a18e401a'
down_revision: Union[str, None] = '5f969d1643b2'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # ### commands auto generated by Alembic - please adjust! ###
    op.add_column('patient_data', sa.Column('therapist_note', sa.String(), nullable=True))
    op.add_column('users', sa.Column('image', sa.String(), nullable=True))
    # ### end Alembic commands ###


def downgrade() -> None:
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_column('users', 'image')
    op.drop_column('patient_data', 'therapist_note')
    # ### end Alembic commands ###