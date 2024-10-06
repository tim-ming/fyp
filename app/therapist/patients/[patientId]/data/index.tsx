import CustomText from "@/components/CustomText";
import TopNav from "@/components/TopNav";
import { getStatus } from "@/constants/globals";
import React, { useRef, useState } from "react";
import {
  View,
  ScrollView,
  Pressable,
  ActivityIndicator,
  TextInput,
} from "react-native";
import { eachDayOfInterval, format, isToday, isYesterday } from "date-fns";
import { StyleSheet } from "react-native";
import { shadows } from "@/constants/styles";
import { Colors } from "@/constants/Colors";
import { useLocalSearchParams, useNavigation } from "expo-router";
import {
  GuidedJournalEntry,
  JournalEntry,
  MoodEntry,
  PatientData,
  UserWithPatientData,
} from "@/types/models";
import { useHydratedEffect } from "@/hooks/hooks";
import {
  getJournalEntries,
  getGuidedJournalEntries,
  getMoodEntries,
  getPatientData,
  getPatients,
} from "@/api/api";
import { STEPS_TEXT } from "@/app/guided-journal/constants";

const formatDateHeader = (date: string) => {
  const parsedDate = new Date(date);

  if (isToday(parsedDate)) {
    return `Today, ${format(parsedDate, "dd MMM")}`;
  } else if (isYesterday(parsedDate)) {
    return `Yesterday, ${format(parsedDate, "dd MMM")}`;
  } else {
    return format(parsedDate, "dd MMM");
  }
};

interface JournalSectionProps {
  data: JournalEntry;
}

interface MoodSectionProps {
  data: MoodEntry;
}

interface GuidedJournalProps {
  data: GuidedJournalEntry;
}

interface CardProps {
  data: Section;
  patientId: number;
}

interface Section {
  date: Date;
  journal: JournalEntry | null;
  guidedJournal: GuidedJournalEntry | null;
  mood: MoodEntry | null;
}

const JournalSection: React.FC<JournalSectionProps> = ({ data }) => {
  const truncatedTitle =
    !data.title || data.title.trim().length === 0
      ? "Untitled"
      : data.title.length > 30
      ? `${data.title.substring(0, 30)}...`
      : data.title;

  const truncatedContent =
    !data.body || data.body.trim().length === 0
      ? "Empty Journal"
      : data.body.length > 100
      ? `${data.body.substring(0, 100)}...`
      : data.body;

  return (
    <>
      <CustomText className="text-base text-gray100">Journal</CustomText>

      <CustomText className="text-xl mb-5 font-medium">
        {truncatedTitle}
      </CustomText>
      <CustomText className="text-sm text-gray300">
        {truncatedContent}
      </CustomText>
    </>
  );
};

const MoodSection: React.FC<MoodSectionProps> = ({ data }) => {
  return (
    <>
      <View className="flex-row">
        <View className="flex-1">
          <CustomText className="mb-1 text-gray200">Mood</CustomText>
          <CustomText
            className={`text-xl font-medium ${
              data.mood < 30
                ? "text-red-300"
                : data.mood < 60
                ? "text-yellow-500"
                : "text-black100"
            }`}
          >
            {`${getStatus(data.mood)} (${data.mood})`}
          </CustomText>
        </View>
        <View className="flex-1">
          <CustomText className="mb-1 text-gray200">Appetite</CustomText>
          <CustomText
            className={`text-xl font-medium ${
              data.eat < 30
                ? "text-red-300"
                : data.eat < 60
                ? "text-yellow-500"
                : "text-black100"
            }`}
          >
            {`${getStatus(data.eat)} (${data.eat})`}
          </CustomText>
        </View>
        <View className="flex-1">
          <CustomText className="mb-1 text-gray200">Sleep</CustomText>
          <CustomText
            className={`text-xl font-medium ${
              data.sleep < 30
                ? "text-red-300"
                : data.sleep < 60
                ? "text-yellow-500"
                : "text-black100"
            }`}
          >
            {`${getStatus(data.sleep)} (${data.sleep})`}
          </CustomText>
        </View>
      </View>
    </>
  );
};

