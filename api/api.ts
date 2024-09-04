import { BACKEND_URL } from "@/constants/globals";
import { useAuth } from "@/state/state";
import {
  JournalEntry,
  JournalEntryCreate,
  Token,
  User,
  UserWithoutSensitiveData,
} from "@/types/models";

const handleNotOk = async (response: Response) => {
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(
      `${response.status} ${response.statusText}, ${errorData.detail}`
    );
  }
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

export const postSignup = async (
  email: string,
  password: string,
  name: string
): Promise<Response> => {
  const response = await fetch(`${BACKEND_URL}/signup`, {
    method: "POST",
    body: JSON.stringify({ email, password, name }),
    headers: {
      "Content-Type": "application/json",
    },
  });

  return response.json();
};

export const postSignin = async (
  email: string,
  password: string
): Promise<Token> => {
  const form = new FormData();
  form.append("username", email);
  form.append("password", password);

  const response = await fetch(`${BACKEND_URL}/signin`, {
    method: "POST",
    body: form,
  });

  await handleNotOk(response);

  const data: Token = await response.json();

  // TODO: Do we need to change this?
  const expiresAt = new Date(Date.now() + data.expires_in * 60 * 1000);

  useAuth.getState().setToken(data);

  return data;
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
