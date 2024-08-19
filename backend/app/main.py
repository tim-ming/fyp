import os
from fastapi import FastAPI, Depends, HTTPException, Query, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm

from pydantic import ValidationError
from sqlalchemy.orm import Session
from passlib.context import CryptContext
from jose import JWTError, jwt
from datetime import datetime, timedelta, timezone
from typing import Annotated, Generator, List, Optional
from dotenv import load_dotenv
from fastapi.middleware.cors import CORSMiddleware

from app.database import SessionLocal, engine
from app import commands, models, schemas

# Create database tables if they don't exist
# Should use Alembic for migrations instead but this is fine for now
models.Base.metadata.create_all(bind=engine)

# Create FastAPI app
app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost",
        "http://localhost:8081",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load environment variables
load_dotenv()

# Configure JWT / security settings
SECRET_KEY = os.getenv("TOKEN_SECRET_KEY")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24 * 30  # 30 days
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")


def get_db() -> Generator[Session, None, None]:
    """
    Get a database session
    :return (Generator[Session, None, None]): Database session
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def authenticate_user(db: Session, email: str, password: str) -> Optional[schemas.User]:
    """
    Authenticate a user
    :param email (str): Email
    :param password (str): Password
    :param db (Session): Database session
    :return (Optional[schemas.User]): User if succesfully authenticated, None if not authenticated
    """
    user = commands.get_user_by_email(db, email)
    return (
        user
        if user is not None
        and user.is_active
        and pwd_context.verify(password, user.hashed_password)
        else None
    )


def get_current_user(
    token: Annotated[str, Depends(oauth2_scheme)], db: Session = Depends(get_db)
) -> schemas.User:
    """
    Get the current user
    :param token (str): JWT
    :param db (Session): Database session
    :return (schemas.User): Current user
    :raises (HTTPException): If credentials are invalid
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )

    # Decode token and extract the email
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_email: Optional[str] = payload.get("sub")
        user_id: Optional[int] = (
            int(payload.get("id")) if payload.get("id") is not None else None
        )
        token_data = schemas.TokenData(email=user_email, id=user_id)
    except JWTError or ValidationError:
        raise credentials_exception

    # Get user by email
    user = commands.get_user_by_email(db, token_data.email)
    if user is None or not user.is_active:
        raise credentials_exception
    return user


@app.post("/signin", response_model=schemas.Token)
def post_signin(
    form_data: Annotated[OAuth2PasswordRequestForm, Depends()],
    db: Session = Depends(get_db),
):
    """
    Login route to generate a JWT
    :param form_data (OAuth2PasswordRequestForm): Form containing username (email) and password
    :param db (Session): Database session
    :return (schemas.Token): JWT
    :raises (HTTPException): If credentials are invalid
    """

    # Authenticate user
    user = authenticate_user(db, form_data.username, form_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # Generate JWT
    access_token = jwt.encode(
        {
            "sub": user.email,
            "id": user.id,
            "exp": datetime.now(timezone.utc)
            + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES),
        },
        SECRET_KEY,
        algorithm=ALGORITHM,
    )

    return schemas.Token(access_token=access_token, token_type="bearer", expires_in=ACCESS_TOKEN_EXPIRE_MINUTES)


@app.post("/signup")
def post_signup(user: schemas.UserCreate, db: Session = Depends(get_db)):
    """
    Register a new user
    :param user (schemas.UserCreate): Initial user data
    :param db (Session): Database session
    :return (schemas.User): Created user
    :raises (HTTPException): If user with such email already exists
    """
    _user = commands.get_user_by_email(db, user.email)
    if _user is not None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="Email already registered"
        )

    # Hash password
    user.password = pwd_context.hash(user.password)
    commands.create_user(db, user)

    return {"detail": "User created successfully"}


@app.get("/users/me", response_model=schemas.UserWithoutSensitiveData)
def get_profile(current_user: Annotated[schemas.User, Depends(get_current_user)]):
    """
    Get current user profile
    :param current_user (schemas.User): Current user
    :return (schemas.UserWithoutSensitiveData): Current user profile without sensitive data
    """
    return current_user


@app.post("/mood", response_model=schemas.MoodEntry)
def post_mood_entry(
    mood_entry: schemas.MoodEntryCreate,
    current_user: Annotated[schemas.User, Depends(get_current_user)],
    db: Session = Depends(get_db),
):
    """
    Create a new mood entry
    :param mood_entry (schemas.MoodEntryCreate): Mood entry data
    :param current_user (schemas.User): Current user
    :param db (Session): Database session
    :return (schemas.MoodEntry): Created mood entry
    """
    return commands.upsert_mood_entry(db, mood_entry, current_user)


