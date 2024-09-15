from enum import Enum
from typing import Optional, List
from pydantic import BaseModel
from datetime import datetime, date


class UserBase(BaseModel):
    """
    Base User Schema
    """

    email: str


class UserCreate(UserBase):
    """
    User Create Schema
    """

    name: str
    dob: date
    sex: str
    occupation: Optional[str] = None
    password: str
    is_therapist: Optional[bool] = False

class UserUpdate(UserBase):
    """
    User Update Schema
    """

    name: Optional[str] = None
    is_active: Optional[str] = None
    has_onboarded: Optional[str] = None

class User(UserBase):
    """
    User Schema
    """

    id: int
    name: str
    dob: Optional[date]
    sex: Optional[str]
    occupation: Optional[str]
    hashed_password: str
    is_active: bool
    has_onboarded: bool
    is_therapist: bool
    therapist_id: Optional[int] = None
    patients: Optional[list["UserWithoutSensitiveData"]] = []

    class Config:
        from_attributes = True


class UserWithoutSensitiveData(UserBase):
    """
    User Schema without sensitive data
    """

    id: int
    name: str
    dob: Optional[date]
    sex: Optional[str]
    occupation: Optional[str]
    is_active: bool
    has_onboarded: bool
    is_therapist: bool
    therapist_id: Optional[int] = None
    patient_data: Optional["PatientData"] = None

    class Config:
        from_attributes = True

class UserWithPatientData(UserBase):
    """
    User Schema with Patient Data
    """

    id: int
    name: str
    dob: Optional[date]
    sex: Optional[str]
    occupation: Optional[str]
    patient_data: Optional["PatientData"] = None

    class Config:
        from_attributes = True

class SocialAccountBase(BaseModel):
    """
    Base Social Account Schema
    """

    provider: str
    provider_user_id: str


class SocialAccountCreate(SocialAccountBase):
    """
    Social Account Create Schema
    """

    access_token: Optional[str] = None
    refresh_token: Optional[str] = None
    expires_at: Optional[datetime] = None


class SocialAccount(SocialAccountBase):
    """
    Social Account Schema
    """

    provider: str
    provider_user_id: str

    class Config:
        from_attributes = True


class TokenData(BaseModel):
    """
    Token Data Schema
    """

    email: str = None
    id: int = None


class Token(BaseModel):
    """
    Token Schema
    """

    access_token: str
    token_type: str
    expires_in: int


class MoodEntryBase(BaseModel):
    """
    Base Mood Entry Schema
    """

    mood: int
    eat: int
    sleep: int
    date: date


class MoodEntryCreate(MoodEntryBase):
    """
    Mood Entry Create Schema
    """
    pass


class MoodEntry(MoodEntryBase):
    """
    Mood Entry Schema
    """

    id: int

    class Config:
        from_attributes = True


class JournalEntryBase(BaseModel):
    """
    Base Journal Entry Schema
    """

    title: str
    body: str
    image: Optional[str] = None
    date: date


class JournalEntryCreate(JournalEntryBase):
    """
    Journal Entry Create Schema
    """
    pass


class JournalEntry(JournalEntryBase):
    """
    Journal Entry Schema
    """

    id: int

    class Config:
        from_attributes = True

class CognitiveDistortion(str, Enum):
    fortune_telling = "Fortune-telling"
    should_statements = "Should statements"
    mind_reading = "Mind Reading"
    catastrophising = "Catastrophising"
    emotional_reasoning = "Emotional Reasoning"
    all_or_nothing_thinking = "All-or-Nothing Thinking"
    black_and_white_thinking = "Black and White Thinking"
    personalisation = "Personalisation"
    discounting_the_positive = "Discounting the Positive"
    labelling = "Labelling"

class GuidedJournalBody(BaseModel):
    step1_text: Optional[str] = None
    step2_selected_distortions: Optional[List[CognitiveDistortion]] = None
    step3_text: Optional[str] = None
    step4_text: Optional[str] = None

class GuidedJournalEntryBase(BaseModel):
    """
    Base Guided Journal Entry Schema
    """

    body: GuidedJournalBody
    date: date


class GuidedJournalEntryCreate(GuidedJournalEntryBase):
    """
    Guided Journal Entry Create Schema
    """
    pass


class GuidedJournalEntry(GuidedJournalEntryBase):
    """
    Guided Journal Entry Schema
    """

    id: int

    class Config:
        from_attributes = True


class PatientDataBase(BaseModel):
    """
    Base Patient Data Schema
    """

    user_id: int


class PatientDataCreate(PatientDataBase):
    """
    Patient Data Create Schema
    """
    pass


class PatientData(PatientDataBase):
    """
    Patient Data Schema
    """

    id: int
    severity: str
    mood_entries: Optional[list["MoodEntry"]] = []
    journal_entries: Optional[list["JournalEntry"]] = []
    guided_journal_entries: Optional[list["GuidedJournalEntry"]] = []

    class Config:
        from_attributes = True