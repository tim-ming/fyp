import React from "react";
import { View, Text, Pressable, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import ChevronRight from "@/assets/icons/chevron-right.svg";
import { shadows } from "@/constants/styles";

const SettingsScreen = () => {
  const router = useRouter();

  const handlePress = (screen: string) => {
    router.push(screen);
  };

  return (
    <ScrollView className="flex-1 bg-lightblue200 px-4 pt-5">
      {/* Profile Section */}
      <Text className="text-2xl font-bold text-blue300 my-2 ml-4">Profile</Text>
      <View className="flex bg-white rounded-lg mb-6" style={shadows.card}>
        <Pressable
          className="flex-row justify-between items-center py-3 px-4"
          onPress={() => handlePress("/notifications")}
        >
          <Text className="text-lg text-black">Notifications</Text>
          <ChevronRight className="stroke-gray300" />
        </Pressable>
        <View className="h-px flex bg-beige300 mx-4"></View>
        <Pressable
          className="flex-row justify-between items-center py-3 px-4"
          onPress={() => handlePress("/socialmedia")}
        >
          <Text className="text-lg text-black">Social media</Text>
          <ChevronRight className="stroke-gray300" />
        </Pressable>
        <View className="h-px flex bg-beige300 mx-4"></View>
        <Pressable
          className="flex-row justify-between items-center py-3 px-4"
          onPress={() => handlePress("/data")}
        >
          <Text className="text-lg text-black">Your data</Text>
          <ChevronRight className="stroke-gray300" />
        </Pressable>
      </View>

      {/* Personalisation Section */}
      <Text className="text-2xl font-bold text-blue300 my-2 ml-4">
        Personalisation
      </Text>
      <View className="flex bg-white rounded-lg mb-6" style={shadows.card}>
        <Pressable
          className="flex-row justify-between items-center py-3 px-4"
          onPress={() => handlePress("/notifications")}
        >
          <Text className="text-lg text-black">Appearance</Text>
          <ChevronRight className="stroke-gray300" />
        </Pressable>
        <View className="h-px flex bg-beige300 mx-4"></View>
        <Pressable
          className="flex-row justify-between items-center py-3 px-4"
          onPress={() => handlePress("/preferences")}
        >
          <Text className="text-lg text-black">Preferences</Text>
          <ChevronRight className="stroke-gray300" />
        </Pressable>
      </View>

      {/* Help & Support Section */}
      <Text className="text-2xl font-bold text-blue300 my-2 ml-4">
        Help & Support
      </Text>
      <View className="flex bg-white rounded-lg mb-6" style={shadows.card}>
        <Pressable
          className="flex-row justify-between items-center py-3 px-4"
          onPress={() => handlePress("/helplines")}
        >
          <Text className="text-lg text-black">Helplines</Text>
          <ChevronRight className="stroke-gray300" />
        </Pressable>
      </View>

      {/* Passcode Section */}
      <Text className="text-2xl font-bold text-blue300 my-2">Passcode</Text>
      <View className="bg-white rounded-lg p-4 mb-10">
        <Text className="text-base text-gray500 mb-3">
          Protect your inner thoughts from others.
        </Text>
        <View className="flex-row justify-between items-center">
          {/* Placeholder for passcode dots */}
          {Array.from({ length: 4 }).map((_, index) => (
            <View key={index} className="w-12 h-12 bg-gray100 rounded-lg" />
          ))}
        </View>
      </View>
    </ScrollView>
  );
};

export default SettingsScreen;
