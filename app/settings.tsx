import React from "react";
import { View, Pressable, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import ChevronRight from "@/assets/icons/chevron-right.svg";
import { shadows } from "@/constants/styles";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import CustomText from "@/components/CustomText";
import BackButton from "@/components/Back";
import BackButtonWrapper from "@/components/Back";

const SettingsScreen = () => {
  const router = useRouter();

  const insets = useSafeAreaInsets();
  const handlePress = (screen: string) => {
    router.push(screen);
  };

  return (
    <View
      style={{
        paddingTop: insets.top,
        paddingBottom: insets.bottom,
        paddingLeft: insets.left,
        paddingRight: insets.right,
      }}
    >
      {/* <BackButtonWrapper
        style={{
          paddingLeft: 8,
          paddingTop: 12,
        }}
      > */}
      <ScrollView className="flex-1 bg-lightblue200 px-4 pt-5">
        <CustomText className="text-2xl font-medium text-gray300 my-2">
          Profile
        </CustomText>
        {/* Profile Section */}
        <CustomText className="text-xl font-semibold text-black my-2 ml-4">
          Account
        </CustomText>
        <View className="flex bg-white rounded-lg mb-6" style={shadows.card}>
          <Pressable
            className="flex-row justify-between items-center py-3 px-4"
            onPress={() => handlePress("/notifications")}
          >
            <CustomText className=" text-gray300 font-medium">
              Notifications
            </CustomText>
            <ChevronRight className="stroke-gray300" />
          </Pressable>
          <View className="h-px flex bg-beige300 mx-4"></View>
          <Pressable
            className="flex-row justify-between items-center py-3 px-4"
            onPress={() => handlePress("/socialmedia")}
          >
            <CustomText className=" text-gray300 font-medium">
              Social media
            </CustomText>
            <ChevronRight className="stroke-gray300" />
          </Pressable>
          <View className="h-px flex bg-beige300 mx-4"></View>
          <Pressable
            className="flex-row justify-between items-center py-3 px-4"
            onPress={() => handlePress("/data")}
          >
            <CustomText className=" text-gray300 font-medium">
              Your data
            </CustomText>
            <ChevronRight className="stroke-gray300" />
          </Pressable>
        </View>

        {/* Personalisation Section */}
        <CustomText className="text-xl font-semibold text-black my-2 ml-4">
          Personalisation
        </CustomText>
        <View className="flex bg-white rounded-lg mb-6" style={shadows.card}>
          <Pressable
            className="flex-row justify-between items-center py-3 px-4"
            onPress={() => handlePress("/notifications")}
          >
            <CustomText className=" text-gray300 font-medium">
              Appearance
            </CustomText>
            <ChevronRight className="stroke-gray300" />
          </Pressable>
          <View className="h-px flex bg-beige300 mx-4"></View>
          <Pressable
            className="flex-row justify-between items-center py-3 px-4"
            onPress={() => handlePress("/preferences")}
          >
            <CustomText className=" text-gray300 font-medium">
              Preferences
            </CustomText>
            <ChevronRight className="stroke-gray300" />
          </Pressable>
        </View>

        {/* Help & Support Section */}
        <CustomText className="text-xl font-semibold text-black my-2 ml-4">
          Help & Support
        </CustomText>
        <View className="flex bg-white rounded-lg mb-6" style={shadows.card}>
          <Pressable
            className="flex-row justify-between items-center py-3 px-4"
            onPress={() => handlePress("/helplines")}
          >
            <CustomText className=" text-gray300 font-medium">
              Helplines
            </CustomText>
            <ChevronRight className="stroke-gray300" />
          </Pressable>
        </View>

        {/* Passcode Section */}
        <CustomText className="text-xl font-semibold text-black my-2">
          Passcode
        </CustomText>
        <View className="bg-white rounded-lg p-4 mb-10">
          <CustomText className="text-base text-gray500 mb-3">
            Protect your inner thoughts from others.
          </CustomText>
          <View className="flex-row justify-between items-center">
            {/* Placeholder for passcode dots */}
            {Array.from({ length: 4 }).map((_, index) => (
              <View key={index} className="w-12 h-12 bg-gray100 rounded-lg" />
            ))}
          </View>
        </View>
      </ScrollView>
      {/* </BackButtonWrapper> */}
    </View>
  );
};

export default SettingsScreen;
