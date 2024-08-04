import React from "react";
import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import CustomText from "@/components/CustomText";
import User from "@/assets/icons/user.svg";
import Droplet from "@/assets/icons/droplet.svg";
import Ionicons from "@expo/vector-icons/Ionicons";

const ExploreScreen: React.FC = () => {
  return (
    <View className="flex-1 bg-blue100">
      {/* Header */}
      <View className="flex-row justify-between items-center p-4 bg-blue100">
        <Droplet height={28} width={28} />
        <User height={28} width={28} />
      </View>

      <CustomText className="text-2xl text-center text-gray200">
        Explore
      </CustomText>

      {/* Search Bar */}
      <TextInput
        className="bg-white rounded-full px-4 py-2 mx-4 my-4"
        placeholder="Search stuff"
        placeholderTextColor="#8B8B8B"
      />

      {/* Scrollable Content */}
      <ScrollView className="px-4">
        <View className="bg-white rounded-2xl p-4 mb-4">
          <CustomText className="text-lg font-semibold">Journal</CustomText>
          <CustomText className="text-sm text-gray100">
            Write about your day.
          </CustomText>
        </View>
        <View className="bg-white rounded-2xl p-4 mb-4">
          <CustomText className="text-lg font-semibold">
            Guided Writing
          </CustomText>
          <CustomText className="text-sm text-gray100">
            Discover your hidden thoughts.
          </CustomText>
        </View>
        <View className="bg-white rounded-2xl p-4 mb-4">
          <CustomText className="text-lg font-semibold">Relax</CustomText>
          <CustomText className="text-sm text-gray100">
            Unwind out your day.
          </CustomText>
        </View>
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F0F0F0",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#FFFFFF",
  },
  icon: {
    color: "#000000",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
  },
  searchBar: {
    backgroundColor: "#E0E0E0",
    borderRadius: 16,
    paddingHorizontal: 16,
    margin: 16,
    height: 40,
  },
  scrollView: {
    paddingHorizontal: 16,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "bold",
  },
  cardSubtitle: {
    color: "#808080",
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    paddingVertical: 16,
  },
  footerButton: {
    alignItems: "center",
  },
  footerText: {
    color: "#808080",
    fontSize: 12,
  },
  activeFooterText: {
    color: "#0000FF",
  },
  addButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#0000FF",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
});

export default ExploreScreen;
