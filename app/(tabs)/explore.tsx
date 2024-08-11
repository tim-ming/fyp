import React from "react";
import {
  View,
  TextInput,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Pressable,
} from "react-native";
import CustomText from "@/components/CustomText";
import User from "@/assets/icons/user.svg";
import Droplet from "@/assets/icons/droplet.svg";
import Ionicons from "@expo/vector-icons/Ionicons";

const ExploreScreen: React.FC = () => {
  const Card = ({ title, subtitle }: { title: string; subtitle: string }) => (
    <Pressable>
      {({ pressed }) => (
        <View
          className={`bg-white rounded-2xl p-4 shadow-2xl h-40 ${
            pressed ? "scale-95" : "scale-100"
          }`}
        >
          <CustomText className="text-24px font-semibold mt-20 ml-1">
            {title}
          </CustomText>
          <CustomText className="text-14px text-gray100 ml-1">
            {subtitle}
          </CustomText>
        </View>
      )}
    </Pressable>
  );

  return (
    <View className="flex-1 bg-blue100">
      <View className="flex-row justify-between items-center p-4 bg-blue100">
        <TouchableOpacity>
          <Droplet height={28} width={28} />
        </TouchableOpacity>
        <TouchableOpacity>
          <User height={28} width={28} />
        </TouchableOpacity>
      </View>

      <View>
        <CustomText className="text-xl font-semibold text-center text-gray200">
          Explore
        </CustomText>
      </View>

      <TextInput
        className="bg-white rounded-full px-4 py-2 mx-4 my-4"
        placeholder="Search stuff"
        placeholderTextColor="#8B8B8B"
      />

      <ScrollView className="px-4">
        <Card title="Journal" subtitle="Write about your day." />
        <Card
          title="Guided Writing"
          subtitle="Discover your hidden thoughts."
        />
        <Card title="Relax" subtitle="Unwind out your day." />
        <Card title="Reading" subtitle="Feed your mind and imagination." />
      </ScrollView>

      {/* Footer Navigation */}
      <View className="flex-row justify-around bg-white py-4">
        <TouchableOpacity className="items-center">
          <Ionicons name="home-outline" size={24} color="#676767" />
          <CustomText className="text-gray200">Home</CustomText>
        </TouchableOpacity>

        <TouchableOpacity className="items-center">
          <Ionicons name="compass-outline" size={24} color="#3373B0" />
          <CustomText className="text-blue200">Explore</CustomText>
        </TouchableOpacity>

        <TouchableOpacity className="w-12 h-12 rounded-full bg-blue200 justify-center items-center mb-4">
          <Ionicons name="add" size={24} color="#FFFFFF" />
        </TouchableOpacity>

        <TouchableOpacity className="items-center">
          <Ionicons name="book-outline" size={24} color="#676767" />
          <CustomText className="text-gray200">Read</CustomText>
        </TouchableOpacity>

        <TouchableOpacity className="items-center">
          <Ionicons name="journal-outline" size={24} color="#676767" />
          <CustomText className="text-gray200">Journey</CustomText>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default ExploreScreen;
