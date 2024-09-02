import { create } from "zustand";

type Store = {
  token: string;
};

const useAuth = create<Store>()((set) => ({
  token: "",
}));
