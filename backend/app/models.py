from sqlalchemy import (
    Boolean,
    Column,
    DateTime,
    ForeignKey,
    Index,
    Integer,
    SmallInteger,
    String,
    Date,
    JSON,
    func,
    Float
)
from sqlalchemy.orm import relationship
from app.database import Base

class DepressionRiskLog(Base):
    """
    Depression Risk Log Model
    """
    __tablename__ = "depression_risk_logs"

    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    value = Column(Float)
    date = Column(Date)

class ChatMessage(Base):
    """
    Chat Message Model
    """
    __tablename__ = "chat_messages"

    id = Column(Integer, primary_key=True, index=True)
    content = Column(String)
    timestamp = Column(DateTime(timezone=True), server_default=func.now())
    recipient_id = Column(Integer, ForeignKey("users.id"))
    sender_id = Column(Integer, ForeignKey("users.id"))

class User(Base):
    """
    User Model
    """

    __tablename__ = "users"

    id = Column(Integer, primary_key=True)
    name = Column(String)
    dob = Column(Date)
    sex = Column(String)
    occupation = Column(String, nullable=True)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    is_active = Column(Boolean, default=True)
    role = Column(String)
    image = Column(String, nullable=True)
    last_login = Column(DateTime, nullable=True)
    streak = Column(Integer, default=0)

    patient_data = relationship("PatientData", back_populates="user", uselist=False)
    therapist_data = relationship("TherapistData", back_populates="user", uselist=False)
    social_accounts = relationship("SocialAccount", back_populates="user")


class PatientData(Base):
    """
    Patient Data Model
    """

    __tablename__ = "patient_data"

    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id"), index=True)
    therapist_id = Column(Integer, ForeignKey("therapist_data.id"), index=True)
    therapist_user_id = Column(Integer, nullable=True)
    has_onboarded = Column(Boolean, default=False)
    severity = Column(String, default="Unknown")
    therapist_note = Column(String, nullable=True)

    mood_entries = relationship("MoodEntry", back_populates="patient_data")
    journal_entries = relationship("JournalEntry", back_populates="patient_data")
    guided_journal_entries = relationship("GuidedJournalEntry", back_populates="patient_data")

    therapist = relationship("TherapistData", back_populates="patients", uselist=False)
    user = relationship("User", back_populates="patient_data")


class TherapistData(Base):
    """
    Therapist Data Model
    """

    __tablename__ = "therapist_data"

    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id"), index=True)
    qualifications = Column(String)
    expertise = Column(String)
    bio = Column(String)
    treatment_approach = Column(String)

    patients = relationship("PatientData", back_populates="therapist")
    user = relationship("User", back_populates="therapist_data")


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
    date = Column(Date, index=True)
    mood = Column(SmallInteger)
    eat = Column(SmallInteger)
    sleep = Column(SmallInteger)
    patient_data_id = Column(Integer, ForeignKey("patient_data.id"), index=True)

    patient_data = relationship("PatientData", back_populates="mood_entries")

    __table_args__ = (
        Index("ix_mood_entries_date_desc", date.desc()),
    )  # Index for date in descending order


class JournalEntry(Base):
    """
    Journal Entry Model
    """

    __tablename__ = "journal_entries"

    id = Column(Integer, primary_key=True)
    date = Column(Date, index=True)
    title = Column(String)
    body = Column(String)
    image = Column(String, nullable=True)
    patient_data_id = Column(Integer, ForeignKey("patient_data.id"), index=True)

    patient_data = relationship("PatientData", back_populates="journal_entries")

    __table_args__ = (
        Index("ix_journal_entries_date_desc", date.desc()),
    )  # Index for date in descending order


class GuidedJournalEntry(Base):
    """
    Guided Journal Entry Model
    """

    __tablename__ = "guided_journal_entries"

    id = Column(Integer, primary_key=True)
    date = Column(Date, index=True)
    body = Column(JSON)
    patient_data_id = Column(Integer, ForeignKey("patient_data.id"), index=True)

    patient_data = relationship("PatientData", back_populates="guided_journal_entries")

    __table_args__ = (
        Index("ix_guided_journal_entries_date_desc", date.desc()),
    )  # Index for date in descending order
