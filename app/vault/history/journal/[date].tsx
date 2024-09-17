import { getJournalEntry } from "@/api/api";
import CustomText from "@/components/CustomText";
import { useHydratedEffect } from "@/hooks/hooks";
import { JournalEntry } from "@/types/models";
import { useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function JournalScreen() {
  const insets = useSafeAreaInsets();
  const date = useLocalSearchParams().date as string;
  const [entry, setEntry] = useState<JournalEntry | null>(null);

  const fetchEntry = async () => {
    try {
      const data = await getJournalEntry(date);
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
          Journal
        </CustomText>
        <CustomText className="text-lg leading-5 font-medium mb-2 text-black100">
          {entry.title}
        </CustomText>

        <CustomText className="text-gray200 text-base">{entry.body}</CustomText>
      </View>
    </ScrollView>
  );
}
