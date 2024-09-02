import { Token, User } from "@/types/models";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useState, useEffect } from "react";

export const TOKEN_TYPE = "bearer";

const INITIAL_STATE: Store = {
  token: null,
  user: null,
};

type Store = {
  token: Token | null;
  user: User | null;
};

type Action = {
  setToken: (token: Token) => void;
  setUser: (user: User) => void;
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
      name: "yummystorage",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

export const useHydration = () => {
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    // Note: This is just in case you want to take into account manual rehydration.
    // You can remove the following line if you don't need it.
    const unsubHydrate = useAuth.persist.onHydrate(() => setHydrated(false));

    const unsubFinishHydration = useAuth.persist.onFinishHydration(() =>
      setHydrated(true)
    );

    setHydrated(useAuth.persist.hasHydrated());

    return () => {
      unsubHydrate();
      unsubFinishHydration();
    };
  }, []);

  return hydrated;
};
