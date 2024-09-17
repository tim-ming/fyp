import articlesData from "@/assets/articles/articles.json";
import CustomText from "@/components/CustomText";
import { shadows } from "@/constants/styles";
import { useAuth } from "@/state/auth";
import { loadChapterProgress } from "@/utils/progressStorage";
import { useFocusEffect, useRouter } from "expo-router";
import React, { useCallback, useState } from "react";
import { Pressable, ScrollView, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const ArticlePage = () => {
  const router = useRouter();
  const auth = useAuth();

  const [articles, setArticles] = useState(
    articlesData.articles.map((article) => ({
      id: article.id,
      title: article.title,
      subtitle: article.subtitle,
      chapters: article.chapters,
      progress: "0",
    }))
  );

  const fetchProgress = async () => {
    const updatedArticles = await Promise.all(
      articles.map(async (article) => {
        if (!auth.user?.id) {
          console.error("User ID is undefined");
          return;
        }
        const progress = await loadChapterProgress(
          auth.user?.id.toString(),
          article.id
        );

        const chapterProgress = progress
          ? Object.entries(progress).filter(
              ([key, value]) =>
                key !== "lastReadChapterId" && key !== "lastReadPageId" && value
            ).length
          : 0;

        return { ...article, progress: chapterProgress.toString() };
      })
    );

    const filteredArticles = updatedArticles.filter(
      (article) => article !== undefined
    ) as {
      id: string;
      title: string;
      subtitle: string;
      chapters: {
        id: string;
        title: string;
        subtitle: string;
        pages: {
          page_number: number;
          content: string;
        }[];
      }[];
      progress: string;
    }[];

    // Sort articles by progress
    filteredArticles.sort((a, b) => {
      return parseInt(b.progress) - parseInt(a.progress);
    });

    setArticles(filteredArticles);
  };

  useFocusEffect(
    useCallback(() => {
      fetchProgress();
    }, [])
  );

  return (
    <SafeAreaView className="flex-1 bg-blue100">
      <View>
        <CustomText
          letterSpacing="tight"
          className="mb-6 text-2xl font-medium text-center text-black200"
        >
          Reading
        </CustomText>
      </View>

      <ScrollView>
        <View
          style={shadows.card}
          className="my mx-4 rounded-2xl bg-white shadow"
        >
          <Pressable
            onPress={() => router.push(`/read/${articles[0].id}`)}
            className="flex-1 pt-16 pb-4 justify-center items-center"
          >
            <View className="flex-1 justify-center items-center p-4">
              <CustomText
                letterSpacing="tighter"
                className="text-[28px] leading-8 text-gray300 font-medium text-center"
              >
                {articles[0].title}
              </CustomText>
              <CustomText
                letterSpacing="tight"
                className="max-w-[80%] text-[15px] leading-4 text-gray300 mt-6 text-center"
              >
                {articles[0].subtitle}
              </CustomText>
            </View>
            <View className="absolute top-4">
              <CustomText className="text-sm text-gray300">FEATURED</CustomText>
            </View>
            <View className="absolute top-4 right-4">
              <CustomText className="text-sm text-gray100">
                {articles[0].progress} / {articles[0].chapters.length}
              </CustomText>
            </View>
          </Pressable>
        </View>

        <View className="mt-10">
          <CustomText
            letterSpacing="tighter"
            className="px-4 text-3xl font-medium text-gray200"
          >
            Popular
          </CustomText>
          <ScrollView
            contentContainerStyle={{ padding: 16 }}
            horizontal
            showsHorizontalScrollIndicator={false}
          >
            {articles.map((article, index) => (
              <Pressable
                key={index}
                style={shadows.card}
                className="mr-4 bg-white shadow rounded-2xl justify-center items-center p-4 h-[250px] w-[250px]"
                onPress={() => router.push(`/read/${article.id}`)}
              >
                <View className="flex-1 justify-center items-center pt-8 gap-y-4">
                  <CustomText
                    letterSpacing="tight"
                    className="text-[22px] leading-6 font-medium text-gray300 text-center"
                  >
                    {article.title}
                  </CustomText>
                  <CustomText className="text-sm leading-4 text-gray300 text-center">
                    {article.subtitle}
                  </CustomText>
                </View>
                <View className="absolute top-4 right-4">
                  <CustomText className="text-sm text-gray100">
                    {article.progress} / {article.chapters.length}
                  </CustomText>
                </View>
              </Pressable>
            ))}
          </ScrollView>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default ArticlePage;