const GuidedJournalSection: React.FC<GuidedJournalProps> = ({ data }) => {
  return (
    <>
      <CustomText className="text-sm font-semibold text-gray200">
        Guided Writing
      </CustomText>
      <CustomText className="text-sm text-gray100">{STEPS_TEXT.ONE}</CustomText>
      <CustomText className="text-sm text-gray200">
        {data.body.step1_text}
      </CustomText>
    </>
  );
};

const Card: React.FC<CardProps> = ({ data, patientId }) => {
  const navigation = useNavigation<any>();

  const route = () => {
    const formattedDate = format(data.date, "yyyy-MM-dd");
    navigation.navigate(
      `therapist/patients/${patientId}/data/${formattedDate}`,
      { date: formattedDate }
    );
  };
  return (
    <Pressable onPress={route} style={styles.container} className="gap-y-2">
      {data.mood && <MoodSection data={data.mood} />}
      {data.journal && (
        <>
          <View className="bg-gray50 h-[1px] w-full rounded-full my-2" />
          <JournalSection data={data.journal} />
        </>
      )}
      {data.guidedJournal && (
        <>
          <View className="bg-gray50 h-[1px] w-full rounded-full my-4" />
          <GuidedJournalSection data={data.guidedJournal} />
        </>
      )}
    </Pressable>
  );
};

const createMonthlyEntries = (data: PatientData) => {
  const monthData: { [key: string]: Section } = {};
  const endDate = new Date();
  const startDate = new Date(endDate);
  startDate.setMonth(startDate.getMonth() - 1);

  const allDates = eachDayOfInterval({ start: startDate, end: endDate });

  allDates.forEach((date) => {
    const formattedDate = format(date, "yyyy-MM-dd");
    monthData[formattedDate] = {
      mood: null,
      journal: null,
      guidedJournal: null,
      date,
    };
  });

  const journalEntries = data.journal_entries || [];
  const guidedJournalEntries = data.guided_journal_entries || [];
  const moodEntries = data.mood_entries || [];

  journalEntries.forEach((entry) => {
    monthData[format(entry.date, "yyyy-MM-dd")].journal = entry;
  });

  guidedJournalEntries.forEach((entry) => {
    monthData[format(entry.date, "yyyy-MM-dd")].guidedJournal = entry;
  });

  moodEntries.forEach((entry) => {
    monthData[format(entry.date, "yyyy-MM-dd")].mood = entry;
  });

  return Object.values(monthData).sort(
    (a, b) => a.date.getTime() - b.date.getTime()
  );
};

export default function VaultScreen() {
  const [data, setData] = React.useState<Section[]>([]);

  const { patientId } = useLocalSearchParams();
  const [patient, setPatient] = useState<UserWithPatientData | null>(null);
  const [loading, setLoading] = useState(true);
  const [entries, setEntries] = useState<Section[]>([]);

  useHydratedEffect(() => {
    const fetchPatient = async (patientId: number) => {
      try {
        const patients = await getPatients();
        if (!patients.find((p) => p.id === patientId)) {
          throw new Error("Patient is not found");
        }
        const patient = await getPatientData(patientId);
        setPatient(patient);
        const entries = createMonthlyEntries(patient.patient_data!).filter(
          (entry) => entry.mood || entry.journal || entry.guidedJournal
        );
        setEntries(entries);
        console.log(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchPatient(Number(patientId));
  }, [patientId]);

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" color="#256CD0" />
      </View>
    );
  }
  return (
    <ScrollView className="bg-blue100 flex-1">
      <TopNav />
      <View className="mb-8 px-4">
        {entries.length == 0 ? (
          <CustomText className="text-base text-gray300">
            No patient activity yet.
          </CustomText>
        ) : (
          entries.reverse().map((section, sectionIndex) => (
            <View key={sectionIndex}>
              {/* Date Section */}
              <CustomText className="text-lg font-semibold mb-4">
                {formatDateHeader(section.date.toISOString())}
              </CustomText>

              <Card data={section} patientId={Number(patientId)} />

              {/* Render horizontal bar if it's not the last section */}
              {sectionIndex < data.length - 1 && (
                <View className="h-[1px] bg-gray50 my-5" />
              )}
            </View>
          ))
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "white",
    padding: 16, // 1rem is approximately 16 pixels
    borderRadius: 16, // Adjust as needed
    borderWidth: 1, // Adjust as needed
    borderColor: Colors.gray50, // Adjust as needed
    ...shadows.card,
  },
});
