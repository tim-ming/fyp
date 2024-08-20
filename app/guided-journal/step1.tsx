import React from "react";
import { View, Text, TextInput, Pressable } from "react-native";
import { Link } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import CustomText from "@/components/CustomText";
import { Colors } from "@/constants/Colors";

const GuidedJournalStep1: React.FC = () => {
  return (
    <View className="flex-1 justify-between bg-blue100 px-2 pt-12">
      <View>
        <CustomText className="text-[16px] font-semibold text-center text-gray200">
          Wednesday
        </CustomText>
        <CustomText className="text-[20px] font-semibold text-center text-gray200">
          21 Aug 2024
        </CustomText>
      </View>

      <View className="flex-row justify-between items-center mt-6 mb-4 px-4">
        <View className="h-1 flex-1 bg-blue200 rounded-full mr-1" />
        <View className="h-1 flex-1 bg-gray-300 rounded-full mx-1" />
        <View className="h-1 flex-1 bg-gray-300 rounded-full mx-1" />
        <View className="h-1 flex-1 bg-gray-300 rounded-full ml-1" />
      </View>

      <CustomText className="mt-4 text-[20px] font-semibold text-gray-800 px-4">
        An unhelpful thought you have?
      </CustomText>

      <View className="mt-4 mx-2 p-4 bg-white rounded-3xl">
        <CustomText className=" text-black100 leading-6 text-[14px] ">
          {`What if...\nI should...\nI feel...\nI think...\nI am...`}
        </CustomText>
      </View>

      <TextInput
        className="mt-6 p-4 tracking-tight text-gray300 font-[PlusJakartaSans] text-base flex-grow rounded-md"
        placeholder="I can't stop overthinking about my..."
        multiline
        placeholderTextColor={Colors.gray100}
      />

      <View className="flex-1 justify-end mb-6 mx-2">
        <Link href="/guided-journal/step2" asChild>
          <Pressable className="h-14 bg-blue200 items-center justify-center rounded-full">
            <CustomText className="text-white text-base font-medium">
              Next
            </CustomText>
          </Pressable>
        </Link>
      </View>
    </View>
  );
};

export default GuidedJournalStep1;
