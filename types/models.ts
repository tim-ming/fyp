// Base User Schema
export interface UserBase {
  email: string;
}

// User Create Schema
export interface UserCreate extends UserBase {
  name: string;
  password: string;
  is_therapist?: boolean; // Optional with a default value of false
}

// User Update Schema
export interface UserUpdate extends UserBase {
  name?: string;
  is_active?: boolean;
  has_onboarded?: boolean;
}

// User Schema
export interface User extends UserBase {
  id: number;
  name: string;
  hashed_password: string;
  is_active: boolean;
  has_onboarded: boolean;
  is_therapist: boolean;
  therapist_id?: number | null;
  patients?: UserWithoutSensitiveData[]; // Optional array of users without sensitive data
}

// User Schema without sensitive data
export interface UserWithoutSensitiveData extends UserBase {
  id: number;
  name: string;
  is_active: boolean;
  has_onboarded: boolean;
  is_therapist: boolean;
  therapist_id?: number | null;
  patient_data?: PatientData;
}

// Base Social Account Schema
export interface SocialAccountBase {
  provider: string;
  provider_user_id: string;
}

// Social Account Create Schema
export interface SocialAccountCreate extends SocialAccountBase {
  access_token?: string | null;
  refresh_token?: string | null;
  expires_at?: Date | null;
}

// Social Account Schema
export interface SocialAccount extends SocialAccountBase {
  provider: string;
  provider_user_id: string;
}

// Token Data Schema
export interface TokenData {
  email?: string | null;
  id?: number | null;
}

// Token Schema
export interface Token {
  access_token: string;
  token_type: string;
  expires_in: number;
}

// Base Mood Entry Schema
export interface MoodEntryBase {
  mood: number;
  date: Date;
}

// Mood Entry Create Schema
export interface MoodEntryCreate extends MoodEntryBase {}

// Mood Entry Schema
export interface MoodEntry extends MoodEntryBase {
  id: number;
}

// Base Journal Entry Schema
export interface JournalEntryBase {
  title: string;
  body: string;
  image?: string | null;
  date: Date;
}

// Journal Entry Create Schema
export interface JournalEntryCreate extends JournalEntryBase {}

// Journal Entry Schema
export interface JournalEntry extends JournalEntryBase {
  id: number;
}

// Base Guided Journal Entry Schema
export interface GuidedJournalEntryBase {
  body: string;
  date: Date;
}

// Guided Journal Entry Create Schema
export interface GuidedJournalEntryCreate extends GuidedJournalEntryBase {}

// Guided Journal Entry Schema
export interface GuidedJournalEntry extends GuidedJournalEntryBase {
  id: number;
}

// Patient Data Schema
export interface PatientDataBase {
  user_id: number;
}

// Patient Data Create Schema
export interface PatientDataCreate extends PatientDataBase {}

// Patient Data Schema
export interface PatientData extends PatientDataBase {
  id: number;
  severity: string;
  mood_entries?: MoodEntry[];
  journal_entries?: JournalEntry[];
  guided_journal_entries?: GuidedJournalEntry[];
}
