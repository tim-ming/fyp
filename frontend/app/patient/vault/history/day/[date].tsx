import CustomText from "@/components/CustomText";
import TopNav from "@/components/TopNav";
import { getStatus } from "@/constants/globals";
import React, { useState } from "react";
import { View, ScrollView, Pressable } from "react-native";
import { format, isToday, isYesterday } from "date-fns";
import { StyleSheet } from "react-native";
import { shadows } from "@/constants/styles";
import { Colors } from "@/constants/Colors";
import { useLocalSearchParams, useNavigation } from "expo-router";
import { GuidedJournalEntry, JournalEntry, MoodEntry } from "@/types/models";
import { useHydratedEffect } from "@/hooks/hooks";
import {
  getJournalEntries,
  getGuidedJournalEntries,
  getMoodEntries,
  getJournalEntry,
  getGuidedJournalEntry,
  getMoodEntry,
} from "@/api/api";
import { STEPS_TEXT } from "@/app/patient/guided-journal/constants";

interface JournalProps {
  data: JournalEntry;
}

interface GuidedJournalProps {
  data: GuidedJournalEntry;
}
interface MoodProps {
  data: MoodEntry;
}

const JournalCard: React.FC<JournalProps> = ({ data }) => {
  const navigation = useNavigation<any>();

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

  const route = () => {
    navigation.navigate("patient/vault/history/journal/[date]", {
      date: data.date,
    });
  };

  return (
    <Pressable onPress={route} style={styles.container}>
      <CustomText
        letterSpacing="wide"
        className="text-sm font-semibold text-gray100"
      >
        JOURNAL
      </CustomText>

      <CustomText className="text-xl mb-5 font-medium">
        {truncatedTitle}
      </CustomText>
      <CustomText className="text-sm text-gray200">
        {truncatedContent}
      </CustomText>
    </Pressable>
  );
};

const GuidedJournalCard: React.FC<GuidedJournalProps> = ({ data }) => {
  const navigation = useNavigation<any>();
  const route = () => {
    navigation.navigate("patient/vault/history/guided-journal/[date]", {
      date: data.date,
    });
  };
  return (
    <Pressable onPress={route} style={styles.container}>
      <CustomText
        letterSpacing="wide"
        className="text-sm font-semibold text-gray100 mb-4"
      >
        GUIDED WRITING
      </CustomText>
      <CustomText className="text-sm text-gray100">{STEPS_TEXT.ONE}</CustomText>
      <CustomText className="text-sm text-gray200">
        {data.body.step1_text}
      </CustomText>
    </Pressable>
  );
};

const MoodCard: React.FC<MoodProps> = ({ data }) => {
  const navigation = useNavigation<any>();
  const route = () => {
    navigation.navigate("patient/vault/history/mood/[date]", {
      date: data.date,
    });
  };
  return (
    <Pressable onPress={route} style={styles.container}>
      <CustomText
        letterSpacing="wide"
        className="text-sm uppercase font-semibold text-gray100"
      >
        Tracking
      </CustomText>
      <CustomText className="text-xl mb-5 font-medium">
        You felt {getStatus(data.mood)}
      </CustomText>
      <CustomText className="text-sm leading-4 text-gray200">
        You also{" "}
        <CustomText className="text-sm leading-4 text-black100">
          ate {getStatus(data.eat)}
        </CustomText>{" "}
        and{" "}
        <CustomText className="text-sm leading-4 text-black100">
          slept {getStatus(data.sleep)}
        </CustomText>{" "}
        last night.
      </CustomText>
    </Pressable>
  );
};

type CardType = "journal" | "guidedWriting" | "mood";

type Data = {
  journal: JournalEntry;
  guidedJournal: GuidedJournalEntry;
  mood: MoodEntry;
};

export default function VaultScreen() {
  const [data, setData] = React.useState<Data>();
  const date = useLocalSearchParams().date as string;

  const fetchData = async () => {
    try {
      const guidedJournal = await getGuidedJournalEntry(date);
      const journal = await getJournalEntry(date);
      const mood = await getMoodEntry(date);
      setData({
        journal,
        guidedJournal,
        mood,
      });
    } catch (error) {
      console.error("Failed to fetch journal entry:", error);
    }
  };

  useHydratedEffect(() => {
    fetchData();
  }, []);

  if (!data) {
    return null;
  }
  return (
    <ScrollView className="bg-blue100 flex-1">
      <TopNav />
      <View className="mb-8 px-4">
        <View>
          {/* Date Section */}
          <CustomText className="text-lg text-gray300 font-medium mt-8 ">
            {format(new Date(date), "EEEE")}
          </CustomText>
          <CustomText
            letterSpacing="tighter"
            className="text-4xl font-semibold mb-4"
          >
            {format(new Date(date), "dd MMM yyyy")}
          </CustomText>

          <View>
            {Object.values(data).every((entry) => entry == null) ? (
              <CustomText className="text-base text-gray300">
                No activity on this day.
              </CustomText>
            ) : (
              Object.entries(data).map(([key, entry]) => {
                if (!entry) return null;
                switch (key) {
                  case "journal":
                    return (
                      <JournalCard key={key} data={entry as JournalEntry} />
                    );
                  case "guidedWriting":
                    return (
                      <GuidedJournalCard
                        key={key}
                        data={entry as GuidedJournalEntry}
                      />
                    );
                  case "mood":
                    return <MoodCard key={key} data={entry as MoodEntry} />;
                  default:
                    return null;
                }
              })
            )}
          </View>
        </View>
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
