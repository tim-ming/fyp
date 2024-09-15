import React, { useState } from "react";
import { View, TextInput, Pressable } from "react-native";
import { router } from "expo-router";
import CustomText from "@/components/CustomText";
import { Colors } from "@/constants/Colors";
import { postGuidedJournalEntry } from "@/api/api";
import { GuidedJournalEntryCreate } from "@/types/models";
import { useJournalStore } from "@/state/state";
import { capitalizeFirstLetter, getDayOfWeek } from "@/utils/helpers";
import { format } from "date-fns";

const GuidedJournalStep3: React.FC = () => {
  const today = new Date();
  const date = today.toISOString().split("T")[0];

  const { guidedJournalEntry, setGuidedJournalEntry } = useJournalStore();
  const [step3Text, setStep3Text] = useState<string>(
    guidedJournalEntry?.step3_text || ""
  );

  const handleNext = () => {
    const updatedEntry = {
      ...guidedJournalEntry,
      step3_text: step3Text,
    };

    setGuidedJournalEntry(updatedEntry);
    postGuidedJournalEntry({
      body: updatedEntry,
      date: today.toISOString().split("T")[0],
    } as GuidedJournalEntryCreate);

    router.push("/guided-journal/step4");
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
        <View className="h-1 flex-1 bg-gray-300 rounded-full ml-1" />
      </View>

      <CustomText className="mt-4 text-[20px] font-semibold text-gray-800 px-4">
        Challenge your thoughts!
      </CustomText>

      <View className="mt-4 mx-2 p-4 bg-white rounded-3xl">
        <CustomText className=" text-black100 leading-4 text-[14px] ">
          {`Realising your thought [I can't stop overthinking about my...] is distorted in these ways:\n
Fortune-telling, Catastrophising.\n
Think about it again. Oppose your thoughts rationally.`}
        </CustomText>
      </View>

      <TextInput
        className="mt-6 p-4 tracking-tight text-gray300 font-[PlusJakartaSans] text-base flex-grow rounded-md"
        placeholder="It's helpful to think this way perhaps, although..."
        multiline
        placeholderTextColor={Colors.gray100}
        value={step3Text}
        onChangeText={(text) => setStep3Text(text)}
      />

      <View className="flex-1 justify-end mb-6 mx-2">
        <Pressable
          onPress={handleNext}
          className="h-14 bg-blue200 items-center justify-center rounded-full"
        >
          <CustomText className="text-white text-base font-medium">
            Next
          </CustomText>
        </Pressable>
      </View>
    </View>
  );
};

export default GuidedJournalStep3;
