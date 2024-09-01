import React from "react";
import {
  View,
  TextInput,
  ScrollView,
  TouchableOpacity,
  Pressable,
} from "react-native";
import CustomText from "@/components/CustomText";
import { Href, Link } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import TopNav from "@/components/TopNav";
import Card from "@/components/Card";

const ExploreScreen: React.FC = () => {
  return (
    <SafeAreaView className="flex-1 bg-blue100">
      <TopNav />

      <View>
        <CustomText
          letterSpacing="tight"
          className="text-[24px] font-medium text-center text-black200"
        >
          Explore
        </CustomText>
      </View>

      <TextInput
        className="bg-white rounded-full px-4 py-2 mx-4 my-4"
        placeholder="Search stuff"
        placeholderTextColor="#8B8B8B"
      />

      <ScrollView className="px-4 py-4">
        <Card
          title="Journal"
          subtitle="Write about your day."
          href="/journal/start"
          icon="book"
        />
        <Card
          title="Guided Writing"
          subtitle="Discover your hidden thoughts."
          href="/guided-journal/start"
          icon="bookandpen"
        />
        <Card
          title="Relax"
          subtitle="Unwind out your day."
          href="/relax"
          icon="dove"
        />
        <Card
          title="Reading"
          subtitle="Feed your mind and imagination."
          href="/read"
          icon="bookopen"
        />
      </ScrollView>
    </SafeAreaView>
  );
};

export default ExploreScreen;
