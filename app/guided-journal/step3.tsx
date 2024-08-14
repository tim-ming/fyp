import React from 'react';
import { View, Text, TextInput, Pressable } from 'react-native';
import { Link } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import CustomText from '@/components/CustomText';

const GuidedJournalStep3: React.FC = () => {
  return (
    <View className="flex-1 justify-between bg-blue100 px-2 pt-12">
      <View>
        <CustomText className="text-[16px] font-semibold text-center text-gray200">Thursday</CustomText>
        <CustomText className="text-[20px] font-semibold text-center text-gray200">2 May 2024</CustomText>
      </View>

      <View className="flex-row justify-between items-center mt-6 mb-4 px-2">
        <View className="h-1 flex-1 bg-blue200 rounded-full mr-1" />
        <View className="h-1 flex-1 bg-blue200 rounded-full mx-1" />
        <View className="h-1 flex-1 bg-blue200 rounded-full mx-1" />
        <View className="h-1 flex-1 bg-gray-300 rounded-full ml-1" />
      </View>

      <CustomText className="mt-4 text-[20px] font-semibold text-gray-800 px-4">
        Challenge your thoughts!
      </CustomText>

      <View className="mt-4 mx-2 p-4 bg-white rounded-3xl">
        <CustomText className=" text-base text-gray300 text-[14px] ">
          {`Realising your thought [I can’t stop overthinking about my...] is distorted in these ways:
Fortune-telling, Catastrophising.\n
Think about it again. Oppose your thoughts rationally.`}
        </CustomText>
      </View>

      <TextInput
          className="mt-6 p-4 text-gray-800 text-base flex-grow rounded-md"
          placeholder="It’s helpful to think this way perhaps, although..."
          multiline
          placeholderTextColor="#535353"
        />

      <View className="flex-1 justify-end mb-6 mx-2">
        <Link href="/guided-journal/step4" asChild>
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

export default GuidedJournalStep3;