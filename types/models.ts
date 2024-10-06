// Enum for distortion types
export enum CognitiveDistortion {
  FortuneTelling = "Fortune-telling",
  ShouldStatements = "Should statements",
  MindReading = "Mind Reading",
  Catastrophising = "Catastrophising",
  EmotionalReasoning = "Emotional Reasoning",
  AllOrNothingThinking = "All-or-Nothing Thinking",
  BlackAndWhiteThinking = "Black and White Thinking",
  Personalisation = "Personalisation",
  DiscountingThePositive = "Discounting the Positive",
  Labelling = "Labelling",
}

// Enum for user roles
export enum UserRole {
  Patient = "patient",
  Therapist = "therapist",
}

// Base User Schema
export interface UserBase {
  email: string;
}

// Base User Create Schema
export interface UserCreateBase extends UserBase {
  name: string;
  dob?: string;
  sex?: string | null;
  occupation?: string;
  role?: UserRole;
  image?: string;
}

// User Create Schema
export interface UserCreate extends UserCreateBase {
  password: string;
}

// User Create Schema for Google Signin
export interface UserCreateGoogle extends UserCreateBase {}

// User Update Schema
export interface UserUpdate extends UserBase {
  name?: string;
  is_active?: boolean;
  dob?: string;
  sex?: string;
  occupation?: string;
  image?: string;
}

// User Schema
export interface User extends UserBase {
  id: number;
  name: string;
  dob: string;
  sex: string | null;
  occupation: string;
  hashed_password: string;
  is_active: boolean;
  role: UserRole;
  image: string;
  patient_data?: PatientData;
  therapist_data?: TherapistData;
}

// User Schema without sensitive data
export interface UserWithoutSensitiveData extends UserBase {
  id: number;
  name: string;
  dob: string;
  sex: string | null;
  occupation: string;
  is_active: boolean;
  role: UserRole;
  image: string;
}

// User Schema with patient data
export interface UserWithPatientData extends UserWithoutSensitiveData {
  patient_data?: PatientData;
}

// User Schema with therapist data
export interface UserWithTherapistData extends UserWithoutSensitiveData {
  therapist_data?: TherapistData;
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
  eat: number;
  sleep: number;
  date: string;
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
  date: string;
}

// Journal Entry Create Schema
export interface JournalEntryCreate extends JournalEntryBase {}

// Journal Entry Schema
export interface JournalEntry extends JournalEntryBase {
  id: number;
}

// Base Guided Journal Body Schema
export interface GuidedJournalBody {
  step1_text?: string | null;
  step2_selected_distortions?: CognitiveDistortion[] | null;
  step3_text?: string | null;
  step4_text?: string | null;
}

// Base Guided Journal Entry Schema
export interface GuidedJournalEntryBase {
  body: GuidedJournalBody;
  date: string;
}

// Guided Journal Entry Create Schema
export interface GuidedJournalEntryCreate extends GuidedJournalEntryBase {}

// Guided Journal Entry Schema
export interface GuidedJournalEntry extends GuidedJournalEntryBase {
  id: number;
}

// Base Patient Data Schema
export interface PatientDataBase {
  user_id: number;
}

// Patient Data Create Schema
export interface PatientDataCreate extends PatientDataBase {}

// Patient Data Update Schema
export interface PatientDataUpdate extends PatientDataBase {
  has_onboarded?: boolean;
  severity?: string;
  therapist_note?: string;
}

// Patient Data Schema
export interface PatientData extends PatientDataBase {
  id: number;
  has_onboarded: boolean;
  severity: string;
  therapist_note: string;
  therapist_user_id?: number;
  mood_entries?: MoodEntry[];
  journal_entries?: JournalEntry[];
  guided_journal_entries?: GuidedJournalEntry[];
}

// Base Therapist Data Schema
export interface TherapistDataBase {
  user_id: number;
}

// Therapist Data Create Schema
export interface TherapistDataCreate extends TherapistDataBase {
  qualifications?: string;
  expertise?: string;
  bio?: string;
  treatment_approach?: string;
}

// Therapist Data Schema
export interface TherapistData extends TherapistDataBase {
  id: number;
  qualifications?: string;
  expertise?: string;
  bio?: string;
  treatment_approach?: string;
  patients?: PatientData[];
}

// Stats Schema
export interface Stats {
  "journal_count": number;
  "guided_journal_count": number;
  "streak": number;
  "last_login": string;
}