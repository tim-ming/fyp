from typing import Optional
from sqlalchemy.orm import Session

from . import models, schemas


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
    db_user = models.User(email=user.email, hashed_password=user.password)
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
) -> list[models.MoodEntry]:
    """
    Get mood entries by user
    :param db (Session): Database session
    :param user (schemas.User): User
    :param skip (int): Number of entries to skip
    :param limit (int): Number of entries to return
    :return (list[models.MoodEntry]): Mood entries
    """
    return (
        db.query(models.MoodEntry)
        .filter(models.MoodEntry.user_id == user.id)
        .offset(skip)
        .limit(limit)
        .all()
    )


def create_mood_entry(
    db: Session, mood_entry: schemas.MoodEntryCreate, user: schemas.User
) -> models.MoodEntry:
    """
    Create a new mood entry
    :param db (Session): Database session
    :param mood_entry (schemas.MoodEntryCreate): Mood entry create schema
    :param user (schemas.User): User
    :return (models.MoodEntry): New mood entry
    """
    db_mood_entry = models.MoodEntry(mood=mood_entry.mood, user_id=user.id)
    db.add(db_mood_entry)
    db.commit()
    db.refresh(db_mood_entry)
    return db_mood_entry


def get_journal_entries_by_user(
    db: Session, user: schemas.User, skip: int = 0, limit: int = 100
) -> list[models.JournalEntry]:
    """
    Get journal entries by user
    :param db (Session): Database session
    :param user (schemas.User): User
    :param skip (int): Number of entries to skip
    :param limit (int): Number of entries to return
    :return (list[models.JournalEntry]): Journal entries
    """
    return (
        db.query(models.JournalEntry)
        .filter(models.JournalEntry.user_id == user.id)
        .offset(skip)
        .limit(limit)
        .all()
    )


def create_journal_entry(
    db: Session, journal_entry: schemas.JournalEntryCreate, user: schemas.User
) -> models.JournalEntry:
    """
    Create a new journal entry
    :param db (Session): Database session
    :param journal_entry (schemas.JournalEntryCreate): Journal entry create schema
    :param user (schemas.User): User
    :return (models.JournalEntry): New journal entry
    """
    db_journal_entry = models.JournalEntry(
        title=journal_entry.title,
        body=journal_entry.body,
        image=journal_entry.image,
        user_id=user.id,
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

def get_mood_entry_by_id(db: Session, mood_id: int, user: schemas.User) -> Optional[models.MoodEntry]:
    """
    Get a mood entry by ID
    :param db (Session): Database session
    :param mood_id (int): Mood entry ID
    :param user (schemas.User): User
    :return (Optional[models.MoodEntry]): Mood entry if found, None if not found
    """
    return db.query(models.MoodEntry).filter(models.MoodEntry.id == mood_id, models.MoodEntry.user_id == user.id).first()

def get_journal_entry_by_id(db: Session, journal_id: int, user: schemas.User) -> Optional[models.JournalEntry]:
    """
    Get a journal entry by ID
    :param db (Session): Database session
    :param journal_id (int): Journal entry ID
    :param user (schemas.User): User
    :return (Optional[models.JournalEntry]): Journal entry if found, None if not found
    """
    return db.query(models.JournalEntry).filter(models.JournalEntry.id == journal_id, models.JournalEntry.user_id == user.id).first()