from sqlalchemy import (
    Boolean,
    Column,
    ForeignKey,
    Index,
    Integer,
    SmallInteger,
    String,
    DateTime,
)
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base


class User(Base):
    """
    User Model
    """

    __tablename__ = "users"

    id = Column(Integer, primary_key=True)
    name = Column(String)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    is_active = Column(Boolean, default=True)
    has_onboarded = Column(Boolean, default=False)

    mood_entries = relationship("MoodEntry", back_populates="user")
    journal_entries = relationship("JournalEntry", back_populates="user")
    social_accounts = relationship("SocialAccount", back_populates="user")

class SocialAccount(Base):
    """
    Social Account Model
    """

    __tablename__ = "social_accounts"

    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id"), index=True)
    provider = Column(String)
    provider_user_id = Column(String)
    access_token = Column(String, nullable=True)
    refresh_token = Column(String, nullable=True)
    expires_at = Column(DateTime, nullable=True)

    user = relationship("User", back_populates="social_accounts")


class MoodEntry(Base):
    """
    Mood Entry Model
    """

    __tablename__ = "mood_entries"

    id = Column(Integer, primary_key=True)
    datetime = Column(DateTime(timezone=True), server_default=func.now(), index=True)
    mood = Column(SmallInteger)
    user_id = Column(Integer, ForeignKey("users.id"), index=True)

    user = relationship("User", back_populates="mood_entries")

    __table_args__ = (
        Index("ix_mood_entries_datetime_desc", datetime.desc()),
    )  # Index for datetime in descending order


class JournalEntry(Base):
    """
    Journal Entry Model
    """

    __tablename__ = "journal_entries"

    id = Column(Integer, primary_key=True)
    datetime = Column(DateTime(timezone=True), server_default=func.now(), index=True)
    title = Column(String)
    body = Column(String)
    image = Column(String, nullable=True)
    user_id = Column(Integer, ForeignKey("users.id"), index=True)

    user = relationship("User", back_populates="journal_entries")

    __table_args__ = (
        Index("ix_journal_entries_datetime_desc", datetime.desc()),
    )  # Index for datetime in descending order
