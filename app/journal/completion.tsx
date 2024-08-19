import React from 'react';
import { View, Pressable } from 'react-native';
import { Link } from 'expo-router';
import CustomText from '@/components/CustomText';
import { useRoute, RouteProp } from '@react-navigation/native';

const _months = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];
const getMonth = (month: number) =>
  month >= 0 && month < 12 ? _months[month] : "???";

const _days = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];
const getDay = (day: number) =>
  (day >= 0 && day < 7 ? _days[day] : "???").toUpperCase();

const JournalComplete: React.FC = () => {
  const today = new Date();

  return (
    <View className="flex-1 bg-blue100 px-2 pt-20">
      <View className="flex-1 justify-center items-center my-60">
        <CustomText className="text-[24px] font-medium text-gray300 text-center">
          {`Journal completed.`}
        </CustomText>
        <CustomText className="text-[16px] font-light text-gray300 mt-20 text-center">
          Recorded on
        </CustomText>
        <CustomText className="text-[20px] font-medium text-gray300 mt-3 text-center">
          {`${today.getDate()} ${getMonth(today.getMonth())} ${today.getFullYear()}`}
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

export default JournalComplete;