// Journal Entry Start Page
import React from "react";
import { View, Pressable } from "react-native";
import { Link, useLocalSearchParams } from "expo-router";
import CustomText from "@/components/CustomText";

const JournalStart: React.FC = () => {
  const { source } = useLocalSearchParams();

  return (
    <View className="flex-1 bg-blue100 px-2 pt-20">
      <View className="flex-1 justify-center items-center">
        <CustomText className="text-3xl font-semibold text-gray-800 mb-6 text-center">
          Journal
        </CustomText>
        <CustomText className="text-lg text-gray-600 mb-12 mx-2 leading-6 text-center">
          Reflect on your thoughts and emotions to help you explore your inner
          self.
        </CustomText>
      </View>

      <View className="flex-1 justify-end mb-6 mx-2">
        <Link
          href={{ pathname: "/patient/journal/entry", params: { source } }}
          asChild
          push
        >
          <Pressable className="h-14 bg-blue200 items-center justify-center rounded-full">
            <CustomText className="text-white text-base font-medium">
              Get Started
            </CustomText>
          </Pressable>
        </Link>
      </View>
    </View>
  );
};

export default JournalStart;
