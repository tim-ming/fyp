from typing import List, Optional
from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import datetime
from app import models, schemas


def get_user_by_email(db: Session, email: str) -> Optional[models.User]:
    """
    Get user by email
    :param db (Session): Database session
    :param email (str): Email
    :return (Optional[None]): User if found, None if not found
    """
    return db.query(models.User).filter(models.User.email == email).first()


def create_user(db: Session, user: schemas.UserCreate) -> models.User:
    """
    Create a new user
    :param db (Session): Database session
    :param user (schemas.UserCreate): User create schema
    :return (models.User): New user
    """
    db_user = models.User(
        email=user.email, name=user.name, hashed_password=user.password
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user


def update_user(db: Session, user: schemas.User) -> models.User:
    """
    Update a user (currently just the name)
    :param db (Session): Database session
    :param user (schemas.User): User schema
    :return (models.User): Updated user
    """
    db_user = db.query(models.User).filter(models.User.email == user.email).first()
    db_user.name = user.name
    db.commit()
    db.refresh(db_user)
    return db_user


def get_mood_entries_by_user(
    db: Session, user: schemas.User, skip: int = 0, limit: int = 100
) -> List[models.MoodEntry]:
    """
    Get mood entries by user
    :param db (Session): Database session
    :param user (schemas.User): User
    :param skip (int): Number of entries to skip
    :param limit (int): Number of entries to return
    :return (List[models.MoodEntry]): Mood entries
    """
    return (
        db.query(models.MoodEntry)
        .filter(models.MoodEntry.user_id == user.id)
        .order_by(models.JournalEntry.datetime.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )


def upsert_mood_entry(
    db: Session, mood_entry: schemas.MoodEntryCreate, user: schemas.User
) -> models.MoodEntry:
    """
    Update or insert a mood entry (depending on whether it has been written for a certain day)
    :param db (Session): Database session
    :param mood_entry (schemas.MoodEntryCreate): Mood entry create schema
    :param user (schemas.User): User
    :return (models.MoodEntry): New mood entry
    """

    if mood_entry.datetime is None:
        mood_entry.datetime = datetime.now()
    entry_date = mood_entry.datetime.date()

    db_mood_entry = (
        db.query(models.MoodEntry)
        .filter(models.MoodEntry.user_id == user.id)
        .filter(func.date(models.MoodEntry.datetime) == entry_date)
        .first()
    )

    if db_mood_entry:
        # Update existing entry
        db_mood_entry.mood = mood_entry.mood
        db_mood_entry.datetime = mood_entry.datetime  # Update time as well
    else:
        # Create new entry
        db_mood_entry = models.MoodEntry(
            mood=mood_entry.mood, user_id=user.id, datetime=mood_entry.datetime
        )
        db.add(db_mood_entry)

    db.commit()
    db.refresh(db_mood_entry)
    return db_mood_entry


def get_journal_entries_by_user(
    db: Session, user: schemas.User, skip: int = 0, limit: int = 100
) -> List[models.JournalEntry]:
    """
    Get journal entries by user
    :param db (Session): Database session
    :param user (schemas.User): User
    :param skip (int): Number of entries to skip
    :param limit (int): Number of entries to return
    :return (List[models.JournalEntry]): Journal entries
    """
    return (
        db.query(models.JournalEntry)
        .filter(models.JournalEntry.user_id == user.id)
        .order_by(models.JournalEntry.datetime.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )

def upsert_journal_entry(
    db: Session, journal_entry: schemas.JournalEntryCreate, user: schemas.User
) -> models.JournalEntry:
    """
    Update or insert a journal entry (depending on whether it has been written for a certain day)
    :param db (Session): Database session
    :param journal_entry (schemas.JournalEntryCreate): Journal entry create schema
    :param user (schemas.User): User
    :return (models.JournalEntry): New journal entry
    """

    if journal_entry.datetime is None:
        journal_entry.datetime = datetime.now()
    entry_date = journal_entry.datetime.date()

    db_journal_entry = (
        db.query(models.JournalEntry)
        .filter(models.JournalEntry.user_id == user.id)
        .filter(func.date(models.JournalEntry.datetime) == entry_date)
        .first()
    )

    if db_journal_entry:
        # Update existing entry
        db_journal_entry.title = journal_entry.title
        db_journal_entry.body = journal_entry.body
        db_journal_entry.image = journal_entry.image
        db_journal_entry.datetime = journal_entry.datetime  # Update time as well
    else:
        # Create new entry
        db_journal_entry = models.JournalEntry(
            title=journal_entry.title,
            body=journal_entry.body,
            image=journal_entry.image,
            user_id=user.id,
            datetime=journal_entry.datetime,
        )
        db.add(db_journal_entry)

    db.commit()
    db.refresh(db_journal_entry)
    return db_journal_entry


def count_mood_entries_by_user(db: Session, user: schemas.User) -> int:
    """
    Count mood entries by user
    :param db (Session): Database session
    :param user (schemas.User): User
    :return (int): Number of mood entries
    """
    return (
        db.query(models.MoodEntry).filter(models.MoodEntry.user_id == user.id).count()
    )


def count_journal_entries_by_user(db: Session, user: schemas.User) -> int:
    """
    Count journal entries by user
    :param db (Session): Database session
    :param user (schemas.User): User
    :return (int): Number of journal entries
    """
    return (
        db.query(models.JournalEntry)
        .filter(models.JournalEntry.user_id == user.id)
        .count()
    )

def count_guided_journal_entries_by_user(db: Session, user: schemas.User) -> int:
    """
    Count guided journal entries by user
    :param db (Session): Database session
    :param user (schemas.User): User
    :return (int): Number of guided journal entries
    """
    return (
        db.query(models.GuidedJournalEntry)
        .filter(models.GuidedJournalEntry.user_id == user.id)
        .count()
    )

def get_mood_entry_by_id(
    db: Session, mood_id: int, user: schemas.User
) -> Optional[models.MoodEntry]:
    """
    Get a mood entry by ID
    :param db (Session): Database session
    :param mood_id (int): Mood entry ID
    :param user (schemas.User): User
    :return (Optional[models.MoodEntry]): Mood entry if found, None if not found
    """
    return (
        db.query(models.MoodEntry)
        .filter(models.MoodEntry.id == mood_id, models.MoodEntry.user_id == user.id)
        .first()
    )


def get_journal_entry_by_id(
    db: Session, journal_id: int, user: schemas.User
) -> Optional[models.JournalEntry]:
    """
    Get a journal entry by ID
    :param db (Session): Database session
    :param journal_id (int): Journal entry ID
    :param user (schemas.User): User
    :return (Optional[models.JournalEntry]): Journal entry if found, None if not found
    """
    return (
        db.query(models.JournalEntry)
        .filter(
            models.JournalEntry.id == journal_id, models.JournalEntry.user_id == user.id
        )
        .first()
    )


def get_guided_journal_entries_by_user(
    db: Session, user: schemas.User, skip: int = 0, limit: int = 100
) -> List[models.GuidedJournalEntry]:
    """
    Get guided journal entries by user
    :param db (Session): Database session
    :param user (schemas.User): User
    :param skip (int): Number of entries to skip
    :param limit (int): Number of entries to return
    :return (List[models.GuidedJournalEntry]): Guided journal entries
    """
    return (
        db.query(models.GuidedJournalEntry)
        .filter(models.GuidedJournalEntry.user_id == user.id)
        .order_by(models.GuidedJournalEntry.datetime.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )

def upsert_guided_journal_entry(
    db: Session, guided_journal_entry: schemas.GuidedJournalEntryCreate, user: schemas.User
) -> models.GuidedJournalEntry:
    """
    Update or insert a guided journal entry (depending on whether it has been written for a certain day)
    :param db (Session): Database session
    :param guided_journal_entry (schemas.GuidedJournalEntryCreate): Guided journal entry create schema
    :param user (schemas.User): User
    :return (models.GuidedJournalEntry): New guided journal entry
    """

    if guided_journal_entry.datetime is None:
        guided_journal_entry.datetime = datetime.now()
    entry_date = guided_journal_entry.datetime.date()

    db_guided_journal_entry = (
        db.query(models.GuidedJournalEntry)
        .filter(models.GuidedJournalEntry.user_id == user.id)
        .filter(func.date(models.GuidedJournalEntry.datetime) == entry_date)
        .first()
    )

    if db_guided_journal_entry:
        # Update existing entry
        db_guided_journal_entry.body = guided_journal_entry.body
        db_guided_journal_entry.datetime = guided_journal_entry.datetime  # Update time as well
    else:
        # Create new entry
        db_guided_journal_entry = models.GuidedJournalEntry(
            body=guided_journal_entry.body,
            user_id=user.id,
            datetime=guided_journal_entry.datetime,
        )
        db.add(db_guided_journal_entry)

    db.commit()
    db.refresh(db_guided_journal_entry)
    return db_guided_journal_entry

def get_guided_journal_entry_by_id(
    db: Session, guided_journal_id: int, user: schemas.User
) -> Optional[models.GuidedJournalEntry]:
    """
    Get a guided journal entry by ID
    :param db (Session): Database session
    :param guided_journal_id (int): Guided journal entry ID
    :param user (schemas.User): User
    :return (Optional[models.GuidedJournalEntry]): Guided journal entry if found, None if not found
    """
    return (
        db.query(models.GuidedJournalEntry)
        .filter(
            models.GuidedJournalEntry.id == guided_journal_id, models.GuidedJournalEntry.user_id == user.id
        )
        .first()
    )

def create_social_accounts(
    db: Session, social_accounts: List[schemas.SocialAccountCreate], user: schemas.User
) -> List[models.SocialAccount]:
    """
    Create social accounts
    :param db (Session): Database session
    :param social_accounts (List[schemas.SocialAccountCreate]): Social account create schemas
    :param user (schemas.User): User
    :return (List[models.SocialAccount]): New social accounts
    """
    db_social_accounts = []
    for social_account in social_accounts:
        db_social_account = models.SocialAccount(
            provider=social_account.provider,
            provider_user_id=social_account.provider_user_id,
            access_token=social_account.access_token,
            refresh_token=social_account.refresh_token,
            expires_at=social_account.expires_at,
            user_id=user.id,
        )
        db.add(db_social_account)
        db_social_accounts.append(db_social_account)
    db.commit()
    return db_social_accounts


def update_user(db: Session, user: schemas.UserUpdate) -> models.User:
    """
    Update a user
    :param db (Session): Database session
    :param user (schemas.UserUpdate): User update schema
    :return (models.User): Updated user
    """
    db_user = db.query(models.User).filter(models.User.email == user.email).first()
    if user.name is not None:
        db_user.name = user.name
    if user.is_active is not None:
        db_user.is_active = user.is_active
    if user.has_onboarded is not None:
        db_user.has_onboarded = user.has_onboarded
    db.commit()
    db.refresh(db_user)
    return db_user