@app.get("/mood", response_model=List[schemas.MoodEntry])
def get_mood_entries(
    current_user: Annotated[schemas.User, Depends(get_current_user)],
    skip: int = Query(default=0, ge=0, description="Number of entries to skip"),
    limit: int = Query(
        default=100, ge=1, le=1000, description="Number of entries to return"
    ),
    db: Session = Depends(get_db),
):
    """
    Get mood entries
    :param current_user (schemas.User): Current user
    :param skip (int): Number of entries to skip
    :param limit (int): Number of entries to return
    :param db (Session): Database session
    :return (List[schemas.MoodEntry]): Mood entries
    :raises (HTTPException): If skip or limit values are invalid
    """
    if skip < 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Skip value must be non-negative",
        )
    if limit < 1 or limit > 1000:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Limit must be between 1 and 1000",
        )

    return commands.get_mood_entries_by_user(db, current_user, skip, limit)


@app.get("/mood/id/{mood_id}", response_model=schemas.MoodEntry)
def get_mood_entry(
    mood_id: int,
    current_user: Annotated[schemas.User, Depends(get_current_user)],
    db: Session = Depends(get_db),
):
    """
    Get a mood entry by ID
    :param mood_id (int): Mood entry ID
    :param current_user (schemas.User): Current user
    :param db (Session): Database session
    :return (schemas.MoodEntry): Mood entry
    """
    return commands.get_mood_entry_by_id(db, mood_id, current_user)


@app.post("/journals", response_model=schemas.JournalEntry)
def post_journal_entry(
    journal_entry: schemas.JournalEntryCreate,
    current_user: Annotated[schemas.User, Depends(get_current_user)],
    db: Session = Depends(get_db),
):
    """
    Create a new journal entry
    :param journal_entry (schemas.JournalEntryCreate): Journal entry data
    :param current_user (schemas.User): Current user
    :param db (Session): Database session
    :return (schemas.JournalEntry): Created journal entry
    """
    return commands.upsert_journal_entry(db, journal_entry, current_user)


@app.get("/journals", response_model=List[schemas.JournalEntry])
def get_journal_entries(
    current_user: Annotated[schemas.User, Depends(get_current_user)],
    skip: int = Query(default=0, ge=0, description="Number of entries to skip"),
    limit: int = Query(
        default=100, ge=1, le=1000, description="Number of entries to return"
    ),
    db: Session = Depends(get_db),
):
    """
    Get journal entries
    :param current_user (schemas.User): Current user
    :param skip (int): Number of entries to skip
    :param limit (int): Number of entries to return
    :param db (Session): Database session
    :return (List[schemas.JournalEntry]): Journal entries
    :raises (HTTPException): If skip or limit values are invalid
    """
    if skip < 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Skip value must be non-negative",
        )
    if limit < 1 or limit > 1000:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Limit must be between 1 and 1000",
        )

    return commands.get_journal_entries_by_user(db, current_user, skip, limit)


@app.get("/journals/id/{journal_id}", response_model=schemas.JournalEntry)
def get_journal_entry(
    journal_id: int,
    current_user: Annotated[schemas.User, Depends(get_current_user)],
    db: Session = Depends(get_db),
):
    """
    Get a journal entry by ID
    :param journal_id (int): Journal entry ID
    :param current_user (schemas.User): Current user
    :param db (Session): Database session
    :return (schemas.JournalEntry): Journal entry
    """
    return commands.get_journal_entry_by_id(db, journal_id, current_user)


@app.post("/social-accounts", response_model=List[schemas.SocialAccount])
def post_social_accounts(
    social_accounts: List[schemas.SocialAccountCreate],
    current_user: Annotated[schemas.User, Depends(get_current_user)],
    db: Session = Depends(get_db),
):
    """
    Create social accounts
    :param social_accounts (List[schemas.SocialAccountCreate]): Social account data
    :param current_user (schemas.User): Current user
    :param db (Session): Database session
    :return (List[schemas.SocialAccount]): Created social accounts
    """
    
    return commands.create_social_accounts(db, social_accounts, current_user)

@app.patch("/users/me", response_model=schemas.UserWithoutSensitiveData)
def patch_user(
    user: schemas.UserUpdate,
    current_user: Annotated[schemas.User, Depends(get_current_user)],
    db: Session = Depends(get_db),
):
    """
    Update user profile
    :param user (schemas.UserUpdate): Updated user data
    :param current_user (schemas.User): Current user
    :param db (Session): Database session
    :return (schemas.UserWithoutSensitiveData): Updated user profile
    """
    return commands.update_user(db, user, current_user)

