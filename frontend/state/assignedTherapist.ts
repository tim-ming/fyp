import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { UserWithoutSensitiveData } from "@/types/models";

interface TherapistStore {
  therapist: UserWithoutSensitiveData | null;
  setTherapist: (therapist: UserWithoutSensitiveData | null) => void;
  clearTherapist: () => void;
  reset: () => void;
}

const useTherapistStore = create<TherapistStore>()(
  persist(
    (set) => ({
      therapist: null,
      setTherapist: (therapist) => set({ therapist }),
      clearTherapist: () => set({ therapist: null }),
      reset: () => set({ therapist: null }),
    }),
    {
      name: "therapist-storage",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

export default useTherapistStore;
