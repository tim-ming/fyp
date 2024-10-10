import {
  getJournalEntry,
  getMoodEntry,
  getPatientData,
  getPatients,
} from "@/frontend/api/api";
import { STEPS_TEXT } from "@/frontend/app/patient/guided-journal/constants";
import CustomText from "@/frontend/components/CustomText";
import { getStatus } from "@/frontend/constants/globals";
import { useHydratedEffect } from "@/hooks/hooks";
import {
  GuidedJournalEntry,
  JournalEntry,
  MoodEntry,
  UserWithPatientData,
} from "@/types/models";
import { format } from "date-fns";
import { useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
type EntryProps = {
  mood: MoodEntry | null;
  journal: JournalEntry | null;
  guidedJournal: GuidedJournalEntry | null;
  date: string;
};

type GuidedJournalProps = {
  guidedJournal: GuidedJournalEntry | null;
};

type JournalProps = {
  journal: JournalEntry | null;
};

type MoodProps = {
  mood: MoodEntry | null;
};

const GuidedJournal: React.FC<GuidedJournalProps> = ({ guidedJournal }) => {
  if (!guidedJournal) return null;

  return (
    <>
      <CustomText className="text-3xl mt-4 mb-10 font-medium text-black200">
        Guided Journal
      </CustomText>

      <CustomText className="text-lg leading-5 font-medium mb-2 text-black100">
        {STEPS_TEXT.ONE}
      </CustomText>
      <CustomText className="text-gray200 text-base">
        {guidedJournal.body.step1_text}
      </CustomText>

      <CustomText className="text-lg mt-12 leading-6 font-medium mb-2 text-black100">
        {STEPS_TEXT.TWO}
      </CustomText>
      <CustomText className="text-gray200 text-base">
        {guidedJournal.body.step2_selected_distortions?.join(", ")}
      </CustomText>

      <CustomText className="text-lg mt-12 leading-6 font-medium mb-2 text-black100">
        {STEPS_TEXT.THREE}
      </CustomText>
      <CustomText className="text-gray200 text-base">
        {guidedJournal.body.step3_text}
      </CustomText>

      <CustomText className="text-lg mt-12 leading-6 font-medium mb-2 text-black100">
        {STEPS_TEXT.FOUR}
      </CustomText>
      <CustomText className="text-gray200 text-base">
        {guidedJournal.body.step4_text}
      </CustomText>
    </>
  );
};

const Journal: React.FC<JournalProps> = ({ journal }) => {
  if (!journal) return null;

  return (
    <>
      <CustomText
        letterSpacing="wide"
        className="text-gray100 text-lg font-medium"
      >
        {`${journal.date}`}
      </CustomText>
      <CustomText className="text-3xl mt-4 mb-10 font-semibold text-black200">
        Journal
      </CustomText>
      <CustomText className="text-lg leading-5 font-medium mb-2 text-black100">
        {journal.title}
      </CustomText>

      <CustomText className="text-gray200 text-base">{journal.body}</CustomText>
    </>
  );
};

const Mood: React.FC<MoodProps> = ({ mood }) => {
  if (!mood) return null;

  return (
    <>
      <CustomText
        letterSpacing="wide"
        className="text-gray100 text-lg font-medium"
      >
        {`${mood.date}`}
      </CustomText>
      <CustomText className="text-3xl mt-4 mb-10 font-semibold text-black200">
        Mood
      </CustomText>
      <CustomText className="text-lg leading-6 font-medium mb-2 text-black100">
        {`You felt ${getStatus(mood.mood)}. (${mood.mood})`}
      </CustomText>
    </>
  );
};

export default function MoodScreen() {
  const insets = useSafeAreaInsets();
  const date = useLocalSearchParams().date as string;
  const { patientId } = useLocalSearchParams();
  const [entry, setEntry] = useState<EntryProps>({
    mood: null,
    journal: null,
    guidedJournal: null,
    date: format(new Date(date), "dd MMM"),
  });
  const [loading, setLoading] = useState(true);

  useHydratedEffect(() => {
    const fetchPatient = async (patientId: number) => {
      try {
        const patients = await getPatients();
        if (!patients.find((p) => p.id === patientId)) {
          throw new Error("Patient not found");
        }
        const patient = await getPatientData(patientId);
        setEntry({
          mood:
            patient.patient_data?.mood_entries?.find((m) => m.date === date) ||
            null,
          journal:
            patient.patient_data?.journal_entries?.find(
              (m) => m.date === date
            ) || null,
          guidedJournal:
            patient.patient_data?.guided_journal_entries?.find(
              (m) => m.date === date
            ) || null,
          date: format(new Date(date), "dd MMM"),
        });
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchPatient(Number(patientId));
  }, [date]);

  return (
    <ScrollView
      style={{
        paddingTop: insets.top,
        paddingBottom: insets.bottom,
        paddingLeft: insets.left,
        paddingRight: insets.right,
      }}
      className="bg-blue100"
    >
      <View className="px-4 pt-16">
        <Journal journal={entry.journal} />
        <GuidedJournal guidedJournal={entry.guidedJournal} />
        <Mood mood={entry.mood} />
      </View>
    </ScrollView>
  );
}
