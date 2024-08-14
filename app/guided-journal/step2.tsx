import React from 'react';
import { View, Text, TextInput, Pressable } from 'react-native';
import { Link } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import CustomText from '@/components/CustomText';

const GuidedJournalStep1: React.FC = () => {
  return (
    <View className="flex-1 bg-blue100 px-5 pt-12">
      <View>
        <CustomText className="text-[16px] font-semibold text-center text-gray200">Thursday</CustomText>
        <CustomText className="text-[20px] font-semibold text-center text-gray200">2 May 2024</CustomText>
      </View>

      <View className="flex-row justify-between items-center mt-6 mb-4 px-4">
        <View className="h-1 flex-1 bg-gray-300 rounded-full mr-1" />
        <View className="h-1 flex-1 bg-blue200 rounded-full mx-1" />
        <View className="h-1 flex-1 bg-gray-300 rounded-full mx-1" />
        <View className="h-1 flex-1 bg-gray-300 rounded-full ml-1" />
      </View>

      <CustomText className="mt-8 text-lg font-semibold text-gray-800 px-4">
        An unhelpful thought you have?
      </CustomText>

      <View className="mt-4 mx-2 p-4 bg-white rounded-lg">
        <CustomText className="text-base text-gray-500">
          {`What if...\nI should...\nI feel...\nI think...\nI am...`}
        </CustomText>
      </View>

      <TextInput
          className="mt-4 p-2 text-gray-800 text-base"
          placeholder="I can’t stop overthinking about my..."
          multiline
          placeholderTextColor="#8B8B8B"
        />

      <View className="flex-1 justify-end mb-12">
        <Link href="/guided-journal/step3" asChild>
          <Pressable className="h-14 bg-blue200 items-center justify-center rounded-full">
            <CustomText className="text-white text-base font-medium">
              Next
            </CustomText>
          </Pressable>
        </Link>
      </View>
    </View>
  );
};

export default GuidedJournalStep1;