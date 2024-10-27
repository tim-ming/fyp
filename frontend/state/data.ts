import { set } from "date-fns";
import {
  GuidedJournalBody,
  GuidedJournalEntry,
  JournalEntry,
  MoodEntry,
} from "@/types/models";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

const INITIAL_STATE: Store = {
  journals: [],
  guidedJournals: [],
  moods: [],
};

type Store = {
  journals: JournalEntry[];
  guidedJournals: GuidedJournalEntry[];
  moods: MoodEntry[];
};

type Action = {
  /**
   *  Update a journal entry
   * @param journal  The journal to be updated
   * @returns  void
   */
  updateJournal: (journal: JournalEntry) => void;
  /**
   *  Update a guided journal entry
   * @param guidedJournal  The guided journal to be updated
   * @returns  void
   */
  updateGuidedJournal: (guidedJournal: GuidedJournalEntry) => void;
  /**
   *  Update a mood entry
   * @param mood  The mood to be updated
   * @returns  void
   */
  updateMood: (mood: MoodEntry) => void;
  /**
   *  Set the journal entries
   * @param journals  The journal entries to be set
   * @returns void
   */
  setJournals: (journals: JournalEntry[]) => void;
  /**
   *  Set the guided journal entries
   * @param guidedJournals  The guided journal entries to be set
   * @returns void
   */
  setGuidedJournals: (guidedJournals: GuidedJournalEntry[]) => void;
  /**
   *  Set the mood entries
   * @param moods  The mood entries to be set
   * @returns void
   */
  setMoods: (moods: MoodEntry[]) => void;
  /**
   *  Reset the store
   * @returns void
   */
  reset: () => void;
};

export const useData = create<Store & Action>()(
  persist(
    (set, get) => ({
      ...INITIAL_STATE,
      updateJournal: (updatedJournal) =>
        set((state) => ({
          journals: state.journals.map((journal) =>
            journal.id === updatedJournal.id ? updatedJournal : journal
          ),
        })),
      updateGuidedJournal: (updatedGuidedJournal) =>
        set((state) => ({
          guidedJournals: state.guidedJournals.map((guidedJournal) =>
            guidedJournal.id === updatedGuidedJournal.id
              ? updatedGuidedJournal
              : guidedJournal
          ),
        })),
      updateMood: (updatedMood) =>
        set((state) => ({
          moods: state.moods.map((mood) =>
            mood.id === updatedMood.id ? updatedMood : mood
          ),
        })),
      setJournals: (journals) => set({ journals }),
      setGuidedJournals: (guidedJournals) => set({ guidedJournals }),
      setMoods: (moods) => set({ moods }),
      reset: () => set(INITIAL_STATE),
    }),
    {
      name: "data-storage",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

// non-persistent store for guided journal entries
type JournalStore = {
  guidedJournalEntry: GuidedJournalBody | null;
  setGuidedJournalEntry: (entry: GuidedJournalBody) => void;
};

export const useJournalStore = create<JournalStore>((set) => ({
  guidedJournalEntry: null,
  setGuidedJournalEntry: (entry) => set({ guidedJournalEntry: entry }),
}));
