import { Tabs } from "expo-router";
import React from "react";
import { SafeAreaView, StyleSheet } from "react-native";

import { TabBarIcon } from "@/components/navigation/TabBarIcon";
import { Colors } from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";
import HomeIcon from "@/assets/icons/home.svg";
import ExploreIcon from "@/assets/icons/search.svg";
import ReadIcon from "@/assets/icons/book-open.svg";
import JourneyIcon from "@/assets/icons/calendar.svg";

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <SafeAreaView style={styles.container}>
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: Colors[colorScheme ?? "light"].tint,
          headerShown: false,
        }}
      >
        <Tabs.Screen
          name="home"
          options={{
            title: "Home",
            tabBarIcon: ({ color, focused }) => (
              <HomeIcon width={26} height={26} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="explore"
          options={{
            title: "Explore",
            tabBarIcon: ({ color, focused }) => (
              <ExploreIcon width={26} height={26} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="add"
          options={{
            title: "",
            tabBarIcon: ({ color, focused }) => (
              <TabBarIcon
                name={focused ? "code-slash" : "code-slash-outline"}
                color={color}
              />
            ),
          }}
        />
        <Tabs.Screen
          name="read"
          options={{
            title: "Read",
            tabBarIcon: ({ color, focused }) => (
              <ReadIcon width={26} height={26} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="journey"
          options={{
            title: "Journey",
            tabBarIcon: ({ color, focused }) => (
              <JourneyIcon width={26} height={26} color={color} />
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
});
