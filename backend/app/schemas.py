from enum import Enum
from typing import Optional, List
from pydantic import BaseModel
from datetime import datetime, date


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


class UserRole(str, Enum):
    patient = "patient"
    therapist = "therapist"


class UserBase(BaseModel):
    """
    Base User Schema
    """

    email: str

class UserCreateBase(UserBase):
    """
    Common User Create Schema fields for both normal and Google sign-up.
    """

    name: str
    dob: Optional[date] = None
    sex: Optional[str] = None
    occupation: Optional[str] = None
    role: Optional[UserRole] = UserRole.patient


class UserCreate(UserCreateBase):
    """
    User Create Schema for normal sign-up, requiring a password.
    """

    password: str


class UserCreateGoogle(UserCreateBase):
    """
    User Create Schema for Google sign-up, not requiring a password.
    """

    pass


class UserUpdate(UserBase):
    """
    User Update Schema
    """

    name: Optional[str] = None
    is_active: Optional[str] = None

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
    role: UserRole
    patient_data: Optional["PatientData"] = None
    therapist_data: Optional["TherapistData"] = None

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
    role: UserRole

    class Config:
        from_attributes = True

class UserWithPatientData(UserWithoutSensitiveData):
    """
    User Schema with Patient Data
    """

    patient_data: Optional["PatientData"] = None

    class Config:
        from_attributes = True

class UserWithTherapistData(UserWithoutSensitiveData):
    """
    User Schema with Therapist Data
    """

    therapist_data: Optional["TherapistData"] = None

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

class PatientDataUpdate(PatientDataBase):
    """
    Patient Data Update Schema
    """
    has_onboarded: Optional[bool] = None
    severity: Optional[str] = None

class PatientData(PatientDataBase):
    """
    Patient Data Schema
    """

    id: int
    has_onboarded: bool
    severity: str
    mood_entries: Optional[list["MoodEntry"]] = []
    journal_entries: Optional[list["JournalEntry"]] = []
    guided_journal_entries: Optional[list["GuidedJournalEntry"]] = []

    class Config:
        from_attributes = True


class TherapistDataBase(BaseModel):
    """
    Base Therapist Data Schema
    """

    user_id: int


class TherapistDataCreate(TherapistDataBase):
    """
    Therapist Data Create Schema
    """
    qualifications: Optional[str] = None
    expertise: Optional[str] = None
    bio: Optional[str] = None
    treatment_approach: Optional[str] = None


class TherapistData(TherapistDataBase):
    """
    Therapist Data Schema
    """

    id: int
    qualifications: Optional[str] = None
    expertise: Optional[str] = None
    bio: Optional[str] = None
    treatment_approach: Optional[str] = None
    patients: Optional[list["PatientData"]] = []

    class Config:
        from_attributes = True