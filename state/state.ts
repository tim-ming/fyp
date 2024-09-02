import { User } from "@/types/models";
import { create } from "zustand";

type Store = {
  token: string | null;
  user: User;
};

type Action = {
  setToken: (token: string) => void;
  setUser: (user: User) => void;
};

export const useAuth = create<Store & Action>()((set) => ({
  token: null,
  user: {
    id: 0,
    email: "",
    name: "",
    hashedPassword: "",
    isActive: false,
    hasOnboarded: false,
    isTherapist: false,
  },
  setToken: (token) => set({ token }),
  setUser: (user) => set({ user }),
}));
