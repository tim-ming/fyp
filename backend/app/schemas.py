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

class User(UserBase):
    """
    User Schema
    """
    id: int
    name: str
    hashed_password: str
    is_active: bool

    class Config:
        from_attributes = True

class UserWithoutSensitiveData(UserBase):
    """
    User Schema without sensitive data
    """
    id: int
    name: str
    is_active: bool

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

class MoodEntryBase(BaseModel):
    """
    Base Mood Entry Schema
    """
    mood: int

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
    pass

class JournalEntry(JournalEntryBase):
    """
    Journal Entry Schema
    """
    id: int
    user_id: int
    datetime: datetime

    class Config:
        from_attributes = True