import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import Session, sessionmaker
from passlib.context import CryptContext
from app import models, schemas
from app.database import Base
from app.main import authenticate_user 

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

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

def test_authenticate_user_valid(db_session: Session):
    password = "securepassword"
    hashed_password = pwd_context.hash(password)
    test_user = models.User(
        email="testuser@example.com",
        name="Test User",
        hashed_password=hashed_password,
        is_active=True,
        role="patient"
    )
    db_session.add(test_user)
    db_session.commit()

    authenticated_user = authenticate_user(db_session, test_user.email, password)
    assert authenticated_user is not None
    assert authenticated_user.email == test_user.email

def test_authenticate_user_invalid_password(db_session: Session):
    test_user = db_session.query(models.User).filter_by(email="testuser@example.com").first()
    wrong_password = "wrongpassword"

    authenticated_user = authenticate_user(db_session, test_user.email, wrong_password)
    assert authenticated_user is None

def test_authenticate_user_inactive(db_session: Session):
    password = "inactivepassword"
    hashed_password = pwd_context.hash(password)
    inactive_user = models.User(
        email="inactiveuser@example.com",
        name="Inactive User",
        hashed_password=hashed_password,
        is_active=False,
        role="patient"
    )
    db_session.add(inactive_user)
    db_session.commit()

    authenticated_user = authenticate_user(db_session, inactive_user.email, password)
    assert authenticated_user is None

def test_authenticate_user_nonexistent(db_session: Session):
    authenticated_user = authenticate_user(db_session, "nonexistent@example.com", "nopassword")
    assert authenticated_user is None
