import React, { useEffect, useState } from 'react';
import { View, Text, Pressable, ScrollView } from 'react-native';
import { Href, useRouter } from 'expo-router';
import { SafeAreaView } from "react-native-safe-area-context";
import TopNav from "@/components/TopNav";
import CustomText from '@/components/CustomText';

const ArticlePage = () => {
  const [articles, setArticles] = useState<{ id: string, title: string, subtitle: string, progress: string }[]>([
    { id: '1', title: 'Tackling Unhelpful Thoughts', subtitle: 'Strategies to challenge and reframe negative thought patterns.', progress: '1 / 3' },
    { id: '2', title: 'Understanding Anxiety', subtitle: 'Recognize the symptoms and triggers of anxiety.', progress: '0 / 4' },
    { id: '3', title: 'Introduction to CBT', subtitle: 'Learn about Cognitive Behavioral Therapy and how it helps.', progress: '2 / 4' },
    { id: '4', title: 'Coping Mechanisms for Depression', subtitle: 'Practical ways to manage and reduce symptoms of depression.', progress: '1 / 4' },
    { id: '5', title: 'Mindfulness and Relaxation', subtitle: 'Incorporate mindfulness techniques into your daily routine.', progress: '3 / 5' },
  ]);
  
  const router = useRouter();

  useEffect(() => {
    // use dummy value for now
  }, []);

  return (
    <SafeAreaView className="flex-1 bg-blue100">
      <TopNav />

      <View>
        <CustomText className="mb-6 text-[24px] font-semibold text-center text-gray200">
          Reading
        </CustomText>
      </View>

      <ScrollView>
        <CustomText className="px-4 text-[20px] font-semibold mb-4 text-gray200">Featured</CustomText>
        <View className="h-[300px] mx-4 mb-8 bg-white rounded-2xl shadow">
          <Pressable onPress={() => router.push(`/read/${articles[0].id}`)} className="flex-1 justify-center items-center">
            <View className="flex-1 justify-center items-center p-4">
              <CustomText className="text-[28px] text-gray300 font-medium text-center">{articles[0].title}</CustomText>
              <CustomText className="text-[15px] text-gray300 mt-6 text-center">{articles[0].subtitle}</CustomText>
            </View>
            <View className="absolute top-4 right-4">
              <CustomText className="text-sm text-gray100">{articles[0].progress}</CustomText>
            </View>
          </Pressable>
        </View>

      <View className="mb-4">
        <CustomText className="px-4 text-[20px] font-semibold mb-4 text-gray200">Popular</CustomText>
        <ScrollView contentContainerStyle={{ paddingLeft: 16 }} horizontal showsHorizontalScrollIndicator={false}>
          {articles.map((article, index) => (
            <Pressable
              key={index}
              className="mr-4 bg-white rounded-2xl shadow justify-center items-center p-4 h-[250px] w-[250px]"
              onPress={() => router.push(`/read/${article.id}`)}
            >
              <View className="flex-1 justify-center items-center">
                <CustomText className="text-[22px] font-medium text-gray300 text-center">{article.title}</CustomText>
                <CustomText className="text-[13px] text-gray300 mt-2 text-center">{article.subtitle}</CustomText>
              </View>
              <View className="absolute top-4 right-4">
                <CustomText className="text-sm text-gray100">{article.progress}</CustomText>
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
