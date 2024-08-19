from typing import Optional
from pydantic import BaseModel
from datetime import datetime


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
    password: str

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
    hashed_password: str
    is_active: bool
    has_onboarded: bool

    class Config:
        from_attributes = True


class UserWithoutSensitiveData(UserBase):
    """
    User Schema without sensitive data
    """

    id: int
    name: str
    is_active: bool
    has_onboarded: bool

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


class MoodEntryCreate(MoodEntryBase):
    """
    Mood Entry Create Schema
    """

    datetime: Optional[datetime] = None  # type: ignore


class MoodEntry(MoodEntryBase):
    """
    Mood Entry Schema
    """

    id: int
    user_id: int
    datetime: datetime

    class Config:
        from_attributes = True


class JournalEntryBase(BaseModel):
    """
    Base Journal Entry Schema
    """

    title: str
    body: str
    image: Optional[str] = None


class JournalEntryCreate(JournalEntryBase):
    """
    Journal Entry Create Schema
    """

    datetime: Optional[datetime] = None  # type: ignore


class JournalEntry(JournalEntryBase):
    """
    Journal Entry Schema
    """

    id: int
    user_id: int
    datetime: datetime

    class Config:
        from_attributes = True
