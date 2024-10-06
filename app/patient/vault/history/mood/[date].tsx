import { getJournalEntry, getMoodEntry } from "@/api/api";
import CustomText from "@/components/CustomText";
import { getStatus } from "@/constants/globals";
import { useHydratedEffect } from "@/hooks/hooks";
import { JournalEntry, MoodEntry } from "@/types/models";
import { useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function MoodScreen() {
  const insets = useSafeAreaInsets();
  const date = useLocalSearchParams().date as string;
  const [entry, setEntry] = useState<MoodEntry | null>(null);

  const fetchEntry = async () => {
    try {
      const data = await getMoodEntry(date);
      setEntry(data);
    } catch (error) {
      console.error("Failed to fetch journal entry:", error);
    }
  };

  useHydratedEffect(() => {
    fetchEntry();
  }, []);

  if (!entry) {
    return null;
  }

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
      <View className=" px-4 pt-16">
        <CustomText
          letterSpacing="wide"
          className="text-gray100 text-lg font-medium"
        >{`${entry.date}`}</CustomText>
        <CustomText className="text-3xl mt-4 mb-10 font-semibold text-black200">
          Tracking
        </CustomText>
        <CustomText className="text-lg leading-6 font-medium mb-2 text-black100">
          Mood
        </CustomText>

        <CustomText className="text-gray200 text-base">{`You felt ${getStatus(
          entry.mood
        )}. (${entry.mood})`}</CustomText>
        <CustomText className="text-lg mt-12 leading-6 font-medium mb-2 text-black100">
          Sleep
        </CustomText>

        <CustomText className="text-gray200 text-base">{`You slept ${getStatus(
          entry.sleep
        )}. (${entry.sleep})`}</CustomText>
        <CustomText className="text-lg mt-12 leading-6 font-medium mb-2 text-black100">
          Appetite
        </CustomText>

        <CustomText className="text-gray200 text-base">{`You ate ${getStatus(
          entry.eat
        )}. (${entry.eat})`}</CustomText>
      </View>
    </ScrollView>
  );
}
