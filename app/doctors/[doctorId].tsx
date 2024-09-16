import React, { useState } from "react";
import { View, ScrollView, Pressable } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import CustomText from "@/components/CustomText";
import { SafeAreaView } from "react-native-safe-area-context";
import { Image } from "expo-image";
import doctorsData from "@/assets/data/doctors.json";
import { Doctor } from "@/types/globals";

const ICON_SIZE = 24;

const DoctorDetails = () => {
  const router = useRouter();
  const { doctorId } = useLocalSearchParams();
  const doctor = doctorsData[doctorId as string] as Doctor;
  const [dataShared, setDataShared] = useState(false);
  const share = () => {
    setDataShared(true);
  };
  const unshare = () => {
    setDataShared(false);
  };
  return (
    <SafeAreaView className="flex-1 bg-blue100">
      <ScrollView className="flex-1 p-4">
        <View className="flex-row justify-between items-center mb-6 mt-[65px]">
          <View className="flex-row items-center gap-5">
            <View className="p-1 w-16 h-16 items-center justify-center bg-gray-50 rounded-full">
              <Image
                className="w-full h-full rounded-full"
                source={`../assets/images/${doctor.image}`}
              />
            </View>
            <View className="flex-col">
              <CustomText className="text-[20px] font-medium text-black">
                {doctor.name}
              </CustomText>
              <CustomText className="text-gray300 text-[16px]">
                ID: {doctorId}
              </CustomText>
            </View>
          </View>
        </View>

        <View className="bg-white p-5 rounded-[20px] mb-8">
          <View className="flex-row items-center mt-1 mx-1 mb-4">
            <View className="flex-1">
              <CustomText className="text-[16px] text-gray100 mb-1">
                Date of Birth
              </CustomText>
              <CustomText className="text-[16px] text-black">
                {doctor.dob}
              </CustomText>
            </View>

            <View className="flex-1">
              <CustomText className="text-[16px] text-gray100 mb-1">
                Sex
              </CustomText>
              <CustomText className="text-[16px] text-black">
                {doctor.sex}
              </CustomText>
            </View>
          </View>

          <View className="flex-row items-center mt-1 mx-1 mb-4">
            <View className="flex-1">
              <CustomText className="text-[16px] text-gray100 mb-1">
                Qualifications
              </CustomText>
              <CustomText className="text-[16px] text-black">
                {doctor.qualifications}
              </CustomText>
            </View>
          </View>

          <View className="flex-row items-center mt-1 mx-1 mb-4">
            <View className="flex-1">
              <CustomText className="text-[16px] text-gray100 mb-1">
                Expertise
              </CustomText>
              <CustomText className="text-[16px] text-black">
                {doctor.expertise}
              </CustomText>
            </View>
          </View>

          <View className="flex-row items-center mt-1 mx-1 mb-4">
            <View className="flex-1">
              <CustomText className="text-[16px] text-gray100 mb-1">
                Bio
              </CustomText>
              <CustomText className="text-[16px] text-black">
                {doctor.bio}
              </CustomText>
            </View>
          </View>

          <View className="flex-row items-center mt-1 mx-1 mb-4">
            <View className="flex-1">
              <CustomText className="text-[16px] text-gray100 mb-1">
                Treatment Approach
              </CustomText>
              <CustomText className="text-[16px] text-black">
                {doctor.treatmentApproach}
              </CustomText>
            </View>
          </View>
        </View>
        <View className="flex-1 w-full justify-center items-center">
          {dataShared ? (
            <>
              <CustomText className="mb-2">
                You are currently sharing your data with this doctor.
              </CustomText>
              <Pressable
                onPress={unshare}
                className="h-14 w-full bg-red-500 items-center justify-center rounded-full"
              >
                <CustomText className="text-white text-base font-medium">
                  Unshare data
                </CustomText>
              </Pressable>
            </>
          ) : (
            <>
              <CustomText className="mb-2 text-center">
                Share your data with this doctor for personlised insights.
              </CustomText>
              <Pressable
                onPress={share}
                className="h-14 w-full bg-blue200 items-center justify-center rounded-full"
              >
                <CustomText className="text-white text-base font-medium">
                  Share data
                </CustomText>
              </Pressable>
            </>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default DoctorDetails;
