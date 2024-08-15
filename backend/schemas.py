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
        orm_mode = True

class TokenData(BaseModel):
    """
    Token Data Schema
    """
    email: Optional[str] = None

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
        orm_mode = True

class JournalEntryBase(BaseModel):
    """
    Base Journal Entry Schema
    """
    title: str
    body: str
    image: str

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
        orm_mode = True