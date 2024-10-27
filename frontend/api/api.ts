import { BACKEND_URL } from "@/constants/globals";
import { useAuth } from "@/state/auth";
import { Sex } from "@/types/globals";
import {
  GuidedJournalEntry,
  GuidedJournalEntryCreate,
  JournalEntry,
  JournalEntryCreate,
  MoodEntry,
  MoodEntryCreate,
  Stats,
  PatientData,
  PatientDataUpdate,
  TherapistData,
  TherapistDataCreate,
  Token,
  User,
  UserCreate,
  UserUpdate,
  UserWithoutSensitiveData,
  UserWithPatientData,
  UserWithTherapistData,
  Message,
  DepressionRiskLog,
} from "@/types/models";

/**
 * Handles non-OK responses by throwing an error with detailed information.
 *
 * @param {Response} response - The response object to check.
 * @throws {Error} Throws an error if the response is not OK.
 */
export const handleNotOk = async (response: Response) => {
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(
      `${response.status} ${response.statusText}, ${errorData.detail}`
    );
  }
};

/**
 * Updates the onboarded status of the user.
 *
 * @returns {Promise<Response>} The response from the backend.
 * @throws {Error} Throws an error if the user is not found.
 */
export const updateOnboarded = async (): Promise<Response> => {
  const { token } = useAuth.getState();
  const user = useAuth.getState().user;

  if (!user) {
    throw new Error("User not found");
  }

  const response = await fetch(`${BACKEND_URL}/patient-data`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token?.access_token}`,
    },
    body: JSON.stringify({ user_id: user.id, has_onboarded: true }),
  });

  return response;
};

/**
 * Checks if an email exists in the backend.
 *
 * @param {string} email - The email to check.
 * @returns {Promise<Response>} The response from the backend.
 */
export const checkEmailExists = async (email: string): Promise<Response> => {
  const response = await fetch(
    `${BACKEND_URL}/users/check-email?email=${encodeURIComponent(email)}`
  );

  return response;
};

/**
 * Updates the user information.
 *
 * @param {UserUpdate} user - The user information to update.
 * @returns {Promise<UserWithoutSensitiveData>} The updated user information without sensitive data.
 * @throws {Error} Throws an error if the response is not OK.
 */
export const updateUser = async (
  user: UserUpdate
): Promise<UserWithoutSensitiveData> => {
  const { token } = useAuth.getState();

  const response = await fetch(`${BACKEND_URL}/users/me`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${token?.access_token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(user),
  });

  await handleNotOk(response);

  const updatedUser = await response.json();
  return updatedUser;
};

/**
 * Retrieves the user information.
 *
 * @returns {Promise<UserWithoutSensitiveData>} The user information without sensitive data.
 * @throws {Error} Throws an error if the response is not OK.
 */
export const getUser = async (): Promise<UserWithoutSensitiveData> => {
  const { token } = useAuth.getState();

  const response = await fetch(`${BACKEND_URL}/users/me`, {
    headers: {
      Authorization: `Bearer ${token?.access_token}`,
    },
  });

  await handleNotOk(response);

  const profile = (await response.json()) as UserWithoutSensitiveData;
  return profile;
};

/**
 * Retrieves a journal entry for a specific date.
 *
 * @param {string} date - The date of the journal entry to retrieve.
 * @returns {Promise<JournalEntry>} The journal entry for the specified date.
 * @throws {Error} Throws an error if the response is not OK.
 */
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

/**
 * Retrieves a list of journal entries with a specified limit.
 *
 * @param {number} [limit=30] - The maximum number of journal entries to retrieve.
 * @returns {Promise<JournalEntry[]>} A list of journal entries.
 * @throws {Error} Throws an error if the response is not OK.
 */
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

/**
 * Sends a signup request to the backend.
 *
 * @param {UserCreate} user - The user information to create.
 * @returns {Promise<Response>} The response from the backend.
 */
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

/**
 * Sends a signin request to the backend.
 *
 * @param {string} email - The email of the user.
 * @param {string} password - The password of the user.
 * @returns {Promise<Response>} The response from the backend.
 */
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

/**
 * Sends a Google signin request to the backend.
 *
 * @param {Token} token - The Google token.
 * @returns {Promise<Response>} The response from the backend.
 */
export const postSigninGoogle = async (token: Token): Promise<Response> => {
  const response = await fetch(`${BACKEND_URL}/signin/google?token=${token}`, {
    method: "POST",
  });

  return response;
};

/**
 * Sends a journal entry to the backend.
 *
 * @param {JournalEntryCreate} journal - The journal entry to create.
 * @returns {Promise<JournalEntry>} The created journal entry.
 * @throws {Error} Throws an error if the response is not OK.
 */
export const postJournalEntry = async (
  journal: JournalEntryCreate
): Promise<JournalEntry> => {
  const { token } = useAuth.getState();
  console.log(journal);
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

/**
 * Retrieves a list of patients from the backend.
 *
 * @returns {Promise<UserWithPatientData[]>} A list of patients with their data.
 * @throws {Error} Throws an error if the response is not OK.
 */
export const getPatients = async (): Promise<UserWithPatientData[]> => {
  const { token } = useAuth.getState();

  const response = await fetch(`${BACKEND_URL}/patients`, {
    headers: {
      Authorization: `Bearer ${token?.access_token}`,
    },
  });

  await handleNotOk(response);

  const patients: UserWithPatientData[] = await response.json();
  return patients;
};

/**
 * Retrieves patient data for a specific patient ID.
 *
 * @param {number} id - The ID of the patient.
 * @returns {Promise<UserWithPatientData>} The patient data.
 * @throws {Error} Throws an error if the response is not OK.
 */
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

/**
 * Retrieves a guided journal entry for a specific date.
 *
 * @param {string} date - The date of the guided journal entry to retrieve.
 * @returns {Promise<GuidedJournalEntry>} The guided journal entry for the specified date.
 * @throws {Error} Throws an error if the response is not OK.
 */
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

/**
 * Retrieves a list of guided journal entries with a specified limit.
 *
 * @param {number} [limit=30] - The maximum number of guided journal entries to retrieve.
 * @returns {Promise<GuidedJournalEntry[]>} A list of guided journal entries.
 * @throws {Error} Throws an error if the response is not OK.
 */
export const getGuidedJournalEntries = async (
  limit = 30
): Promise<GuidedJournalEntry[]> => {
  const { token } = useAuth.getState();

  const response = await fetch(
    `${BACKEND_URL}/guided-journals?limit=${limit}`,
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

  const journals: GuidedJournalEntry[] = await response.json();
  return journals;
};

/**
 * Sends a guided journal entry to the backend.
 *
 * @param {GuidedJournalEntryCreate} guidedJournal - The guided journal entry to create.
 * @returns {Promise<GuidedJournalEntry>} The created guided journal entry.
 * @throws {Error} Throws an error if the response is not OK.
 */
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

/**
 * Retrieves a mood entry for a specific date.
 *
 * @param {string} date - The date of the mood entry to retrieve.
 * @returns {Promise<MoodEntry>} The mood entry for the specified date.
 * @throws {Error} Throws an error if the response is not OK.
 */
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

/**
 * Retrieves a list of mood entries with a specified limit.
 *
 * @param {number} [limit=30] - The maximum number of mood entries to retrieve.
 * @returns {Promise<MoodEntry[]>} A list of mood entries.
 * @throws {Error} Throws an error if the response is not OK.
 */
export const getMoodEntries = async (limit = 30): Promise<MoodEntry[]> => {
  const { token } = useAuth.getState();

  const response = await fetch(`${BACKEND_URL}/mood?limit=${limit}`, {
    headers: {
      Authorization: `Bearer ${token?.access_token}`,
    },
  });

  if (!response.ok) {
    throw new Error(
      `Failed to fetch journal entries: ${response.status} ${response.statusText}`
    );
  }

  const entries: MoodEntry[] = await response.json();
  return entries;
};

/**
 * Retrieves mood entries within a specified date range.
 *
 * @param {string} start - The start date of the range.
 * @param {string} end - The end date of the range.
 * @returns {Promise<MoodEntry[]>} A list of mood entries within the date range.
 * @throws {Error} Throws an error if the response is not OK.
 */
export const getMoodEntriesRange = async (start: string, end: string) => {
  const { token } = useAuth.getState();

  const response = await fetch(
    `${BACKEND_URL}/mood?start=${start}&end=${end}`,
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

  const entries: MoodEntry[] = await response.json();
  return entries;
};

/**
 * Sends a mood entry to the backend.
 *
 * @param {MoodEntryCreate} mood - The mood entry to create.
 * @returns {Promise<MoodEntry>} The created mood entry.
 * @throws {Error} Throws an error if the response is not OK.
 */
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

/**
 * Sends a mood entry to the backend.
 *
 * @param {MoodEntryCreate} mood - The mood entry to create.
 * @returns {Promise<MoodEntry>} The created mood entry.
 * @throws {Error} Throws an error if the response is not OK.
 */
export const getTherapists = async (): Promise<UserWithoutSensitiveData[]> => {
  const { token } = useAuth.getState();

  const response = await fetch(`${BACKEND_URL}/therapists`, {
    headers: {
      Authorization: `Bearer ${token?.access_token}`,
    },
  });

  await handleNotOk(response);

  const therapists: UserWithoutSensitiveData[] = await response.json();
  return therapists;
};

/**
 * Retrieves therapist data for a specific therapist ID.
 *
 * @param {number} id - The ID of the therapist.
 * @returns {Promise<UserWithTherapistData>} The therapist data.
 * @throws {Error} Throws an error if the response is not OK.
 */
export const getTherapistData = async (
  id: number
): Promise<UserWithTherapistData> => {
  const { token } = useAuth.getState();

  const response = await fetch(`${BACKEND_URL}/therapist-data/${id}`, {
    headers: {
      Authorization: `Bearer ${token?.access_token}`,
    },
  });

  await handleNotOk(response);

  const therapist: UserWithTherapistData = await response.json();
  return therapist;
};

/**
 * Updates therapist data.
 *
 * @param {TherapistDataCreate} therapist_data - The therapist data to update.
 * @returns {Promise<TherapistData>} The updated therapist data.
 * @throws {Error} Throws an error if the response is not OK.
 */
export const updateTherapistData = async (
  therapist_data: TherapistDataCreate
): Promise<TherapistData> => {
  const { token } = useAuth.getState();

  const response = await fetch(`${BACKEND_URL}/therapist-data`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${token?.access_token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(therapist_data),
  });

  await handleNotOk(response);

  const data: TherapistData = await response.json();
  return data;
};

/**
 * Retrieves user statistics.
 *
 * @returns {Promise<Stats>} The user statistics.
 * @throws {Error} Throws an error if the response is not OK.
 */
export const getStats = async (): Promise<Stats> => {
  const { token } = useAuth.getState();

  const response = await fetch(`${BACKEND_URL}/users/stats`, {
    headers: {
      Authorization: `Bearer ${token?.access_token}`,
    },
  });

  await handleNotOk(response);

  const data: Stats = await response.json();
  return data;
};

/**
 * Assigns a therapist to the user.
 *
 * @param {number} therapist_id - The ID of the therapist to assign.
 * @returns {Promise<Response>} The response from the backend.
 */
export const assignTherapist = async (
  therapist_id: number
): Promise<Response> => {
  const { token } = useAuth.getState();

  const response = await fetch(
    `${BACKEND_URL}/assign-therapist/${therapist_id}`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token?.access_token}`,
      },
    }
  );

  return response;
};

