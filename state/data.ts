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
  updateJournal: (journal: JournalEntry) => void;
  updateGuidedJournal: (guidedJournal: GuidedJournalEntry) => void;
  updateMood: (mood: MoodEntry) => void;
  setJournals: (journals: JournalEntry[]) => void;
  setGuidedJournals: (guidedJournals: GuidedJournalEntry[]) => void;
  setMoods: (moods: MoodEntry[]) => void;
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
