import base64
import io
import os
import uuid
from fastapi.staticfiles import StaticFiles
from fastapi import FastAPI, Depends, File, HTTPException, Query, UploadFile, WebSocket, WebSocketDisconnect, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from PIL import Image
from pydantic import ValidationError
from sqlalchemy.orm import Session
from passlib.context import CryptContext
from jose import JWTError, jwt
from datetime import datetime, timedelta, timezone
from typing import Annotated, Dict, Generator, List, Optional
from dotenv import load_dotenv
from fastapi.middleware.cors import CORSMiddleware
import aiohttp

from app.database import SessionLocal
from app import commands, schemas

# Create FastAPI app
async def init_session():
    return aiohttp.ClientSession()

async def startup_event():
    app.state.session = await init_session()

async def shutdown_event():
    await app.state.session.close()

app = FastAPI(on_startup=[startup_event], on_shutdown=[shutdown_event])
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "*",
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

# Google token
GOOGLE_TOKEN_INFO_URL = "https://www.googleapis.com/oauth2/v1/userinfo?alt=json&access_token="

# Create a directory to store uploaded images
UPLOAD_DIRECTORY = "images"
if not os.path.exists(UPLOAD_DIRECTORY):
    os.makedirs(UPLOAD_DIRECTORY)

# Serve the uploaded images
app.mount("/images", StaticFiles(directory=UPLOAD_DIRECTORY), name="uploaded_images")

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


async def verify_google_token(token: str) -> dict:
    """
    Verify a Google token
    :param token (str): Google token
    :return (dict): Token info
    :raises (HTTPException): If token is invalid
    """
    response = await app.state.session.get(f"{GOOGLE_TOKEN_INFO_URL}{token}")
    if response.status != 200:
        raise HTTPException(status_code=401, detail="Invalid Google Token")
    return await response.json()


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

    return schemas.Token(
        access_token=access_token,
        token_type="bearer",
        expires_in=ACCESS_TOKEN_EXPIRE_MINUTES,
    )

@app.post("/signin/google", response_model=schemas.Token)
async def google_signin(
    token: str = Query(..., description="Google OAuth token"),
    db: Session = Depends(get_db),
):
    """
    Google sign-in endpoint
    :param token (str): Google OAuth token
    :param db (Session): Database session
    :return (schemas.Token): JWT or session token
    """

    google_data = await verify_google_token(token)  
    user_email = google_data.get("email")
    user_name = google_data.get("name")

    # create user if doesn't exist
    user = commands.get_user_by_email(db, user_email)
    if not user:
        user = commands.create_google_user(
            db, 
            user=schemas.UserCreateGoogle(
                email=user_email,
                name=user_name,
                image = "/images/user.jpg",
                role=schemas.UserRole.patient,
            )
        )  

    # Generate JWT
    access_token = jwt.encode(
        {
            "sub": user.email, 
            "id": user.id, 
            "exp": datetime.now(timezone.utc) 
            + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
        },
        SECRET_KEY,
        algorithm=ALGORITHM,
    )
    return schemas.Token(access_token=access_token, token_type="bearer", expires_in=ACCESS_TOKEN_EXPIRE_MINUTES)


@app.get("/users/check-email")
def get_email_exists(
    email: str = Query(..., title="Email", description="The email address to check"),
    db: Session = Depends(get_db),
):
    """
    Check if the provided email is already registered.

    :param email: The email address to check
    :param db: Database session
    :return: A message indicating whether the email exists or not, False or True
    """
    existing_user = commands.get_user_by_email(db, email)
    if existing_user is not None:
        return {"detail": "True"}
    return {"detail": "False"}


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

    user.image = "/images/user.jpg"

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


@app.get("/journals/id/{journal_id}", response_model=Optional[schemas.JournalEntry])
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


@app.get("/mood/id/{mood_id}", response_model=Optional[schemas.MoodEntry])
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


@app.get(
    "/guided-journals/id/{guided_journal_id}",
    response_model=Optional[schemas.GuidedJournalEntry],
)
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


@app.get(
    "/guided-journals/date/{date}", response_model=Optional[schemas.GuidedJournalEntry]
)
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
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid date format. Use YYYY-MM-DD.",
        )

    return commands.get_guided_journal_entry_by_date(db, parsed_date, current_user)