/**
 * Unassigns the therapist from the user.
 *
 * @returns {Promise<Response>} The response from the backend.
 */
export const unassignTherapist = async (): Promise<Response> => {
  const { token } = useAuth.getState();

  const response = await fetch(`${BACKEND_URL}/unassign-therapist`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token?.access_token}`,
    },
  });

  return response;
};

/**
 * Updates patient data.
 *
 * @param {PatientDataUpdate} patientData - The patient data to update.
 * @returns {Promise<PatientData>} The updated patient data.
 * @throws {Error} Throws an error if the response is not OK.
 */
export const updatePatientData = async (
  patientData: PatientDataUpdate
): Promise<PatientData> => {
  const { token } = useAuth.getState();

  const response = await fetch(`${BACKEND_URL}/patient-data`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${token?.access_token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(patientData),
  });

  await handleNotOk(response);

  const data: PatientData = await response.json();
  return data;
};

/**
 * Retrieves the therapist in charge of the user.
 *
 * @returns {Promise<UserWithoutSensitiveData>} The therapist in charge.
 * @throws {Error} Throws an error if the response is not OK.
 */
export const getTherapistInCharge =
  async (): Promise<UserWithoutSensitiveData> => {
    const { token } = useAuth.getState();

    const response = await fetch(`${BACKEND_URL}/therapist`, {
      headers: {
        Authorization: `Bearer ${token?.access_token}`,
      },
    });

    await handleNotOk(response);

    const therapist: UserWithoutSensitiveData = await response.json();
    return therapist;
  };

/**
 * Retrieves messages for a specific recipient.
 *
 * @param {number} recipient_id - The ID of the recipient.
 * @returns {Promise<Message[]>} A list of messages for the recipient.
 * @throws {Error} Throws an error if the response is not OK.
 */
export const getMessages = async (recipient_id: number): Promise<Message[]> => {
  const { token } = useAuth.getState();
  const response = await fetch(`${BACKEND_URL}/chat/messages/${recipient_id}`, {
    headers: {
      Authorization: `Bearer ${token?.access_token}`,
    },
  });

  await handleNotOk(response);

  const messages: Message[] = await response.json();
  console.log(messages);
  return messages;
};

/**
 * Retrieves depression risk logs for a specific user.
 *
 * @param {number} userId - The ID of the user.
 * @returns {Promise<DepressionRiskLog[]>} A list of depression risk logs for the user.
 * @throws {Error} Throws an error if the response is not OK.
 */
export const getDepressionRisks = async (userId: number) => {
  const { token } = useAuth.getState();
  const response = await fetch(
    `${BACKEND_URL}/user/depression-risks/${userId}`,
    {
      headers: {
        Authorization: `Bearer ${token?.access_token}`,
      },
    }
  );

  await handleNotOk(response);

  if (response.status !== 200) {
    throw new Error(`Error: ${response.status}`);
  }

  const logs: DepressionRiskLog[] = await response.json();
  return logs;
};
