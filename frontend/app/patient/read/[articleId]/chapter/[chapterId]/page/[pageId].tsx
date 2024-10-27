// Reading Page
import articlesData from "@/assets/articles/articles.json";
import ArrowLeft from "@/assets/icons/arrow-left.svg";
import ArrowRight from "@/assets/icons/arrow-right.svg";
import CustomText from "@/components/CustomText";
import { useHydratedEffect } from "@/hooks/hooks";
import { useAuth } from "@/state/auth";
import {
  clearAllData,
  loadChapterProgress,
  saveChapterProgress,
} from "@/utils/progressStorage";
import { Href, useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect } from "react";
import { Pressable, ScrollView, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const ReadingPage = () => {
  const router = useRouter();
  const auth = useAuth();
  const { articleId, chapterId, pageId } = useLocalSearchParams();

  const article = articlesData.articles.find(
    (article) => article.id === articleId
  );
  const chapter = article?.chapters.find((chapter) => chapter.id === chapterId);
  const chapterTitle = chapter?.title || "";
  const chapterSubtitle = chapter?.subtitle || "";
  const pages = chapter?.pages || [];
  const totalPages = pages.length;
  const pageIdInt = parseInt(pageId as string);

  /**
   * Fetch progress from storage and update it
   */
  const fetchProgress = async () => {
    if (!auth.user?.id) {
      console.error("User ID is undefined");
      return;
    }
    const progress = await loadChapterProgress(
      auth.user?.id.toString(),
      articleId as string
    );
    const updatedProgress = progress || {};

    if (!updatedProgress[chapterId as string]) {
      if (pageIdInt === totalPages) {
        updatedProgress[chapterId as string] = true;
        await saveChapterProgress(
          auth.user?.id.toString(),
          articleId as string,
          chapterId as string,
          true,
          chapterId as string,
          pageId as string
        );
      } else {
        updatedProgress[chapterId as string] = false;
        await saveChapterProgress(
          auth.user?.id.toString(),
          articleId as string,
          chapterId as string,
          false,
          chapterId as string,
          pageId as string
        );
      }
    }
  };

  // Fetch progress on page load
  useHydratedEffect(() => {
    fetchProgress();
  }, [articleId, pageIdInt, totalPages, chapterId]);

  return (
    <SafeAreaView className="flex-1 bg-blue100">
      <View className="mt-[68px]">
        <CustomText className="text-center font-medium text-lg text-gray300">
          {chapterTitle}
        </CustomText>
        <View className="h-[1px] bg-[#E7E2DE] mt-[13px]" />
      </View>

      <ScrollView className="px-4">
        <CustomText
          letterSpacing="tighter"
          className="text-[28px] leading-8 text-black200 font-medium mt-[26px] mb-6"
        >
          {chapterSubtitle}
        </CustomText>
        <CustomText className="text-base text-black100 leading-6 mb-4">
          {pages[pageIdInt - 1].content}
        </CustomText>
      </ScrollView>

      <View className="flex-row justify-between items-center bg-white p-6">
        <Pressable
          className={`justify-center items-center h-[50px] w-[50px] ${
            pageIdInt === 1 ? "bg-gray-200" : "bg-white border-2 border-blue200"
          } rounded-full`}
          disabled={pageIdInt === 1}
          onPress={() =>
            router.push(
              `/patient/read/${articleId}/chapter/${chapterId}/page/${
                pageIdInt - 1
              }`
            )
          }
        >
          <ArrowLeft
            width={32}
            height={32}
            stroke={pageIdInt === 1 ? "rgba(0, 0, 0, 0.3)" : "#3373B0"}
          />
        </Pressable>

        <View className="flex-1 justify-center items-center gap-2">
          <CustomText className="text-base font-medium text-black200">
            {pageId} / {totalPages}
          </CustomText>
          <CustomText className="max-w-[200px] font-medium text-sm leading-4  text-gray300 text-center">
            {chapterSubtitle}
          </CustomText>
        </View>

        <Pressable
          className={`justify-center items-center h-[50px] w-[50px] ${
            pageIdInt === totalPages ? "bg-gray-200" : "bg-blue200"
          } rounded-full`}
          disabled={pageIdInt === totalPages}
          onPress={() =>
            router.push(
              `/patient/read/${articleId}/chapter/${chapterId}/page/${
                pageIdInt + 1
              }`
            )
          }
        >
          <ArrowRight
            width={32}
            height={32}
            stroke={pageIdInt === totalPages ? "rgba(0, 0, 0, 0.3)" : "#FFFFFF"}
          />
        </Pressable>
      </View>
    </SafeAreaView>
  );
};

export default ReadingPage;