@app.get("/journals/date/{date}", response_model=Optional[schemas.JournalEntry])
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
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid date format. Use YYYY-MM-DD.",
        )

    return commands.get_journal_entry_by_date(db, parsed_date, current_user)


@app.get("/mood/date/{date}", response_model=Optional[schemas.MoodEntry])
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
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid date format. Use YYYY-MM-DD.",
        )

    return commands.get_mood_entry_by_date(db, parsed_date, current_user)


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


@app.get("/mood/date-range", response_model=List[schemas.MoodEntry])
def get_mood_entries_by_date_range(
    current_user: Annotated[schemas.User, Depends(get_current_user)],
    start_date: str = Query(..., description="Start date in YYYY-MM-DD format"),
    end_date: str = Query(..., description="End date in YYYY-MM-DD format"),
    db: Session = Depends(get_db),
):
    """
    Get mood entries by date range
    :param current_user (schemas.User): Current user
    :param start_date (date): Start date
    :param end_date (date): End date
    :param db (Session): Database session
    :return (List[schemas.MoodEntry]): Mood entries within the date range
    :raises (HTTPException): If date range is invalid
    """
    try:
        start_date = datetime.fromisoformat(start_date).date()
        end_date = datetime.fromisoformat(end_date).date()
        if start_date > end_date:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Start date must be before end date",
            )
    except:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid date format. Use YYYY-MM-DD.",
        )

    return commands.get_mood_entries_by_date_range(
        db, current_user, start_date, end_date
    )


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

    """
    Create a new journal entry
    :param journal_entry (schemas.JournalEntryCreate): Journal entry data
    :param current_user (schemas.User): Current user
    :param db (Session): Database session
    :return (schemas.JournalEntry): Created journal entry
    """
    try:
        if journal_entry.image:
            # Decode the base64 string to bytes
            try:
                image_data = base64.b64decode(journal_entry.image)
            except Exception as e:
                raise HTTPException(status_code=400, detail="Invalid image data")
            
            with Image.open(io.BytesIO(image_data)) as image:
                if image.mode == 'RGBA':
                    if image.mode in ('RGBA', 'LA') or (image.mode == 'P' and 'transparency' in image.info):
                        # Need to convert to RGBA if LA format due to a bug in PIL
                        alpha = image.convert('RGBA').split()[-1]
                        bg = Image.new("RGBA", image.size, (255, 255, 255) + (255,))
                        bg.paste(image, mask=alpha)
                        image = bg.convert('RGB')
                    else:
                        image = image.convert('RGB')
                
                # Generate a unique filename
                filename = f"{current_user.id}-{journal_entry.date.isoformat()}-{uuid.uuid4()}.jpg"
                file_path = os.path.join(UPLOAD_DIRECTORY, filename)
                
                # Save the new image as JPEG
                image.save(file_path, "JPEG", optimize=True, quality=85)
            
            # Update the journal entry with the new image URL
            journal_entry.image = f"/images/{filename}"

        # Create the journal entry in the database
        return commands.upsert_journal_entry(db, journal_entry, current_user)
    
    except Exception as e:
        # Log the error
        print(f"Error processing journal entry: {str(e)}")
        raise HTTPException(status_code=500, detail="Error processing journal entry")


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

