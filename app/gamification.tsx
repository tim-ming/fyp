import { shadows } from "@/constants/styles";
import React from "react";
import { View, ScrollView } from "react-native";
import CustomText from "@/components/CustomText";
import { Colors } from "@/constants/Colors";
import ProgressBar from "@/components/ProgressBar";

const Gamification = () => {
  return (
    <ScrollView className="flex-1 bg-blue-50 p-4 pt-20">
      {/* Streak Card */}
      <View
        style={shadows.card}
        className="bg-white rounded-2xl shadow-lg p-6 mb-6"
      >
        <CustomText className="text-5xl font-bold text-center">7</CustomText>
        <CustomText
          letterSpacing="tight"
          className="text-[20px] font-medium text-center text-gray300"
        >
          Days streak
        </CustomText>
        <View className="items-center justify-center mt-4">
          <CustomText className="text-sm max-w-[50%] leading-4 text-center text-gray200 mt-2">
            Your streak started on 25 Apr this year.
          </CustomText>
        </View>
      </View>

      {/* Badges List */}
      <View>
        {/* Newbie Journalist Badge */}
        <BadgeCard title="Newbie Journalist" progress={6} total={10} />

        {/* Emotional Journalist Badge */}
        <BadgeCard title="Emotional Journalist" progress={6} total={40} />

        {/* Pro Journalist Badge */}
        <BadgeCard title="Pro Journalist" progress={6} total={200} />
      </View>
    </ScrollView>
  );
};

interface BadgeCardProps {
  title: string;
  progress: number;
  total: number;
}

const BadgeCard: React.FC<BadgeCardProps> = ({ title, progress, total }) => {
  const progressPercentage = progress / total;

  return (
    <View
      style={shadows.card}
      className="bg-white my-1 flex-row rounded-2xl py-7 px-6 justify-between"
    >
      <View>
        <CustomText
          letterSpacing="tight"
          className="text-lg leading-6 font-medium text-black200"
        >
          {title}
        </CustomText>
        <CustomText className="text-sm text-gray-500">
          Write {total} Journals.
        </CustomText>
      </View>

      {/* Progress Row */}
      <View className="justify-center items-center">
        <CustomText className="text-lg leading-4 font-bold mb-3">
          {progress} / {total}
        </CustomText>
        <View className="w-20">
          <ProgressBar
            className="h-[5px] w-full bg-gray-300 rounded-full overflow-hidden"
            progress={progressPercentage}
            barStyle={{ backgroundColor: Colors.blue200 }}
          />
        </View>
      </View>
    </View>
  );
};

export default Gamification;