@app.post("/guided-journals", response_model=schemas.GuidedJournalEntry)
def post_guided_journal_entry(
    guided_journal_entry: schemas.GuidedJournalEntryCreate,
    current_user: Annotated[schemas.User, Depends(get_current_user)],
    db: Session = Depends(get_db),
):
    """
    Create a new guided journal entry
    :param guided_journal_entry (schemas.GuidedJournalEntryCreate): Guided journal entry data
    :param current_user (schemas.User): Current user
    :param db (Session): Database session
    :return (schemas.GuidedJournalEntry): Created guided journal entry
    """
    return commands.upsert_guided_journal_entry(db, guided_journal_entry, current_user)

@app.get("/guided-journals", response_model=List[schemas.GuidedJournalEntry])
def get_guided_journal_entries(
    current_user: Annotated[schemas.User, Depends(get_current_user)],
    skip: int = Query(default=0, ge=0, description="Number of entries to skip"),
    limit: int = Query(
        default=100, ge=1, le=1000, description="Number of entries to return"
    ),
    db: Session = Depends(get_db),
):
    """
    Get guided journal entries
    :param current_user (schemas.User): Current user
    :param skip (int): Number of entries to skip
    :param limit (int): Number of entries to return
    :param db (Session): Database session
    :return (List[schemas.GuidedJournalEntry]): Guided journal entries
    :raises (HTTPException): If skip or limit values are invalid
    """
    if skip < 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Skip value must be non-negative",
        )
    if limit < 1 or limit > 1000:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Limit must be between 1 and 1000",
        )

    return commands.get_guided_journal_entries_by_user(db, current_user, skip, limit)

@app.get("/guided-journals/id/{guided_journal_id}", response_model=schemas.GuidedJournalEntry)
def get_guided_journal_entry(
    guided_journal_id: int,
    current_user: Annotated[schemas.User, Depends(get_current_user)],
    db: Session = Depends(get_db),
):
    """
    Get a guided journal entry by ID
    :param guided_journal_id (int): Guided journal entry ID
    :param current_user (schemas.User): Current user
    :param db (Session): Database session
    :return (schemas.GuidedJournalEntry): Guided journal entry
    """
    return commands.get_guided_journal_entry_by_id(db, guided_journal_id, current_user)

@app.get("/guided-journals/date/{date}", response_model=schemas.GuidedJournalEntry)
def get_guided_journal_entries_by_date(
    date: str,
    current_user: Annotated[schemas.User, Depends(get_current_user)],
    db: Session = Depends(get_db),
):
    """
    Get guided journal entries by date
    :param date (str): Date
    :param current_user (schemas.User): Current user
    :param db (Session): Database session
    :return (List[schemas.GuidedJournalEntry]): Guided journal entries
    """
        
    try:
        parsed_date = datetime.fromisoformat(date).date()
    except ValueError:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid date format. Use YYYY-MM-DD.")
    
    return commands.get_guided_journal_entries_by_date(db, parsed_date, current_user)

@app.get("journals/date/{date}", response_model=schemas.JournalEntry)
def get_journal_entries_by_date(
    date: str,
    current_user: Annotated[schemas.User, Depends(get_current_user)],
    db: Session = Depends(get_db),
):
    """
    Get journal entries by date
    :param date (str): str
    :param current_user (schemas.User): Current user
    :param db (Session): Database session
    :return (List[schemas.JournalEntry]): Journal entries
    """

    try:
        parsed_date = datetime.fromisoformat(date).date()
    except ValueError:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid date format. Use YYYY-MM-DD.")
    
    return commands.get_journal_entries_by_date(db, parsed_date, current_user)

@app.get("/mood/date/{date}", response_model=schemas.MoodEntry)
def get_mood_entries_by_date(
    date: str,
    current_user: Annotated[schemas.User, Depends(get_current_user)],
    db: Session = Depends(get_db),
):
    """
    Get mood entries by date
    :param date (str): Date
    :param current_user (schemas.User): Current user
    :param db (Session): Database session
    :return (List[schemas.MoodEntry]): Mood entries
    """
    
    try:
        parsed_date = datetime.fromisoformat(date).date()
    except ValueError:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid date format. Use YYYY-MM-DD.")
    
    return commands.get_mood_entries_by_date(db, parsed_date, current_user)