@app.get("/users/stats")
def get_stats(
    current_user: Annotated[schemas.User, Depends(get_current_user)],
    db: Session = Depends(get_db),
):
    """
    Get user stats
    :param current_user (schemas.User): Current user
    :param db (Session): Database session
    :return (dict): User stats
    """

    journal_count = commands.count_journal_entries_by_user(db, current_user)
    guided_journal_count = commands.count_guided_journal_entries_by_user(db, current_user)
    stats = commands.get_user_by_id(db, current_user.id)
    return {
        "journal_count": journal_count,
        "guided_journal_count": guided_journal_count,
        "streak": stats.streak,
        "last_login": stats.last_login if stats.last_login else "",
    }

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

    if user.image:
        # Decode the base64 string to bytes
        try:
            image_data = base64.b64decode(user.image)
        except Exception as e:
            raise HTTPException(status_code=400, detail="Invalid image data")
        
        with Image.open(io.BytesIO(image_data)) as image:
            if image.mode == 'RGBA':
                if image.mode in ('RGBA', 'LA') or (image.mode == 'P' and 'transparency' in image.info):
                    # Need to convert to RGBA if LA format due to a bug in PIL
                    alpha = image.convert('RGBA').split()[-1]
                    bg = Image.new("RGBA", image.size, (255, 255, 255) + (255,))
                    bg.paste(image, mask=alpha)
                    image = bg.convert('RGB')
                else:
                    image = image.convert('RGB')
            
            # Generate a unique filename
            filename = f"{current_user.id}-icon-{uuid.uuid4()}.jpg"
            file_path = os.path.join(UPLOAD_DIRECTORY, filename)
            
            # Save the new image as JPEG
            image.save(file_path, "JPEG", optimize=True, quality=85)
        
        # Update the user with the new image URL
        user.image = f"/images/{filename}"

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


@app.post("/assign-therapist/{therapist_id}")
def assign_therapist(
    therapist_id: int,
    current_user: Annotated[schemas.User, Depends(get_current_user)],
    db: Session = Depends(get_db),
):
    """
    Assign a therapist to a user
    :param therapist_id (int): Therapist ID
    :param current_user (schemas.User): Current user
    :param db (Session): Database session
    :return (dict): Success message
    :raises (HTTPException): If current user is a therapist
    """
    _therapist = commands.get_user_by_id(db, therapist_id)
    if _therapist is None or _therapist.role != "therapist":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Given ID is not a therapist ID",
        )

    if current_user.role == "therapist":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Therapists cannot have therapists",
        )

    commands.assign_therapist_to_patient(db, current_user, therapist_id)
    return {"detail": "Therapist assigned"}


@app.delete("/unassign-therapist")
def unassign_therapist(
    current_user: Annotated[schemas.User, Depends(get_current_user)],
    db: Session = Depends(get_db),
):
    """
    Unassign a therapist from a user
    :param current_user (schemas.User): Current user
    :param db (Session): Database session
    :return (dict): Success message
    :raises (HTTPException): If current user is not assigned a therapist
    """
    if current_user.role == "therapist":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Therapists cannot have therapists",
        )

    commands.remove_therapist_from_patient(db, current_user)
    return {"detail": "Therapist unassigned"}


@app.get("/therapist", response_model=Optional[schemas.UserWithoutSensitiveData])
def get_therapist(
    current_user: Annotated[schemas.User, Depends(get_current_user)],
    db: Session = Depends(get_db),
):
    """
    Get therapist assigned to a user
    :param current_user (schemas.User): Current user
    :param db (Session): Database session
    :return (schemas.UserWithoutSensitiveData): Therapist
    """
    if current_user.role == "therapist":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Therapists cannot have therapists",
        )

    return commands.get_therapist_by_patient(db, current_user)


@app.get("/patients", response_model=List[schemas.UserWithPatientData])
def get_patients(
    current_user: Annotated[schemas.User, Depends(get_current_user)],
    db: Session = Depends(get_db),
):
    """
    Get patients assigned to a therapist
    :param current_user (schemas.User): Current user
    :param db (Session): Database session
    :return (List[schemas.UserWithPatientData]): Patients
    """
    return commands.get_patients_by_therapist(db, current_user)


@app.get("/patient-data/{patient_id}", response_model=schemas.UserWithPatientData)
def get_patient_data(
    patient_id: int,
    db: Session = Depends(get_db),
):
    """
    Get patient data
    :param patient_id (int): Patient ID
    :param db (Session): Database session
    :return (schemas.UserWithPatientData): Patient data
    """
    return commands.get_user_by_id(db, patient_id)


@app.patch("/patient-data", response_model=schemas.PatientData)
def update_severity(
    patient_data: schemas.PatientDataUpdate,
    db: Session = Depends(get_db),
):
    """
    Update patient data
    :param patient_id (int): Patient ID
    :param patient_data (schemas.PatientDataUpdate): Updated patient data
    :param db (Session): Database session
    :return (dict): Success message
    """
    return commands.update_patient_data(db, patient_data)

