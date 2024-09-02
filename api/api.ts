import { BACKEND_URL, setToken } from "@/constants/globals";
import { Token, User } from "@/types/models";

const handleNotOk = async (response: Response) => {
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(
      `${response.status} ${response.statusText}, ${errorData.detail}`
    );
  }
};

export const getUser = async (token: string): Promise<User> => {
  const response = await fetch(`${BACKEND_URL}/users/me`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  await handleNotOk(response);

  const profile = (await response.json()) as User;
  return profile;
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

  await handleNotOk(response);

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
  const expiresAt = new Date(Date.now() + data.expires_in * 60 * 1000);

  setToken(data, expiresAt);

  return data;
};
