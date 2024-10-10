import { Token, User, UserWithoutSensitiveData } from "@/types/models";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";

export const TOKEN_TYPE = "bearer";

const INITIAL_STATE: Store = {
  token: null,
  user: null,
};

type Store = {
  token: Token | null;
  user: UserWithoutSensitiveData | null;
};

type Action = {
  setToken: (token: Token) => void;
  setUser: (user: UserWithoutSensitiveData) => void;
  reset: () => void;
};

// if run into ios/android issues refer here
// https://github.com/pmndrs/zustand/issues/394
export const useAuth = create<Store & Action>()(
  persist(
    (set, get) => ({
      ...INITIAL_STATE,
      setToken: (token) => set({ token }),
      setUser: (user) => set({ user }),
      reset: () => set(INITIAL_STATE),
    }),
    {
      name: "auth-storage",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);