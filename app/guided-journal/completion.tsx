import React from 'react';
import { View, Pressable } from 'react-native';
import { Link } from 'expo-router';
import CustomText from '@/components/CustomText';

const GuidedWritingStart: React.FC = () => {
  return (
    <View className="flex-1 bg-blue100 px-2 pt-20">
      <View className="flex-1 justify-center items-center my-60">
        <CustomText className="text-[24px] font-medium text-gray300 text-center">
          {"Guided Journal\n completed."}
        </CustomText>
        <CustomText className="text-[16px] font-light text-gray300 mt-20 text-center">
          Recorded on
        </CustomText>
        <CustomText className="text-[20px] font-medium text-gray300 mt-3 text-center">
          2 May 2024
        </CustomText>
      </View>

      <View className="flex-1 justify-end mb-6 mx-2">
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