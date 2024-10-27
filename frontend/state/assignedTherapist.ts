// Assigned therapist state
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { UserWithoutSensitiveData } from "@/types/models";

interface TherapistStore {
  /**
   * The assigned therapist
   */
  therapist: UserWithoutSensitiveData | null;
  /**
   * Set the therapist
   * @param therapist  The therapist to be set
   * @returns  void
   */
  setTherapist: (therapist: UserWithoutSensitiveData | null) => void;
  /**
   *  Clear the therapist
   * @returns void
   */
  clearTherapist: () => void;
  /**
   *  Reset the therapist
   * @returns void
   */
  reset: () => void;
}

/**
 * Store for the assigned therapist
 */
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
