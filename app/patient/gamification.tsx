import { shadows } from "@/constants/styles";
import React from "react";
import { View, ScrollView } from "react-native";
import CustomText from "@/components/CustomText";
import { Colors } from "@/constants/Colors";
import ProgressBar from "@/components/ProgressBar";
import { Image } from "expo-image";
import { getUser, getStats } from "@/api/api";
import { countArticlesRead, countPagesRead } from "@/utils/progressStorage";
import { useAuth } from "@/state/auth";
import { useHydratedEffect } from "@/hooks/hooks";

const Gamification = () => {
  const [loading, setLoading] = React.useState(true);
  const [stats, setStats] = React.useState({
    journal_count: 0,
    guided_journal_count: 0,
    streak: 0,
    last_login: "",
    articles_read: 0,
    pages_read: 0,
  });
  const auth = useAuth();

  useHydratedEffect(() => {
    const fetchData = async () => {
      try {
        const statsData = await getStats();
        const user = auth.user;
        const articlesRead = await countArticlesRead(user!.id.toString());
        const pagesRead = await countPagesRead(user!.id.toString());
        setStats({
          journal_count: statsData.journal_count,
          guided_journal_count: statsData.guided_journal_count,
          streak: statsData.streak,
          last_login: statsData.last_login,
          articles_read: articlesRead,
          pages_read: pagesRead,
        });
        setLoading(false);
      } catch (error) {
        console.error("Error fetching data:", error);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const badges = [
    {
      title: "Newbie Journalist",
      progress: stats.journal_count,
      total: 25,
      description: "Write @ Journals.",
    },
    {
      title: "Typewriter",
      progress: stats.journal_count,
      total: 40,
      description: "Write @ Journals.",
    },
    {
      title: "Pro Journalist",
      progress: stats.journal_count,
      total: 200,
      description: "Write @ Journals.",
    },
    {
      title: "Baby Reader",
      progress: stats.articles_read,
      total: 10,
      description: "Complete @ articles.",
    },
    {
      title: "Story Teller",
      progress: stats.guided_journal_count,
      total: 200,
      description: "Write @ Guided Journals.",
    },
    {
      title: "Avid Reader",
      progress: stats.pages_read,
      total: 200,
      description: "Read @ pages of articles.",
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

  if (loading) {
    return (
      <View className="flex-1 bg-blue100 items-center justify-center">
        <CustomText className="text-black text-[20px] font-semibold">
          Loading...
        </CustomText>
      </View>
    );
  }

  const date = new Date(stats.last_login);
  date.setDate(date.getDate() - stats.streak + 1);

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
        <CustomText className="text-6xl font-bold text-center">
          {stats.streak}
        </CustomText>
        <CustomText
          letterSpacing="tight"
          className="text-base font-medium text-center text-gray300"
        >
          {stats.streak === 1 || stats.streak === 0 ? "Day" : "Days"} streak
        </CustomText>
        <View className="items-center justify-center">
          <CustomText className="text-sm leading-4 text-center text-gray200 mt-2">
            {stats.last_login && stats.streak > 0
              ? `Your streak started on \n${date.toLocaleDateString()}.`
              : "Start your streak today!"}
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
