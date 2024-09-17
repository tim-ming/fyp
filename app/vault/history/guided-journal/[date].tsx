import { getGuidedJournalEntry, getJournalEntry } from "@/api/api";
import { STEPS_TEXT } from "@/app/guided-journal/constants";
import CustomText from "@/components/CustomText";
import { useHydratedEffect } from "@/hooks/hooks";
import { GuidedJournalEntry, JournalEntry } from "@/types/models";
import { useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function GuidedJournalScreen() {
  const insets = useSafeAreaInsets();
  const date = useLocalSearchParams().date as string;
  const [entry, setEntry] = useState<GuidedJournalEntry | null>(null);

  const fetchEntry = async () => {
    try {
      const data = await getGuidedJournalEntry(date);
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
        <CustomText className="text-3xl mt-4 mb-10 font-medium text-black200">
          Guided Journal
        </CustomText>

        <CustomText className="text-lg leading-5 font-medium mb-2 text-black100">
          {STEPS_TEXT.ONE}
        </CustomText>
        <CustomText className="text-gray200 text-base">
          {entry.body.step1_text}
        </CustomText>

        <CustomText className="text-lg mt-12 leading-6 font-medium mb-2 text-black100">
          {STEPS_TEXT.TWO}
        </CustomText>
        <CustomText className="text-gray200 text-base">
          {entry.body.step2_selected_distortions?.join(", ")}
        </CustomText>

        <CustomText className="text-lg mt-12 leading-6 font-medium mb-2 text-black100">
          {STEPS_TEXT.THREE}
        </CustomText>
        <CustomText className="text-gray200 text-base">
          {entry.body.step3_text}
        </CustomText>

        <CustomText className="text-lg mt-12 leading-6 font-medium mb-2 text-black100">
          {STEPS_TEXT.FOUR}
        </CustomText>
        <CustomText className="text-gray200 text-base">
          {entry.body.step4_text}
        </CustomText>
      </View>
    </ScrollView>
  );
}
