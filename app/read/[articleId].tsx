import React, { useCallback, useEffect, useState } from "react";
import { View, Pressable, ScrollView } from "react-native";
import {
  Href,
  useRouter,
  useLocalSearchParams,
  useFocusEffect,
} from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import Check from "@/assets/icons/check.svg";
import CustomText from "@/components/CustomText";
import ChevronRight from "@/assets/icons/chevron-right.svg";
import articlesData from "@/assets/articles/articles.json";
import { loadChapterProgress } from "@/utils/progressStorage";

const ArticleProgressPage = () => {
  const router = useRouter();
  const { articleId } = useLocalSearchParams();

  const article = articlesData.articles.find(
    (article) => article.id === articleId
  );
  const title = article?.title || "";
  const description = article?.description || "";
  const chapters = article?.chapters || [];

  const [progress, setProgress] = useState<Record<string, boolean | string>>(
    {}
  );

  const getChapterToGo = () => {
    return progress.lastReadChapterId ? progress.lastReadChapterId : "1";
  };

  const getPageToGo = () => {
    return progress.lastReadPageId ? progress.lastReadPageId : "1";
  };

  const fetchProgress = async () => {
    const chapterProgress = await loadChapterProgress(articleId as string);
    setProgress(chapterProgress || {});
  };

  useFocusEffect(
    useCallback(() => {
      fetchProgress();
    }, [])
  );

  return (
    <SafeAreaView className="flex-1 bg-blue100">
      <View className="px-[16px] mt-[68px]">
        <CustomText
          letterSpacing="tighter"
          className="text-[32px] leading-8 font-medium text-black"
        >
          {title}
        </CustomText>
        <CustomText className="text-base leading-5 text-gray300 mt-[25px]">
          {description}
        </CustomText>
        <View className="flex-row justify-between items-center mt-[34px]">
          <CustomText className="text-gray300 text-base">{`${
            Object.entries(progress).filter(
              ([key, value]) =>
                key !== "lastReadChapterId" && key !== "lastReadPageId" && value
            ).length
          } lessons read`}</CustomText>
          <Pressable
            onPress={() => {
              router.push(
                `/read/${articleId}/chapter/${getChapterToGo()}/page/${getPageToGo()}` as Href<string>
              );
            }}
          >
            <View className="flex-row items-center gap-1">
              <CustomText className="text-blue200 text-base">
                Continue
              </CustomText>
              <ChevronRight
                width={20}
                height={20}
                className=" stroke-blue200"
              />
            </View>
          </Pressable>
        </View>
        <View className="h-[1px] bg-[#E7E2DE] mt-[10px]" />
      </View>

      <ScrollView
        contentContainerStyle={{ alignItems: "center", paddingTop: 24 }}
      >
        {chapters.map((chapter, index) => (
          <Pressable
            key={index}
            className="h-[300px] w-[320px] mb-6 p-4 bg-white rounded-2xl shadow-lg flex-row justify-between items-center"
            onPress={() =>
              router.push(
                `/read/${articleId}/chapter/${index + 1}/page/1` as Href<string>
              )
            }
          >
            <CustomText className="absolute top-4 left-4 text-[24px] text-gray200 mr-4">{`0${
              index + 1
            }`}</CustomText>
            <View className="flex-1 justify-center items-center p-4">
              <CustomText
                letterSpacing="tight"
                className="text-[28px] leading-8 mb-8 text-gray300 font-medium text-center"
              >
                {chapter.title}
              </CustomText>
              <CustomText className="text-base  leading-5  text-gray200 text-center">
                {chapter.subtitle}
              </CustomText>
            </View>
            {progress[(index + 1).toString()] && (
              <View className="absolute top-5 right-5">
                <Check width={24} height={24} />
              </View>
            )}
          </Pressable>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
};

export default ArticleProgressPage;
