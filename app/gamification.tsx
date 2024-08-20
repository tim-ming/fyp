import { shadows } from "@/constants/styles";
import React from "react";
import { View, ScrollView } from "react-native";
import CustomText from "@/components/CustomText";
import { Colors } from "@/constants/Colors";
import ProgressBar from "@/components/ProgressBar";
import { Image } from "expo-image";

const Gamification = () => {
  // Step 1: Create an array of badge data objects with descriptions
  const badges = [
    {
      title: "Newbie Journalist",
      progress: 9,
      total: 10,
      description: "Write @ Journals.",
    },
    {
      title: "Typewriter",
      progress: 9,
      total: 40,
      description: "Write @ Journals.",
    },
    {
      title: "Pro Journalist",
      progress: 9,
      total: 200,
      description: "Write @ Journals.",
    },
    {
      title: "Baby Reader",
      progress: 9,
      total: 10,
      description: "Complete @ articles.",
    },
    {
      title: "Story Teller",
      progress: 6,
      total: 200,
      description: "Write @ Guided Journals.",
    },
    {
      title: "Avid Reader",
      progress: 135,
      total: 200,
      description: "Read @ pages of articles.",
    },
    {
      title: "New realm",
      progress: 0,
      total: 5,
      description: "Complete @ Meditations.",
    },
    {
      title: "Sage",
      progress: 0,
      total: 25,
      description: "Complete all Meditations.",
    },
  ];

  // Step 2: Calculate the progress percentage for each badge
  const badgesWithProgress = badges.map((badge) => ({
    ...badge,
    progressPercentage: badge.progress / badge.total,
  }));

  // Step 3: Sort the array by progress percentage
  const sortedBadges = badgesWithProgress.sort(
    (a, b) => b.progressPercentage - a.progressPercentage
  );

  return (
    <ScrollView className="flex-1 bg-blue100 px-4 py-16">
      <CustomText
        letterSpacing="tight"
        className="text-2xl font-semibold text-black200 pb-7"
      >
        Achievements
      </CustomText>
      {/* Streak Card */}
      <View
        style={shadows.card}
        className="bg-white rounded-2xl items-center justify-center shadow-lg p-6 mb-6"
      >
        <Image
          source={require("@/assets/images/doubleheart.png")}
          className="w-28 h-28 opacity-80"
        />
        <CustomText className="text-6xl font-bold text-center">7</CustomText>
        <CustomText
          letterSpacing="tight"
          className="text-base font-medium text-center text-gray300"
        >
          Days streak
        </CustomText>
        <View className="items-center justify-center">
          <CustomText className="text-sm max-w-[50%] leading-4 text-center text-gray200 mt-2">
            Your streak started on 25 Apr this year.
          </CustomText>
        </View>
      </View>

      {/* Badges List */}
      <View>
        {sortedBadges.map((badge, index) => (
          <BadgeCard
            key={index}
            title={badge.title}
            progress={badge.progress}
            total={badge.total}
            description={badge.description}
          />
        ))}
      </View>
    </ScrollView>
  );
};

interface BadgeCardProps {
  title: string;
  progress: number;
  total: number;
  description: string;
}

const BadgeCard: React.FC<BadgeCardProps> = ({
  title,
  progress,
  total,
  description,
}) => {
  const progressPercentage = progress / total;

  // Function to replace "@" with the total value
  const getDescription = (description: string, total: number) =>
    description.replace("@", total.toString());

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
          {getDescription(description, total)}
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
