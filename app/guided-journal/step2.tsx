import React, { useState } from 'react';
import { View, Text, TextInput, Pressable, ScrollView } from 'react-native';
import { Link } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import CustomText from '@/components/CustomText';

const distortionOptions = [
  { id: 1, title: 'Fortune-telling', description: '“I’m going to fail this interview.”' },
  { id: 2, title: 'Should statements', description: '“I should have known that.”' },
  { id: 3, title: 'Mind Reading', description: '“They don’t want to talk to me.”' },
  { id: 4, title: 'Catastrophising', description: '“I made a mistake, now they’re going to hate me.”' },
  { id: 5, title: 'Emotional Reasoning', description: '“I am anxious so I will stutter while talking.”' },
  { id: 6, title: 'All-or-Nothing Thinking', description: '“If I don’t succeed completely, I’m a total failure.”' },
  { id: 7, title: 'Black and White Thinking', description: '“I am a failure.”' },
  { id: 8, title: 'Personalisation', description: '“They are not talking to me because I am boring.”' },
  { id: 9, title: 'Discounting the Positive', description: '“They are only being nice to me because they have to.”' },
  { id: 10, title: 'Labelling', description: '“I am just a lazy person.”' },
];

const GuidedJournalStep2: React.FC = () => {
  const [selectedDistortions, setSelectedDistortions] = useState<number[]>([]);

  const handleSelectDistortion = (id: number): void => {
    setSelectedDistortions(prevSelected => 
      prevSelected.includes(id) 
        ? prevSelected.filter(distortionId => distortionId !== id) 
        : [...prevSelected, id]
    );
  };
  return (
    <View className="flex-1 bg-blue100 px-2 pt-12">
      <View>
        <CustomText className="text-[16px] font-semibold text-center text-gray200">Thursday</CustomText>
        <CustomText className="text-[20px] font-semibold text-center text-gray200">2 May 2024</CustomText>
      </View>

      <View className="flex-row justify-between items-center mt-6 mb-4 px-4">
        <View className="h-1 flex-1 bg-blue200 rounded-full mr-1" />
        <View className="h-1 flex-1 bg-blue200 rounded-full mx-1" />
        <View className="h-1 flex-1 bg-gray-300 rounded-full mx-1" />
        <View className="h-1 flex-1 bg-gray-300 rounded-full ml-1" />
      </View>

      <CustomText className="mt-4 text-[20px] font-semibold text-gray-800 px-4">
        Does your thought have distortions?
      </CustomText>

      <View className="mt-4 mx-2 p-4 bg-white rounded-3xl">
        <CustomText className=" text-base text-gray300 text-[14px] ">
          {`What if...\nI should...\nI feel...\nI think...\nI am...`}
        </CustomText>
      </View>

      <ScrollView className='mb-16 mt-4'>
        {distortionOptions.map((item) => (
            <Pressable
              key={item.id}
              onPress={() => handleSelectDistortion(item.id)}
              className={`p-4 rounded-3xl mb-4 mx-2 ${selectedDistortions.includes(item.id) ? 'bg-blue200' : 'bg-white'}`}
            >
              <CustomText className={`text-lg font-semibold ${selectedDistortions.includes(item.id) ? 'text-white' : 'text-gray-800'}`}>
                {item.title}
              </CustomText>
              <CustomText className={`text-base ${selectedDistortions.includes(item.id) ? 'text-white' : 'text-gray-500'}`}>
                {item.description}
              </CustomText>
            </Pressable>
          ))}
      </ScrollView>

      <View className="flex-1 justify-end mb-6 mx-2">
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

export default GuidedJournalStep2;