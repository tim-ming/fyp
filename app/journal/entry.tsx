import React from 'react';
import { View, Text, TextInput, Pressable } from 'react-native';
import { Link } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import CustomText from '@/components/CustomText';
import Ionicons from "@expo/vector-icons/Ionicons";
import Plus from "@/assets/icons/plus.svg";

const JournalEntry: React.FC = () => {
  return (
    <View className="flex-1 justify-between bg-blue100 px-2 pt-12">
      <View>
        <CustomText className="text-[16px] font-semibold text-center text-gray200">Thursday</CustomText>
        <CustomText className="text-[20px] font-semibold text-center text-gray200">2 May 2024</CustomText>
      </View>

        <View className="w-full pt-12 flex justify-center items-center">
            <View className="relative bg-white w-[210px] h-[270px] shadow-2xl rounded-3xl flex justify-center items-center">
                <View className="absolute rounded-full bg-white h-12 w-12 shadow-md flex justify-center items-center">
                    <Pressable>
                        <Plus width={28} height={28} stroke={"rgba(0, 0, 0, 0.7)"} />
                    </Pressable>
                </View>
                <CustomText className="absolute bottom-[39px] text-black text-[20px] font-normal">Add a photo</CustomText>
            </View>
        </View>

        <TextInput
          className="font-medium mt-14 px-4 text-gray-800 text-base h-[30px] rounded-md"
          placeholder="Lovely Day"
          multiline
          placeholderTextColor="#000000"
          style={{fontSize: 28}}
        />

      <TextInput
          className="font-normal px-4 py-1 text-gray-800 text-base flex-grow rounded-md"
          placeholder="Today was a lovely day..."
          multiline
          placeholderTextColor="#535353"
          style={{fontSize: 16}}
        />

      <View className="flex-1 justify-end mb-6 mx-2">
        <Link href="/journal/completion" asChild>
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

export default JournalEntry;