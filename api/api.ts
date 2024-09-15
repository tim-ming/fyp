import { BACKEND_URL } from "@/constants/globals";
import { useAuth } from "@/state/state";
import { Sex } from "@/types/globals";
import {
  GuidedJournalEntry,
  GuidedJournalEntryCreate,
  JournalEntry,
  JournalEntryCreate,
  MoodEntry,
  MoodEntryCreate,
  Token,
  User,
  UserCreate,
  UserUpdate,
  UserWithoutSensitiveData,
  UserWithPatientData,
} from "@/types/models";

export const handleNotOk = async (response: Response) => {
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(
      `${response.status} ${response.statusText}, ${errorData.detail}`
    );
  }
};

export const updateOnboarded = async (): Promise<Response> => {
  const { token } = useAuth.getState();
  const user = useAuth.getState().user;

  if (!user) {
    throw new Error("User not found");
  }

  const response = await fetch(`${BACKEND_URL}/users/me`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${token?.access_token}`,
    },

    body: JSON.stringify({ user: { ...user, has_onboarded: true } }),
  });

  return response;
};

export const checkEmailExists = async (email: string): Promise<Response> => {
  const response = await fetch(
    `${BACKEND_URL}/users/check-email?email=${encodeURIComponent(email)}`
  );

  return response;
};

export const getUser = async (): Promise<User> => {
  const { token } = useAuth.getState();

  const response = await fetch(`${BACKEND_URL}/users/me`, {
    headers: {
      Authorization: `Bearer ${token?.access_token}`,
    },
  });

  await handleNotOk(response);

  const profile = (await response.json()) as User;
  return profile;
};

export const getJournalEntry = async (date: string): Promise<JournalEntry> => {
  const { token } = useAuth.getState();

  const response = await fetch(
    `${BACKEND_URL}/journals/date/${encodeURIComponent(date)}`,
    {
      headers: {
        Authorization: `Bearer ${token?.access_token}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error(
      `Failed to fetch journal entries: ${response.status} ${response.statusText}`
    );
  }

  const data: JournalEntry = await response.json();
  return data;
};

export const getJournalEntries = async (
  limit = 30
): Promise<JournalEntry[]> => {
  const { token } = useAuth.getState();

  const response = await fetch(`${BACKEND_URL}/journals?limit=${limit}`, {
    headers: {
      Authorization: `Bearer ${token?.access_token}`,
    },
  });

  if (!response.ok) {
    throw new Error(
      `Failed to fetch journal entries: ${response.status} ${response.statusText}`
    );
  }

  const journals: JournalEntry[] = await response.json();
  return journals;
};

export const postSignup = async (user: UserCreate): Promise<Response> => {
  const response = await fetch(`${BACKEND_URL}/signup`, {
    method: "POST",
    body: JSON.stringify(user),
    headers: {
      "Content-Type": "application/json",
    },
  });

  return response;
};

export const postSignin = async (
  email: string,
  password: string
): Promise<Response> => {
  const form = new FormData();
  form.append("username", email);
  form.append("password", password);

  const response = await fetch(`${BACKEND_URL}/signin`, {
    method: "POST",
    body: form,
  });

  return response;
};

export const postJournalEntry = async (
  journal: JournalEntryCreate
): Promise<JournalEntry> => {
  const { token } = useAuth.getState();

  const response = await fetch(`${BACKEND_URL}/journals`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token?.access_token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(journal),
  });

  await handleNotOk(response);

  const data: JournalEntry = await response.json();
  return data;
};

export const getPatients = async (): Promise<UserWithoutSensitiveData[]> => {
  const { token } = useAuth.getState();

  const response = await fetch(`${BACKEND_URL}/patients`, {
    headers: {
      Authorization: `Bearer ${token?.access_token}`,
    },
  });

  await handleNotOk(response);

  const patients: User[] = await response.json();
  return patients;
};

export const getPatientData = async (
  id: number
): Promise<UserWithPatientData> => {
  const { token } = useAuth.getState();

  const response = await fetch(`${BACKEND_URL}/patient-data/${id}`, {
    headers: {
      Authorization: `Bearer ${token?.access_token}`,
    },
  });

  await handleNotOk(response);

  const patient: UserWithPatientData = await response.json();
  return patient;
};

export const getGuidedJournalEntry = async (
  date: string
): Promise<GuidedJournalEntry> => {
  const { token } = useAuth.getState();

  const response = await fetch(
    `${BACKEND_URL}/guided-journals/date/${encodeURIComponent(date)}`,
    {
      headers: {
        Authorization: `Bearer ${token?.access_token}`,
      },
    }
  );

  await handleNotOk(response);

  const data: GuidedJournalEntry = await response.json();
  return data;
};

export const postGuidedJournalEntry = async (
  guidedJournal: GuidedJournalEntryCreate
): Promise<GuidedJournalEntry> => {
  const { token } = useAuth.getState();

  const response = await fetch(`${BACKEND_URL}/guided-journals`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token?.access_token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(guidedJournal),
  });

  await handleNotOk(response);

  const data: GuidedJournalEntry = await response.json();
  return data;
};

export const getMoodEntry = async (date: string): Promise<MoodEntry> => {
  const { token } = useAuth.getState();

  const response = await fetch(
    `${BACKEND_URL}/mood/date/${encodeURIComponent(date)}`,
    {
      headers: {
        Authorization: `Bearer ${token?.access_token}`,
      },
    }
  );

  await handleNotOk(response);

  const data: MoodEntry = await response.json();
  return data;
};

export const postMoodEntry = async (
  mood: MoodEntryCreate
): Promise<MoodEntry> => {
  const { token } = useAuth.getState();

  const response = await fetch(`${BACKEND_URL}/mood`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token?.access_token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(mood),
  });

  await handleNotOk(response);

  const data: MoodEntry = await response.json();
  return data;
};
