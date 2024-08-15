import { Tabs, useSegments } from "expo-router";
import React from "react";
import { SafeAreaView, StyleSheet, View } from "react-native";

import { Colors } from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";
import HomeIcon from "@/assets/icons/home.svg";
import ExploreIcon from "@/assets/icons/search.svg";
import ReadIcon from "@/assets/icons/book-open.svg";
import JourneyIcon from "@/assets/icons/calendar.svg";
import PlusIcon from "@/assets/icons/plus.svg";
import { usePathname } from "expo-router";
import CustomText from "@/components/CustomText";
import { shadows } from "@/constants/styles";

export default function TabLayout() {
  const colorScheme = useColorScheme();

  // Get the current active tab index
  const pathname = usePathname();

  // show only in certain routes
  const segments = useSegments();

  // if screen is in the home or live stack, hide the tab bar
  // segments.includes("search") || segments.includes("explore")
  const hide = false;
  return (
    <SafeAreaView style={styles.container}>
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: Colors[colorScheme ?? "light"].tint,
          headerShown: false,
          tabBarShowLabel: false, // Hide labels
          tabBarStyle: {
            borderWidth: 0,
            paddingBottom: 20,
            height: 88,
            display: hide ? "none" : "flex",
            ...shadows.card,
          }, // Adjust padding to better align items
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: "Home",
            tabBarIcon: ({ color, focused }) => (
              <View className="items-center">
                <HomeIcon
                  width={28}
                  height={28}
                  className={`${
                    focused ? `stroke-blue200` : `stroke-gray300`
                  } `}
                />
                <CustomText
                  className={`${
                    focused ? `text-blue200` : `text-gray300`
                  } text-sm font-medium`}
                >
                  Home
                </CustomText>
              </View>
            ),
          }}
        />
        <Tabs.Screen
          name="explore"
          options={{
            title: "Explore",
            tabBarIcon: ({ color, focused }) => (
              <View className="items-center">
                <ExploreIcon
                  width={28}
                  height={28}
                  className={`${
                    focused ? `stroke-blue200` : `stroke-gray300`
                  } `}
                />
                <CustomText
                  className={`${
                    focused ? `text-blue200` : `text-gray300`
                  } text-sm font-medium`}
                >
                  Explore
                </CustomText>
              </View>
            ),
          }}
        />
        <Tabs.Screen
          name="add"
          options={{
            title: "",
            tabBarIcon: ({ color, focused }) => (
              <View
                className="items-center rounded-full bg-blue200 w-16 h-16 justify-center bottom-6"
                style={shadows.card}
              >
                <PlusIcon className="stroke-white" />
              </View>
            ),
          }}
        />
        <Tabs.Screen
          name="read"
          options={{
            title: "Read",
            tabBarIcon: ({ color, focused }) => (
              <View className="items-center">
                <ReadIcon
                  width={28}
                  height={28}
                  className={`${
                    focused ? `stroke-blue200` : `stroke-gray300`
                  } `}
                />
                <CustomText
                  className={`${
                    focused ? `text-blue200` : `text-gray300`
                  } text-sm font-medium`}
                >
                  Read
                </CustomText>
              </View>
            ),
          }}
        />
        <Tabs.Screen
          name="journey"
          options={{
            title: "Journey",
            tabBarIcon: ({ color, focused }) => (
              <View className="items-center">
                <JourneyIcon
                  width={28}
                  height={28}
                  className={`${
                    focused ? `stroke-blue200` : `stroke-gray300`
                  } `}
                />
                <CustomText
                  className={`${
                    focused ? `text-blue200` : `text-gray300`
                  } text-sm font-medium`}
                >
                  Journey
                </CustomText>
              </View>
            ),
          }}
        />
      </Tabs>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  iconContainer: {
    alignItems: "center", // Center the icon and label
  },
});
