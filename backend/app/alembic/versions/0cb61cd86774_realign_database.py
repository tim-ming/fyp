"""Realign database

Revision ID: 0cb61cd86774
Revises: 
Create Date: 2024-10-06 20:50:05.312245

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '0cb61cd86774'
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # ### commands auto generated by Alembic - please adjust! ###
    op.create_table('users',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('name', sa.String(), nullable=True),
    sa.Column('dob', sa.Date(), nullable=True),
    sa.Column('sex', sa.String(), nullable=True),
    sa.Column('occupation', sa.String(), nullable=True),
    sa.Column('email', sa.String(), nullable=True),
    sa.Column('hashed_password', sa.String(), nullable=True),
    sa.Column('is_active', sa.Boolean(), nullable=True),
    sa.Column('role', sa.String(), nullable=True),
    sa.Column('image', sa.String(), nullable=True),
    sa.Column('last_login', sa.DateTime(), nullable=True),
    sa.Column('streak', sa.Integer(), nullable=True),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_users_email'), 'users', ['email'], unique=True)
    op.create_table('chat_messages',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('content', sa.String(), nullable=True),
    sa.Column('timestamp', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
    sa.Column('recipient_id', sa.Integer(), nullable=True),
    sa.Column('sender_id', sa.Integer(), nullable=True),
    sa.ForeignKeyConstraint(['recipient_id'], ['users.id'], ),
    sa.ForeignKeyConstraint(['sender_id'], ['users.id'], ),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_chat_messages_id'), 'chat_messages', ['id'], unique=False)
    op.create_table('social_accounts',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('user_id', sa.Integer(), nullable=True),
    sa.Column('provider', sa.String(), nullable=True),
    sa.Column('provider_user_id', sa.String(), nullable=True),
    sa.Column('access_token', sa.String(), nullable=True),
    sa.Column('refresh_token', sa.String(), nullable=True),
    sa.Column('expires_at', sa.DateTime(), nullable=True),
    sa.ForeignKeyConstraint(['user_id'], ['users.id'], ),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_social_accounts_user_id'), 'social_accounts', ['user_id'], unique=False)
    op.create_table('therapist_data',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('user_id', sa.Integer(), nullable=True),
    sa.Column('qualifications', sa.String(), nullable=True),
    sa.Column('expertise', sa.String(), nullable=True),
    sa.Column('bio', sa.String(), nullable=True),
    sa.Column('treatment_approach', sa.String(), nullable=True),
    sa.ForeignKeyConstraint(['user_id'], ['users.id'], ),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_therapist_data_user_id'), 'therapist_data', ['user_id'], unique=False)
    op.create_table('patient_data',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('user_id', sa.Integer(), nullable=True),
    sa.Column('therapist_id', sa.Integer(), nullable=True),
    sa.Column('therapist_user_id', sa.Integer(), nullable=True),
    sa.Column('has_onboarded', sa.Boolean(), nullable=True),
    sa.Column('severity', sa.String(), nullable=True),
    sa.Column('therapist_note', sa.String(), nullable=True),
    sa.ForeignKeyConstraint(['therapist_id'], ['therapist_data.id'], ),
    sa.ForeignKeyConstraint(['user_id'], ['users.id'], ),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_patient_data_therapist_id'), 'patient_data', ['therapist_id'], unique=False)
    op.create_index(op.f('ix_patient_data_user_id'), 'patient_data', ['user_id'], unique=False)
    op.create_table('guided_journal_entries',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('date', sa.Date(), nullable=True),
    sa.Column('body', sa.JSON(), nullable=True),
    sa.Column('patient_data_id', sa.Integer(), nullable=True),
    sa.ForeignKeyConstraint(['patient_data_id'], ['patient_data.id'], ),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_guided_journal_entries_date'), 'guided_journal_entries', ['date'], unique=False)
    op.create_index('ix_guided_journal_entries_date_desc', 'guided_journal_entries', [sa.text('date DESC')], unique=False)
    op.create_index(op.f('ix_guided_journal_entries_patient_data_id'), 'guided_journal_entries', ['patient_data_id'], unique=False)
    op.create_table('journal_entries',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('date', sa.Date(), nullable=True),
    sa.Column('title', sa.String(), nullable=True),
    sa.Column('body', sa.String(), nullable=True),
    sa.Column('image', sa.String(), nullable=True),
    sa.Column('patient_data_id', sa.Integer(), nullable=True),
    sa.ForeignKeyConstraint(['patient_data_id'], ['patient_data.id'], ),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_journal_entries_date'), 'journal_entries', ['date'], unique=False)
    op.create_index('ix_journal_entries_date_desc', 'journal_entries', [sa.text('date DESC')], unique=False)
    op.create_index(op.f('ix_journal_entries_patient_data_id'), 'journal_entries', ['patient_data_id'], unique=False)
    op.create_table('mood_entries',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('date', sa.Date(), nullable=True),
    sa.Column('mood', sa.SmallInteger(), nullable=True),
    sa.Column('eat', sa.SmallInteger(), nullable=True),
    sa.Column('sleep', sa.SmallInteger(), nullable=True),
    sa.Column('patient_data_id', sa.Integer(), nullable=True),
    sa.ForeignKeyConstraint(['patient_data_id'], ['patient_data.id'], ),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_mood_entries_date'), 'mood_entries', ['date'], unique=False)
    op.create_index('ix_mood_entries_date_desc', 'mood_entries', [sa.text('date DESC')], unique=False)
    op.create_index(op.f('ix_mood_entries_patient_data_id'), 'mood_entries', ['patient_data_id'], unique=False)
    # ### end Alembic commands ###


def downgrade() -> None:
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_index(op.f('ix_mood_entries_patient_data_id'), table_name='mood_entries')
    op.drop_index('ix_mood_entries_date_desc', table_name='mood_entries')
    op.drop_index(op.f('ix_mood_entries_date'), table_name='mood_entries')
    op.drop_table('mood_entries')
    op.drop_index(op.f('ix_journal_entries_patient_data_id'), table_name='journal_entries')
    op.drop_index('ix_journal_entries_date_desc', table_name='journal_entries')
    op.drop_index(op.f('ix_journal_entries_date'), table_name='journal_entries')
    op.drop_table('journal_entries')
    op.drop_index(op.f('ix_guided_journal_entries_patient_data_id'), table_name='guided_journal_entries')
    op.drop_index('ix_guided_journal_entries_date_desc', table_name='guided_journal_entries')
    op.drop_index(op.f('ix_guided_journal_entries_date'), table_name='guided_journal_entries')
    op.drop_table('guided_journal_entries')
    op.drop_index(op.f('ix_patient_data_user_id'), table_name='patient_data')
    op.drop_index(op.f('ix_patient_data_therapist_id'), table_name='patient_data')
    op.drop_table('patient_data')
    op.drop_index(op.f('ix_therapist_data_user_id'), table_name='therapist_data')
    op.drop_table('therapist_data')
    op.drop_index(op.f('ix_social_accounts_user_id'), table_name='social_accounts')
    op.drop_table('social_accounts')
    op.drop_index(op.f('ix_chat_messages_id'), table_name='chat_messages')
    op.drop_table('chat_messages')
    op.drop_index(op.f('ix_users_email'), table_name='users')
    op.drop_table('users')
    # ### end Alembic commands ###
