import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import Session, sessionmaker
from app import models, schemas
from app.database import Base
from app.commands import upsert_journal_entry, create_user
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
