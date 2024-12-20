from typing import List, Optional
from sqlalchemy import or_
from sqlalchemy.orm import Session, joinedload
from app import models, schemas
from datetime import date, datetime, timedelta

def get_latest_depression_risk_log_by_user(
    db: Session, user: schemas.User
) -> Optional[models.DepressionRiskLog]:
    """
    Get the latest depression risk log by user
    :param db (Session): Database session
    :param user (schemas.User): User
    :return (Optional[models.DepressionRiskLog]): Latest depression risk log
    """

    return (
        db.query(models.DepressionRiskLog)
        .filter(models.DepressionRiskLog.user_id == user.id)
        .order_by(models.DepressionRiskLog.date.desc())
        .first()
    )

def get_depression_risk_logs_by_user(
    db: Session, user_id: int, skip: int = 0, limit: int = 100
) -> List[models.DepressionRiskLog]:
    """
    Get depression risk logs by user id
    :param db (Session): Database session
    :param user_id (int): User ID
    :param skip (int): Number of entries to skip
    :param limit (int): Number of entries to return
    :return (List[models.DepressionRiskLog]): Depression risk logs
    """
    return (
        db.query(models.DepressionRiskLog)
        .filter(models.DepressionRiskLog.user_id == user_id)
        .order_by(models.DepressionRiskLog.date.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )

def upsert_depression_risk_log(db: Session, depression_risk_log: schemas.DepressionRiskLog):
    """
    Update or insert a depression risk log
    :param db (Session): Database session
    :param depression_risk_log (schemas.DepressionRiskLog): Depression risk log create schema
    :return (models.DepressionRiskLog): New depression risk log
    """
    db_depression_risk_log = (
        db.query(models.DepressionRiskLog)
        .filter(models.DepressionRiskLog.user_id == depression_risk_log.user_id)
        .filter(models.DepressionRiskLog.date == depression_risk_log.date)
        .first()
    )

    if db_depression_risk_log:
        # Update existing entry
        db_depression_risk_log.value = depression_risk_log.value
    else:
        # Create new entry
        db_depression_risk_log = models.DepressionRiskLog(
            user_id=depression_risk_log.user_id,
            value=depression_risk_log.value,
            date=depression_risk_log.date
        )
        db.add(db_depression_risk_log)

    db.commit()
    db.refresh(db_depression_risk_log)
    return db_depression_risk_log

def get_user_by_email(db: Session, email: str) -> Optional[models.User]:
    """
    Get user by email
    :param db (Session): Database session
    :param email (str): Email
    :return (Optional[None]): User if found, None if not found
    """
    return db.query(models.User).filter(models.User.email == email).first()


def get_user_by_id(db: Session, user_id: int) -> Optional[models.User]:
    """
    Get user by ID
    :param db (Session): Database session
    :param user_id (int): User ID
    :return (Optional[models.User]): User if found, None if not found
    """
    return db.query(models.User).filter(models.User.id == user_id).first()


def create_user(db: Session, user: schemas.UserCreate) -> models.User:
    """
    Create a new user
    :param db (Session): Database session
    :param user (schemas.UserCreate): User create schema
    :return (models.User): New user
    """
    db_user = models.User(
        email=user.email,
        name=user.name,
        dob=user.dob,
        sex=user.sex,
        occupation=user.occupation,
        hashed_password=user.password,
        role=user.role,
        image=user.image
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)

    if user.role == "therapist":
        db_therapist_data = models.TherapistData(user_id=db_user.id)
        db.add(db_therapist_data)
        db.commit()
        db.refresh(db_therapist_data)

    elif user.role == "patient":
        db_patient_data = models.PatientData(user_id=db_user.id)
        db.add(db_patient_data)
        db.commit()
        db.refresh(db_patient_data)

    return db_user


def create_google_user(db: Session, user: schemas.UserCreate) -> models.User:
    """
    Create a new Google user
    :param db (Session): Database session
    :param user (schemas.UserCreate): User create schema
    :return (models.User): New user
    """
    db_user = models.User(
        email=user.email,
        name=user.name,
        role=user.role,
        image = user.image)
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    
    if user.role == "therapist":
        db_therapist_data = models.TherapistData(user_id=db_user.id)
        db.add(db_therapist_data)
        db.commit()
        db.refresh(db_therapist_data)

    elif user.role == "patient":
        db_patient_data = models.PatientData(user_id=db_user.id)
        db.add(db_patient_data)
        db.commit()
        db.refresh(db_patient_data)

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
    db_patient_data = (
        db.query(models.PatientData)
        .filter(models.PatientData.user_id == user.id)
        .first()
    )
    if db_patient_data is None:
        return []

    return (
        db.query(models.MoodEntry)
        .filter(models.MoodEntry.patient_data_id == db_patient_data.id)
        .order_by(models.MoodEntry.date.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )


def get_mood_entries_by_date_range(
    db: Session, user: schemas.User, start_date: date, end_date: date
) -> List[models.MoodEntry]:
    """
    Get mood entries by date range

    :param db (Session): Database session
    :param user (schemas.User): User
    :param start_date: Start date
    :param end_date: End date
    :return (List[models.MoodEntry]): Mood entries
    """
    db_patient_data = (
        db.query(models.PatientData)
        .filter(models.PatientData.user_id == user.id)
        .first()
    )
    if db_patient_data is None:
        return []

    return (
        db.query(models.MoodEntry)
        .filter(
            models.MoodEntry.user_id == user.id,
            models.MoodEntry.date >= start_date,
            models.MoodEntry.date <= end_date,
        )
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
    db_patient_data = (
        db.query(models.PatientData)
        .filter(models.PatientData.user_id == user.id)
        .first()
    )
    if db_patient_data is None:
        raise Exception("Patient data not found")

    db_mood_entry = (
        db.query(models.MoodEntry)
        .filter(models.MoodEntry.patient_data_id == db_patient_data.id)
        .filter(models.MoodEntry.date == mood_entry.date)
        .first()
    )

    db_user = db.query(models.User).filter(models.User.email == user.email).first()

    # Convert mood_entry.date to datetime at the start of the day
    mood_entry_datetime = datetime.combine(mood_entry.date, datetime.min.time())

    # Check if the last login was yesterday
    if db_user.last_login is not None:
        last_login_date = db_user.last_login.date()
        if last_login_date == mood_entry.date - timedelta(days=1):
            db_user.streak += 1
        elif last_login_date != mood_entry.date:  # Reset streak if not consecutive days
            db_user.streak = 1
    else:
        # If it's the first login, start the streak
        db_user.streak = 1

    # Update last_login if the new entry is more recent
    if db_user.last_login is None or mood_entry_datetime > db_user.last_login:
        db_user.last_login = mood_entry_datetime

    db.commit()
    db.refresh(db_user)

    if db_mood_entry:
        # Update existing entry
        db_mood_entry.mood = mood_entry.mood
        db_mood_entry.eat = mood_entry.eat
        db_mood_entry.sleep = mood_entry.sleep
    else:
        # Create new entry
        db_mood_entry = models.MoodEntry(
            mood=mood_entry.mood,
            eat=mood_entry.eat,
            sleep=mood_entry.sleep,
            date=mood_entry.date,
            patient_data_id=db_patient_data.id,
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
    db_patient_data = (
        db.query(models.PatientData)
        .filter(models.PatientData.user_id == user.id)
        .first()
    )
    if db_patient_data is None:
        return []

    return (
        db.query(models.JournalEntry)
        .filter(models.JournalEntry.patient_data_id == db_patient_data.id)
        .order_by(models.JournalEntry.date.desc())
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
    db_patient_data = (
        db.query(models.PatientData)
        .filter(models.PatientData.user_id == user.id)
        .first()
    )
    if db_patient_data is None:
        raise Exception("Patient data not found")

    db_journal_entry = (
        db.query(models.JournalEntry)
        .filter(models.JournalEntry.patient_data_id == db_patient_data.id)
        .filter(models.JournalEntry.date == journal_entry.date)
        .first()
    )

    if db_journal_entry:
        # Update existing entry
        db_journal_entry.title = journal_entry.title
        db_journal_entry.body = journal_entry.body
        db_journal_entry.image = journal_entry.image
    else:
        # Create new entry
        db_journal_entry = models.JournalEntry(
            title=journal_entry.title,
            body=journal_entry.body,
            image=journal_entry.image,
            date=journal_entry.date,
            patient_data_id=db_patient_data.id,
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
    db_patient_data = (
        db.query(models.PatientData)
        .filter(models.PatientData.user_id == user.id)
        .first()
    )
    if db_patient_data is None:
        return 0

    return (
        db.query(models.MoodEntry)
        .filter(models.MoodEntry.patient_data_id == db_patient_data.id)
        .count()
    )


def count_journal_entries_by_user(db: Session, user: schemas.User) -> int:
    """
    Count journal entries by user
    :param db (Session): Database session
    :param user (schemas.User): User
    :return (int): Number of journal entries
    """
    db_patient_data = (
        db.query(models.PatientData)
        .filter(models.PatientData.user_id == user.id)
        .first()
    )
    if db_patient_data is None:
        return 0

    return (
        db.query(models.JournalEntry)
        .filter(models.JournalEntry.patient_data_id == db_patient_data.id)
        .count()
    )


def count_guided_journal_entries_by_user(db: Session, user: schemas.User) -> int:
    """
    Count guided journal entries by user
    :param db (Session): Database session
    :param user (schemas.User): User
    :return (int): Number of guided journal entries
    """
    db_patient_data = (
        db.query(models.PatientData)
        .filter(models.PatientData.user_id == user.id)
        .first()
    )
    if db_patient_data is None:
        return 0

    return (
        db.query(models.GuidedJournalEntry)
        .filter(models.GuidedJournalEntry.patient_data_id == db_patient_data.id)
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
    db_patient_data = (
        db.query(models.PatientData)
        .filter(models.PatientData.user_id == user.id)
        .first()
    )
    if db_patient_data is None:
        return None

    return (
        db.query(models.MoodEntry)
        .filter(
            models.MoodEntry.id == mood_id,
            models.MoodEntry.patient_data_id == db_patient_data.id,
        )
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
    db_patient_data = (
        db.query(models.PatientData)
        .filter(models.PatientData.user_id == user.id)
        .first()
    )
    if db_patient_data is None:
        return None

    return (
        db.query(models.JournalEntry)
        .filter(
            models.JournalEntry.id == journal_id,
            models.JournalEntry.patient_data_id == db_patient_data.id,
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
    db_patient_data = (
        db.query(models.PatientData)
        .filter(models.PatientData.user_id == user.id)
        .first()
    )
    if db_patient_data is None:
        return []

    return (
        db.query(models.GuidedJournalEntry)
        .filter(models.GuidedJournalEntry.patient_data_id == db_patient_data.id)
        .order_by(models.GuidedJournalEntry.date.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )


def upsert_guided_journal_entry(
    db: Session,
    guided_journal_entry: schemas.GuidedJournalEntryCreate,
    user: schemas.User,
) -> models.GuidedJournalEntry:
    """
    Update or insert a guided journal entry (depending on whether it has been written for a certain day)
    :param db (Session): Database session
    :param guided_journal_entry (schemas.GuidedJournalEntryCreate): Guided journal entry create schema
    :param user (schemas.User): User
    :return (models.GuidedJournalEntry): New guided journal entry
    """
    db_patient_data = (
        db.query(models.PatientData)
        .filter(models.PatientData.user_id == user.id)
        .first()
    )
    if db_patient_data is None:
        raise Exception("Patient data not found")

    db_guided_journal_entry = (
        db.query(models.GuidedJournalEntry)
        .filter(models.GuidedJournalEntry.patient_data_id == db_patient_data.id)
        .filter(models.GuidedJournalEntry.date == guided_journal_entry.date)
        .first()
    )

    journal_body_dict = guided_journal_entry.body.dict()

    if db_guided_journal_entry:
        # Update existing entry
        db_guided_journal_entry.body = journal_body_dict
    else:
        # Create new entry
        db_guided_journal_entry = models.GuidedJournalEntry(
            body=journal_body_dict,
            date=guided_journal_entry.date,
            patient_data_id=db_patient_data.id,
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
    db_patient_data = (
        db.query(models.PatientData)
        .filter(models.PatientData.user_id == user.id)
        .first()
    )
    if db_patient_data is None:
        return None

    return (
        db.query(models.GuidedJournalEntry)
        .filter(
            models.GuidedJournalEntry.id == guided_journal_id,
            models.GuidedJournalEntry.patient_data_id == db_patient_data.id,
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


def update_user(
    db: Session, user_update: schemas.UserUpdate, user: schemas.User
) -> models.User:
    """
    Update a user
    :param db (Session): Database session
    :param user (schemas.UserUpdate): User update schema
    :return (models.User): Updated user
    """
    db_user = db.query(models.User).filter(models.User.email == user.email).first()
    if user_update.name is not None:
        db_user.name = user_update.name
    if user_update.is_active is not None:
        db_user.is_active = user_update.is_active
    if user_update.dob is not None:
        db_user.dob = user_update.dob
    if user_update.sex is not None:
        db_user.sex = user_update.sex
    if user_update.occupation is not None:
        db_user.occupation = user_update.occupation
    if user_update.image is not None:
        db_user.image = user_update.image
    db.commit()
    db.refresh(db_user)
    return db_user


def get_journal_entry_by_date(
    db: Session, date: str, user: schemas.User
) -> Optional[models.JournalEntry]:
    """
    Get a journal entry by date
    :param db (Session): Database session
    :param date (str): Date
    :param user (schemas.User): User
    :return (Optional[models.JournalEntry]): Journal entry if found, None if not found
    """
    db_patient_data = (
        db.query(models.PatientData)
        .filter(models.PatientData.user_id == user.id)
        .first()
    )
    if db_patient_data is None:
        return None

    return (
        db.query(models.JournalEntry)
        .filter(
            models.JournalEntry.patient_data_id == db_patient_data.id,
            models.JournalEntry.date == date,
        )
        .first()
    )


def get_guided_journal_entry_by_date(
    db: Session, date: str, user: schemas.User
) -> Optional[models.GuidedJournalEntry]:
    """
    Get a guided journal entry by date
    :param db (Session): Database session
    :param date (str): Date
    :param user (schemas.User): User
    :return (Optional[models.GuidedJournalEntry]): Guided journal entry if found, None if not found
    """
    db_patient_data = (
        db.query(models.PatientData)
        .filter(models.PatientData.user_id == user.id)
        .first()
    )
    if db_patient_data is None:
        return None

    return (
        db.query(models.GuidedJournalEntry)
        .filter(
            models.GuidedJournalEntry.patient_data_id == db_patient_data.id,
            models.GuidedJournalEntry.date == date,
        )
        .first()
    )


def get_mood_entry_by_date(
    db: Session, date: str, user: schemas.User
) -> Optional[models.MoodEntry]:
    """
    Get a mood entry by date
    :param db (Session): Database session
    :param date (str): Date
    :param user (schemas.User): User
    :return (Optional[models.MoodEntry]): Mood entry if found, None if not found
    """
    db_patient_data = (
        db.query(models.PatientData)
        .filter(models.PatientData.user_id == user.id)
        .first()
    )
    if db_patient_data is None:
        return None

    return (
        db.query(models.MoodEntry)
        .filter(
            models.MoodEntry.patient_data_id == db_patient_data.id,
            models.MoodEntry.date == date,
        )
        .first()
    )


def assign_therapist_to_patient(
    db: Session, patient: schemas.User, therapist_id: int
) -> models.User:
    """
    Assign a therapist to a patient
    :param db (Session): Database session
    :param patient (schemas.User): Patient
    :param therapist_id (int): Therapist ID
    :return (models.User): Updated patient
    """
    db_patient = (
        db.query(models.User).filter(models.User.email == patient.email).first()
    )
    if db_patient.patient_data is None:
        raise Exception("Patient data not found")

    if db_patient.patient_data.therapist_id is not None:
        raise Exception("Patient already has a therapist")

    db_therapist_data = (
        db.query(models.TherapistData)
        .filter(models.TherapistData.user_id == therapist_id)
        .first()
    )
    db_patient.patient_data.therapist_id = db_therapist_data.id
    db_patient.patient_data.therapist_user_id = therapist_id
    db.commit()
    db.refresh(db_patient)
    return db_patient


def remove_therapist_from_patient(db: Session, patient: schemas.User) -> models.User:
    """
    Remove a therapist from a patient
    :param db (Session): Database session
    :param patient (schemas.User): Patient
    :return (models.User): Updated patient
    """
    db_patient = (
        db.query(models.User).filter(models.User.email == patient.email).first()
    )
    if db_patient.patient_data is None:
        raise Exception("Patient data not found")

    if db_patient.patient_data.therapist_id is None:
        raise Exception("Patient does not have a therapist")

    db_patient.patient_data.therapist_id = None
    db_patient.patient_data.therapist_user_id = None
    db.commit()
    db.refresh(db_patient)
    return db_patient


def get_therapist_by_patient(
    db: Session, patient: schemas.User
) -> Optional[models.User]:
    """
    Get a therapist by patient
    :param db (Session): Database session
    :param patient (schemas.User): Patient
    :return (Optional[models.User]): Therapist if found, None if not found
    """
    db_patient = (
        db.query(models.User).filter(models.User.email == patient.email).first()
    )
    if db_patient.patient_data is None or db_patient.patient_data.therapist_id is None:
        return None

    return (
        db.query(models.User)
        .join(models.TherapistData)
        .filter(models.TherapistData.id == db_patient.patient_data.therapist_id)
        .first()
    )


def get_patients_by_therapist(
    db: Session, therapist: schemas.User
) -> List[models.User]:
    """
    Get patients by therapist
    :param db (Session): Database session
    :param therapist (schemas.User): Therapist
    :param skip (int): Number of entries to skip
    :param limit (int): Number of entries to return
    :return (List[models.User]): Patients
    """
    db_therapist = (
        db.query(models.TherapistData)
        .filter(models.TherapistData.user_id == therapist.id)
        .first()
    )
    if db_therapist is None:
        return []

    return (
        db.query(models.User)
        .join(models.PatientData)
        .filter(models.PatientData.therapist_id == db_therapist.id)
        .options(
            joinedload(models.User.patient_data).noload(
                models.PatientData.mood_entries
            ),
            joinedload(models.User.patient_data).noload(
                models.PatientData.journal_entries
            ),
            joinedload(models.User.patient_data).noload(
                models.PatientData.guided_journal_entries
            ),
        )
        .all()
    )


def update_patient_data(
    db: Session, patient_data: schemas.PatientDataUpdate
) -> models.PatientData:
    """
    Update severity for a patient
    :param db (Session): Database session
    :param patient_id (int): User ID
    :param severity (str): Severity
    :return (models.PatientData.severity): Updated severity
    """
    db_patient_data = (
        db.query(models.PatientData)
        .filter(models.PatientData.user_id == patient_data.user_id)
        .first()
    )
    if db_patient_data is None:
        raise Exception("Patient data not found")

    if patient_data.has_onboarded is not None:
        db_patient_data.has_onboarded = patient_data.has_onboarded
    if patient_data.severity is not None:
        db_patient_data.severity = patient_data.severity
    if patient_data.therapist_note is not None:
        db_patient_data.therapist_note = patient_data.therapist_note
    db.commit()
    db.refresh(db_patient_data)
    return {
        "user_id": db_patient_data.user_id,
        "id": db_patient_data.id,
        "has_onboarded": db_patient_data.has_onboarded,
        "severity": db_patient_data.severity,
        "therapist_note": db_patient_data.therapist_note
    }


def get_therapists(
    db: Session, skip: int = 0, limit: int = 100) -> List[models.User]:
    """
    Get therapists
    :param db (Session): Database session
    :param skip (int): Number of entries to skip
    :param limit (int): Number of entries to return
    :return (List[models.User]): Therapists
    """
    return (
        db.query(models.User)
        .filter(models.User.role == "therapist")
        .offset(skip)
        .limit(limit)
        .all()
    )


def get_therapist_by_id(
    db: Session, therapist_id: int) -> Optional[models.User]:
    """
    Get therapist by ID
    :param db (Session): Database session
    :param therapist_id (int): Therapist ID
    :return (Optional[models.User]): Therapist if found, None if not found
    """
    return (
        db.query(models.User)
        .filter(models.User.id == therapist_id)
        .options(
            joinedload(models.User.therapist_data).noload(
                models.TherapistData.patients
            )
        ).first()
    )

def get_patient_by_id(
    db: Session, patient_id: int) -> Optional[models.User]:
    """
    Get patient by ID
    :param db (Session): Database session
    :param patient_id (int): Patient ID
    :return (Optional[models.User]): Patient if found, None if not found
    """

    return (
        db.query(models.User)
        .filter(models.User.id == patient_id)
        .options(
            joinedload(models.User.patient_data).noload(
                models.PatientData.mood_entries
            ),
            joinedload(models.User.patient_data).noload(
                models.PatientData.journal_entries
            ),
            joinedload(models.User.patient_data).noload(
                models.PatientData.guided_journal_entries
            )
        ).first()
    )


def update_therapist_data(
    db: Session, therapist_data: schemas.TherapistDataCreate) -> models.TherapistData:
    """
    Update therapist data
    :param db (Session): Database session
    :param therapist_data (schemas.TherapistDataCreate): Therapist data update schema
    :return (models.TherapistData): Updated therapist data
    """
    db_therapist_data = db.query(models.TherapistData).filter(models.TherapistData.user_id == therapist_data.user_id).first()
    if db_therapist_data is None:
        raise Exception("Therapist data not found")
    
    if therapist_data.qualifications is not None:
        db_therapist_data.qualifications = therapist_data.qualifications
    if therapist_data.expertise is not None:
        db_therapist_data.expertise = therapist_data.expertise
    if therapist_data.bio is not None:
        db_therapist_data.bio = therapist_data.bio
    if therapist_data.treatment_approach is not None:
        db_therapist_data.treatment_approach = therapist_data.treatment_approach
    db.commit()
    db.refresh(db_therapist_data)
    return {
        "user_id": db_therapist_data.user_id,
        "id": db_therapist_data.id,
        "qualifications": db_therapist_data.qualifications,
        "expertise": db_therapist_data.expertise,
        "bio": db_therapist_data.bio,
        "treatment_approach": db_therapist_data.treatment_approach
    }

def insert_chat_message(
    db: Session, chat_message: schemas.ChatMessageCreate
) -> models.ChatMessage:
    """
    Insert a chat message
    :param db (Session): Database session
    :param chat_message (schemas.ChatMessageCreate): Chat message create schema
    :return (models.ChatMessage): New chat message
    """
    db_chat_message = models.ChatMessage(
        sender_id=chat_message.sender_id,
        content=chat_message.content,
        recipient_id=chat_message.recipient_id,
        timestamp=datetime.now()
    )
    db.add(db_chat_message)
    db.commit()
    db.refresh(db_chat_message)
    return db_chat_message

def get_chat_messages(
    db: Session, user: schemas.User, other_user_id: int, skip: int = 0, limit: int = 100
) -> List[models.ChatMessage]:
    """
    Get chat messages between two users
    :param db (Session): Database session
    :param user (schemas.User): Current user
    :param other_user_id (int): ID of the other user in the conversation
    :param skip (int): Number of entries to skip
    :param limit (int): Number of entries to return
    :return (List[models.ChatMessage]): Chat messages
    """
    return (
        db.query(models.ChatMessage)
        .filter(
            or_(
                (models.ChatMessage.sender_id == user.id) & (models.ChatMessage.recipient_id == other_user_id),
                (models.ChatMessage.sender_id == other_user_id) & (models.ChatMessage.recipient_id == user.id)
            )
        )
        .order_by(models.ChatMessage.timestamp)  # Assuming there's a timestamp field
        .offset(skip)
        .limit(limit)
        .all()
    )

def get_all_patients_with_entries(
    db: Session, skip: int = 0, limit: int = 100
) -> List[models.User]:
    """
    Get all patients including their journal / guided journal entries
    :param db (Session): Database session
    :param skip (int): Number of entries to skip
    :param limit (int): Number of entries to return
    :return (List[models.User]): Patients
    """

    return (
        db.query(models.User)
        .join(models.PatientData)
        .join(models.JournalEntry)
        .offset(skip)
        .limit(limit)
        .all()
    )