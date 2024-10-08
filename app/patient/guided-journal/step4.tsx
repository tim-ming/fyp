import React, { useEffect, useState } from "react";
import { View, TextInput, Pressable } from "react-native";
import { router } from "expo-router";
import CustomText from "@/components/CustomText";
import { Colors } from "@/constants/Colors";
import { getGuidedJournalEntry, postGuidedJournalEntry } from "@/api/api";
import { GuidedJournalEntryCreate } from "@/types/models";
import { useJournalStore } from "@/state/data";
import { capitalizeFirstLetter, getDayOfWeek } from "@/utils/helpers";
import { format } from "date-fns";
import { useHydratedEffect } from "@/hooks/hooks";
import { STEPS_TEXT } from "./constants";

const GuidedJournalStep4: React.FC = () => {
  const today = new Date();
  const date = format(today, "yyyy-MM-dd");

  const { guidedJournalEntry, setGuidedJournalEntry } = useJournalStore();
  const [step4Text, setStep4Text] = useState<string>(
    guidedJournalEntry?.step4_text || ""
  );

  useHydratedEffect(() => {
    if (guidedJournalEntry?.step4_text) return;
    const fetchData = async () => {
      const data = await getGuidedJournalEntry(date);
      if (data) {
        setStep4Text(data.body.step4_text ?? "");
        setGuidedJournalEntry({
          ...data.body,
          step4_text: data.body.step4_text ?? "",
        });
      }
    };
    fetchData();
  }, []);

  const handleNext = () => {
    const updatedEntry = {
      ...guidedJournalEntry,
      step4_text: step4Text,
    };

    setGuidedJournalEntry(updatedEntry);
    postGuidedJournalEntry({
      body: updatedEntry,
      date: date,
    } as GuidedJournalEntryCreate);

    router.push("/patient/guided-journal/completion");
  };

  return (
    <View className="flex-1 justify-between bg-blue100 px-2 pt-12">
      <View>
        <CustomText className="text-[16px] font-semibold text-center text-gray200">
          {capitalizeFirstLetter(getDayOfWeek(today.toISOString()))}
        </CustomText>
        <CustomText className="text-[20px] font-semibold text-center text-gray200">
          {format(date, "dd MMM yyyy")}
        </CustomText>
      </View>

      <View className="flex-row justify-between items-center mt-6 mb-4 px-4">
        <View className="h-1 flex-1 bg-blue200 rounded-full mr-1" />
        <View className="h-1 flex-1 bg-blue200 rounded-full mx-1" />
        <View className="h-1 flex-1 bg-blue200 rounded-full mx-1" />
        <View className="h-1 flex-1 bg-blue200 rounded-full ml-1" />
      </View>

      <CustomText className="mt-4 text-[20px] font-semibold text-gray-800 px-4">
        {STEPS_TEXT.FOUR}
      </CustomText>

      <View className="mt-4 mx-2 p-4 bg-white rounded-3xl">
        <CustomText className=" text-black100 leading-4 text-[14px] ">
          {`What thoughts can you replace your current thought with?`}
        </CustomText>
      </View>

      <TextInput
        className="mt-6 p-4 tracking-tight text-gray300 font-[PlusJakartaSans] text-base flex-grow rounded-md"
        placeholder="I'm not sure, maybe I will be able to find out tomorrow..."
        multiline
        placeholderTextColor={Colors.gray100}
        value={step4Text}
        onChangeText={(text) => setStep4Text(text)}
      />

      <View className="flex-1 justify-end mb-6 mx-2">
        <Pressable
          onPress={handleNext}
          className="h-14 bg-blue200 items-center justify-center rounded-full"
        >
          <CustomText className="text-white text-base font-medium">
            Finish thought
          </CustomText>
        </Pressable>
      </View>
    </View>
  );
};

export default GuidedJournalStep4;
