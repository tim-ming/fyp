import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import Session, sessionmaker
from app import models, schemas
from app.database import Base
from app.commands import upsert_journal_entry, create_user, assign_therapist_to_patient, get_user_by_email
from datetime import date

@pytest.fixture(scope="module")
def test_db():
    engine = create_engine('sqlite:///:memory:')
    Base.metadata.create_all(bind=engine)
    TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    yield TestingSessionLocal
    Base.metadata.drop_all(bind=engine)

@pytest.fixture
def db_session(test_db):
    session = test_db()
    yield session
    session.close()

def test_upsert_journal_entry_create(db_session: Session):
    user_schema = schemas.UserCreate(
        email="journaluser@example.com",
        name="Journal User",
        password="testpassword",
        role="patient",
    )
    test_user = create_user(db_session, user_schema)

    journal_entry_schema = schemas.JournalEntryCreate(
        title="My First Journal",
        body="This is the body of my first journal.",
        date=date.today(),
        image=None,
    )
    journal_entry = upsert_journal_entry(db_session, journal_entry_schema, test_user)

    assert journal_entry is not None
    assert journal_entry.title == "My First Journal"
    assert journal_entry.body == "This is the body of my first journal."
    assert journal_entry.patient_data_id == test_user.patient_data.id

def test_upsert_journal_entry_update(db_session: Session):
    test_user = db_session.query(models.User).filter_by(email="journaluser@example.com").first()

    journal_entry_schema = schemas.JournalEntryCreate(
        title="Updated Journal Title",
        body="This is the updated body of my journal.",
        date=date.today(),
        image=None,
    )
    journal_entry = upsert_journal_entry(db_session, journal_entry_schema, test_user)

    assert journal_entry is not None
    assert journal_entry.title == "Updated Journal Title"
    assert journal_entry.body == "This is the updated body of my journal."

def test_upsert_journal_entry_new_date(db_session: Session):
    test_user = db_session.query(models.User).filter_by(email="journaluser@example.com").first()

    new_date = date.today().replace(day=date.today().day - 1)
    journal_entry_schema = schemas.JournalEntryCreate(
        title="Journal for New Date",
        body="This is a journal entry for a new date.",
        date=new_date,
        image=None,
    )
    journal_entry = upsert_journal_entry(db_session, journal_entry_schema, test_user)

    assert journal_entry is not None
    assert journal_entry.title == "Journal for New Date"
    assert journal_entry.body == "This is a journal entry for a new date."
    assert journal_entry.date == new_date

def test_assign_therapist_to_patient_success(db_session: Session):
    therapist_schema = schemas.UserCreate(
        email="therapist@example.com",
        name="Test Therapist",
        password="testpassword",
        role="therapist",
    )
    therapist = create_user(db_session, therapist_schema)

    patient_schema = schemas.UserCreate(
        email="patient@example.com",
        name="Test Patient",
        password="testpassword",
        role="patient",
    )
    patient = create_user(db_session, patient_schema)

    assign_therapist_to_patient(db_session, patient, therapist.id)

    updated_patient = get_user_by_email(db_session, "patient@example.com")

    assert updated_patient.patient_data is not None
    assert updated_patient.patient_data.therapist_id == therapist.therapist_data.id
    assert updated_patient.patient_data.therapist_user_id == therapist.id

def test_assign_therapist_to_patient_already_has_therapist(db_session: Session):
    patient = db_session.query(models.User).filter_by(email="patient@example.com").first()

    therapist_schema2 = schemas.UserCreate(
        email="therapist2@example.com",
        name="Therapist Two",
        password="testpassword",
        role="therapist",
    )
    therapist2 = create_user(db_session, therapist_schema2)

    with pytest.raises(Exception) as exc_info:
        assign_therapist_to_patient(db_session, patient, therapist2.id)
    assert str(exc_info.value) == "Patient already has a therapist"

def test_assign_therapist_to_non_patient(db_session: Session):
    therapist1 = db_session.query(models.User).filter_by(email="therapist@example.com").first()
    therapist2 = db_session.query(models.User).filter_by(email="therapist2@example.com").first()

    with pytest.raises(Exception) as exc_info:
        assign_therapist_to_patient(db_session, therapist1, therapist2.id)
    assert str(exc_info.value) == "Patient data not found"