import React from "react";
import { View, Pressable } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { useRoute } from "@react-navigation/native";
import CustomText from "@/components/CustomText";
import { format } from "date-fns";

const JournalComplete: React.FC = () => {
  const today = new Date();
  const { source } = useLocalSearchParams();

  const handleComplete = () => {
    const target = source === "/" ? "/" : "/(tabs)/explore";

    router.push({
      pathname: target,
      params: {
        newJournalAdded: 1,
      },
    });
  };

  return (
    <View className="flex-1 bg-blue100 px-2 pt-20">
      <View className="flex-1 justify-center items-center my-60">
        <CustomText className="text-[24px] font-medium text-gray300 text-center">
          {`Journal completed.`}
        </CustomText>
        <CustomText className="text-[16px] font-light text-gray300 mt-20 text-center">
          Recorded on
        </CustomText>
        <CustomText className="text-[20px] font-medium text-gray300 mt-3 text-center">
          {format(today, "dd MMM yyyy")}
        </CustomText>
      </View>

      <View className="flex-1 justify-end mb-6 mx-2">
        <Pressable
          onPress={handleComplete}
          className="h-14 bg-blue200 items-center justify-center rounded-full"
        >
          <CustomText className="text-white text-base font-medium">
            Complete
          </CustomText>
        </Pressable>
      </View>
    </View>
  );
};

export default JournalComplete;