@app.get("/therapists", response_model=List[schemas.UserWithoutSensitiveData])
def get_therapists(
    db: Session = Depends(get_db),
):
    """
    Get all therapists
    :param db (Session): Database session
    :return (List[schemas.UserWithoutSensitiveData]): Therapists
    """
    return commands.get_therapists(db)


@app.get("/therapist-data/{therapist_id}", response_model=schemas.UserWithTherapistData)
def get_therapist_data(
    therapist_id: int,
    db: Session = Depends(get_db),
):
    """
    Get therapist data
    :param therapist_id (int): Therapist ID
    :param db (Session): Database session
    :return (schemas.UserWithTherapistData): Therapist data
    """
    return commands.get_therapist_by_id(db, therapist_id)


@app.patch("/therapist-data", response_model=schemas.TherapistData)
def update_therapist_data(
    therapist_data: schemas.TherapistDataCreate,
    db: Session = Depends(get_db),
):
    """
    Update therapist data
    :param therapist_data (schemas.TherapistDataUpdate): Updated therapist data
    :param db (Session): Database session
    :return (dict): Success message
    """
    return commands.update_therapist_data(db, therapist_data)
    

# WebSocket connection manager
class ConnectionManager:
    def __init__(self):
        self.active_connections: Dict[int, WebSocket] = {}

    async def connect(self, websocket: WebSocket, user_id: int):
        await websocket.accept()
        self.active_connections[user_id] = websocket

    def disconnect(self, user_id: int):
        if user_id in self.active_connections:
            del self.active_connections[user_id]

    async def send_personal_message(self, message: str, user_id: int):
        if user_id in self.active_connections:
            await self.active_connections[user_id].send_json(message)
            return True
        return False

manager = ConnectionManager()

async def get_current_user_ws(
    websocket: WebSocket,
    token: Optional[str] = Query(None),
    db: Session = Depends(get_db)
) -> schemas.User:
    """
    :param websocket (WebSocket): WebSocket connection
    :param token (Optional[str]): JWT
    :param db (Session): Database session
    :return (schemas.User): Current user
    """
    if token is None:
        await websocket.close(code=1008)
        return None

    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_email: str = payload.get("sub")
        if user_email is None:
            await websocket.close(code=1008)
            return None
    except JWTError:
        await websocket.close(code=1008)
        return None

    user = commands.get_user_by_email(db, user_email)
    if user is None:
        await websocket.close(code=1008)
        return None

    return user

@app.websocket("/ws/chat")
async def websocket_endpoint(
    websocket: WebSocket,
    db: Session = Depends(get_db),
    current_user: schemas.User = Depends(get_current_user_ws)
):
    """
    :param websocket (WebSocket): WebSocket connection
    :param db (Session): Database session
    :param current_user (schemas.User): Current user
    """
    if not current_user:
        return

    await manager.connect(websocket, current_user.id)

    try:
        if current_user.role == "patient":
            while True:
                data = await websocket.receive_json()
                print(data, current_user.patient_data.therapist_user_id)
                if current_user.patient_data.therapist_user_id != data["recipient_id"]:
                    continue
                await process_message(db, current_user, data["content"], data["recipient_id"])
        elif current_user.role == "therapist":
            patients = [patient.id for patient in commands.get_patients_by_therapist(db, current_user)]
            while True:
                data = await websocket.receive_json()
                print(data, patients)
                if data["recipient_id"] not in patients:
                    continue
                await process_message(db, current_user, data["content"], data["recipient_id"])
    except WebSocketDisconnect:
        manager.disconnect(current_user.id)

async def process_message(db: Session, sender: schemas.User, message_data: str, recipient_id: int):
    """
    send a message to a recipient
    :param db (Session): Database session
    :param sender (schemas.User): Sender
    :param message_data (str): Message content
    :param recipient_id (int): Recipient ID
    """
    message_create = schemas.ChatMessageCreate(
        content=message_data,
        recipient_id=recipient_id,
        sender_id=sender.id
    )
    
    chat_message = commands.insert_chat_message(db, message_create)
    chat_message_schema = schemas.ChatMessage.model_validate(chat_message)
    converted = chat_message_schema.model_dump()
    converted["timestamp"] = chat_message_schema.timestamp.isoformat()

    await manager.send_personal_message(converted, recipient_id)
    await manager.send_personal_message(converted, sender.id)

