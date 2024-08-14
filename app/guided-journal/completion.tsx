import React from 'react';
import { View, Pressable } from 'react-native';
import { Link } from 'expo-router';
import CustomText from '@/components/CustomText';

const GuidedWritingStart: React.FC = () => {
  return (
    <View className="flex-1 bg-blue100 px-5 pt-20">
      <View className="flex-1 justify-center items-center">
        <CustomText className="text-3xl font-semibold text-gray-800 mb-6 text-center">
          Welcome to Guided Writing
        </CustomText>
        <CustomText className="text-lg text-gray-600 mb-12 text-center">
          Reflect on your thoughts and emotions as you navigate through guided prompts designed to help you explore your inner self.
        </CustomText>
      </View>

      <View className="flex-1 justify-end mb-12">
        <Link href="/(tabs)/explore" asChild>
          <Pressable className="h-14 bg-blue200 items-center justify-center rounded-full">
            <CustomText className="text-white text-base font-medium">
              Complete
            </CustomText>
          </Pressable>
        </Link>
      </View>
    </View>
  );
};

export default GuidedWritingStart;