import React, { useEffect, useState } from 'react';
import { View, Pressable, ScrollView } from 'react-native';
import { Href, useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import Check from '@/assets/icons/check.svg';
import CustomText from '@/components/CustomText';

const ArticleProgressPage = () => {
  const router = useRouter();
  const { articleId } = useLocalSearchParams();

  const dummyChapters = {
    '1': {
      title: 'Tackling Unhelpful Thoughts',
      subtitle: 'Learn to identify and challenge negative thought patterns.',
      progress: '1 / 3',
      chapters: [
        { title: 'Understanding Unhelpful Thoughts', description: 'Learn about common cognitive distortions and how they affect your thinking.', done: true },
        { title: 'Challenging Negative Thoughts', description: 'Techniques to challenge and reframe negative thought patterns.', done: false },
        { title: 'Building Positive Thought Habits', description: 'Developing habits that promote positive thinking and resilience.', done: false },
      ],
    },
    '2': {
      title: 'Understanding Anxiety',
      subtitle: 'Recognize and manage symptoms and triggers of anxiety.',
      progress: '0 / 4',
      chapters: [
        { title: 'Recognizing Anxiety Symptoms', description: 'How to identify the physical and emotional signs of anxiety.', done: false },
        { title: 'Managing Anxiety Triggers', description: 'Strategies to manage and reduce anxiety triggers in daily life.', done: false },
        { title: 'Relaxation Techniques for Anxiety', description: 'Learn relaxation techniques to reduce anxiety symptoms.', done: false },
        { title: 'Relaxation Techniques for Anxiety', description: 'Learn relaxation techniques to reduce anxiety symptoms.', done: false },
      ],
    },
    '3': {
      title: 'Introduction to CBT',
      subtitle: 'A comprehensive guide to Cognitive Behavioral Therapy.',
      progress: '2 / 4',
      chapters: [
        { title: 'Introduction to CBT', description: 'An overview of Cognitive Behavioral Therapy and its benefits.', done: true },
        { title: 'CBT Techniques for Anxiety', description: 'Specific CBT techniques to manage anxiety.', done: true },
        { title: 'CBT Techniques for Depression', description: 'Using CBT to manage and reduce symptoms of depression.', done: false },
        { title: 'CBT Techniques for Depression', description: 'Using CBT to manage and reduce symptoms of depression.', done: false },
      ],
    },
    '4': {
      title: 'Coping Mechanisms for Depression',
      subtitle: 'Effective strategies for managing and reducing depression.',
      progress: '1 / 4',
      chapters: [
        { title: 'Identifying Depression Symptoms', description: 'Understanding the signs and symptoms of depression.', done: true },
        { title: 'Coping Strategies for Depression', description: 'Effective coping mechanisms for managing depression.', done: false },
        { title: 'Seeking Help for Depression', description: 'When and how to seek professional help for depression.', done: false },
        { title: 'Coping Strategies for Depression', description: 'Effective coping mechanisms for managing depression.', done: false },
      ],
    },
    '5': {
      title: 'Mindfulness and Relaxation',
      subtitle: 'Incorporate mindfulness into your daily routine for better mental health.',
      progress: '3 / 5',
      chapters: [
        { title: 'Introduction to Mindfulness', description: 'Learn the basics of mindfulness and its benefits.', done: true },
        { title: 'Mindfulness for Anxiety', description: 'How to use mindfulness techniques to manage anxiety.', done: true },
        { title: 'Mindfulness for Anxiety', description: 'How to use mindfulness techniques to manage anxiety.', done: true },
        { title: 'Mindfulness for Depression', description: 'Using mindfulness practices to alleviate depression symptoms.', done: false },
        { title: 'Mindfulness for Depression', description: 'Using mindfulness practices to alleviate depression symptoms.', done: false },
      ],
    },
  };

  const [title, setTitle] = useState<string>('');
  const [subtitle, setSubtitle] = useState<string>('');
  const [chapters, setChapters] = useState<{ title: string, description: string, done: boolean }[]>([]);
  const [progress, setProgress] = useState<string>('');

  useEffect(() => {
    const articleDetails = dummyChapters[articleId as keyof typeof dummyChapters];

    if (articleDetails) {
      setChapters(articleDetails.chapters);
      setTitle(articleDetails.title);
      setSubtitle(articleDetails.subtitle);
      setProgress(articleDetails.progress);
    }
  }, [articleId]);

  return (
    <SafeAreaView className="flex-1 bg-blue100">
      <View className="px-[16px] mt-[68px]">
        <CustomText className="text-[32px] font-medium text-black">
          {title}
        </CustomText>
        <CustomText className="text-[18px] text-gray300 mt-[25px]">
          {subtitle}
        </CustomText>
        <View className="flex-row justify-between items-center mt-[34px]">
          <CustomText className="text-gray300 text-[16px]">{`${progress} lessons read`}</CustomText>
          <Pressable onPress={() => router.push(`/read/${articleId}/chapter/1/page/1` as Href<string>)}>
            <CustomText className="text-blue-500 text-[16px]">Continue &gt;</CustomText>
          </Pressable>
        </View>
        <View className="h-[1px] bg-[#E7E2DE] mt-[10px]" />
      </View>

      <ScrollView contentContainerStyle={{ alignItems: 'center', paddingTop:24 }}>
        {chapters.map((chapter, index) => (
          <Pressable
            key={index}
            className="h-[300px] w-[320px] mb-6 p-4 bg-white rounded-2xl shadow-lg flex-row justify-between items-center"
            onPress={() => router.push(`/read/${articleId}/chapter/${index + 1}/page/1` as Href<string>)}
          >
            <CustomText className="absolute top-4 left-4 text-[24px] text-gray200 mr-4">{`0${index + 1}`}</CustomText>
            <View className="flex-1 justify-center items-center p-4">
              <CustomText className="text-[28px] mb-8 text-gray300 font-medium text-center">{chapter.title}</CustomText>
              <CustomText className="text[15px] text-gray300 text-center">{chapter.description}</CustomText>
            </View>
            {chapter.done && (
            <View className='absolute top-5 right-5'>
              <Check width={24} height={24}>✔</Check>
            </View>
            )}
          </Pressable>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
};

export default ArticleProgressPage;