@app.get("/chat/messages/{other_user_id}", response_model=List[schemas.ChatMessage])
async def get_chat_messages(
    other_user_id: int,
    skip: int = 0,
    limit: int = 100,
    current_user: schemas.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get chat messages
    :param other_user_id (int): Other user ID
    :param skip (int): Number of entries to skip
    :param limit (int): Number of entries to return
    :param current_user (schemas.User): Current user
    :param db (Session): Database session
    :return (List[schemas.ChatMessage]): Chat messages
    """
    return commands.get_chat_messages(db, current_user, other_user_id, skip, limit)

@app.get("/batch")
async def update_depression_risk(
    token: str = Query(..., description="Authentication token"),
    db: Session = Depends(get_db)
):
    """
    Update depression risk for all patients
    :param db (Session): Database session
    """

    if token != os.getenv("BATCH_TOKEN"):
        raise HTTPException(status_code=403, detail="Unauthorized")

    patients = commands.get_all_patients_with_entries(db)
    details = {}
    for patient in patients:
        model_endpoint = os.getenv("MODEL_ENDPOINT")
        inputs = []
        for journal in patient.patient_data.journal_entries:
            inputs.append(
                {
                    "text": journal.title + "\n" + journal.body, 
                    "timestamp": journal.date.isoformat(), 
                    "image": os.getenv("BACKEND_ENDPOINT") + journal.image if journal.image else None,
                }
            )
        
        response: aiohttp.ClientResponse = await app.state.session.post(model_endpoint, json={"data": inputs})

        if response.status == 200:
            output = await response.json()
            print(output)
            prob = output["probas"][0]
            depression_risk_log = schemas.DepressionRiskLogCreate(
                value=prob,
                date=datetime.now().date(),
                user_id=patient.id
            )
            risk = "None"
            if prob >= 0.8:
                risk = "Severe",
            elif prob >= 0.6:
                risk = "Moderately Severe",
            elif prob >= 0.4: 
                risk = "Moderate",
            elif prob >= 0.2:
                risk = "Mild"
            else:
                risk = "None"
            print(risk)
            commands.upsert_depression_risk_log(db, depression_risk_log)
            commands.update_patient_data(db, schemas.PatientDataUpdate(
                user_id=patient.id,
                severity=risk
            ))
            details[patient.id] = {
                "risk": prob,
                "severity": risk
            }

    return {"detail": "Depression risk updated", "details": details}

@app.get("/user/depression-risks/{user_id}", response_model=List[schemas.DepressionRiskLog])
async def get_depression_risks(
    user_id: int,
    current_user: schemas.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get depression risks for a user
    :param current_user (schemas.User): Current user
    :param db (Session): Database session
    :return (List[schemas.DepressionRiskLog]): Depression risks
    """

    # make sure it is a therapist and the user is their patient
    
    if current_user.role != "therapist":
        raise HTTPException(status_code=403, detail="Unauthorized")
    patients = [patient.id for patient in commands.get_patients_by_therapist(db, current_user)]
    print(patients)
    if user_id not in patients:
        raise HTTPException(status_code=403, detail="Unauthorized")
    
    return commands.get_depression_risk_logs_by_user(db, user_id)

@app.get("/user/depression-risk/{user_id}", response_model=schemas.DepressionRiskLog)
async def get_depression_risk(
    user_id: int,
    current_user: schemas.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get latest depression risk for a user
    :param current_user (schemas.User): Current user
    :param db (Session): Database session
    :return (DepressionRiskLog): Depression risk
    """

    # make sure it is a therapist and the user is their patient
    if current_user.role != "therapist":
        raise HTTPException(status_code=403, detail="Unauthorized")
    patients = [patient.id for patient in commands.get_patients_by_therapist(db, current_user)]
    if user_id not in patients:
        raise HTTPException(status_code=403, detail="Unauthorized")
    
    res = commands.get_latest_depression_risk_log_by_user(db, user_id)
    if res is None:
        raise HTTPException(status_code=404, detail="No depression risk found")
    return res
