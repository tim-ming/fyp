import { router, Tabs, useSegments } from "expo-router";
import React, { useState } from "react";
import { Pressable, SafeAreaView, StyleSheet, View } from "react-native";

import VaultIcon from "@/assets/icons/archive.svg";
import InsightsIcon from "@/assets/icons/chart.svg";
import MessageIcon from "@/assets/icons/message.svg";
import MessageLightIcon from "@/assets/icons/message-light.svg";
import HomeIcon from "@/assets/icons/home.svg";
import ExploreIcon from "@/assets/icons/search.svg";
import SettingsIcon from "@/assets/icons/settings.svg";
import DashboardIcon from "@/assets/icons/dashboard.svg";
import CustomText from "@/components/CustomText";
import ChevronLeft from "@/assets/icons/chevron-left.svg";
import { shadows } from "@/constants/styles";
import { useColorScheme } from "@/hooks/useColorScheme";
import { usePathname } from "expo-router";
import { useAuth } from "@/state/auth";
import { useHydratedEffect } from "@/hooks/hooks";

export default function TabLayout() {
  const colorScheme = useColorScheme();

  // Get the current active tab index
  const pathname = usePathname();

  // show only in certain routes
  const segments = useSegments();

  // if screen is in the home or live stack, hide the tab bar
  // segments.includes("search") || segments.includes("explore")
  const hide = false;
  const auth = useAuth();

  const [isLoading, setIsLoading] = useState(true);

  useHydratedEffect(() => {
    if (auth && auth.user) {
      setIsLoading(false);
    }
  }, []);

  if (isLoading) {
    return <SafeAreaView></SafeAreaView>;
  }
  const goBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      if (!auth.user) {
        router.push("/signin");
      } else {
        router.push("/");
      }
    }
  };
  return (
    <SafeAreaView style={styles.container}>
      <Tabs
        backBehavior="history"
        screenOptions={{
          headerTitle: "",
          headerTransparent: true,
          headerShadowVisible: false,
          headerLeft: () => (
            <Pressable onPress={goBack} style={{ marginLeft: 16 }}>
              <ChevronLeft width={24} height={24} />
            </Pressable>
          ),
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
          name="(patient)/index"
          options={{
            title: "Home",
            headerShown: false,
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
          redirect={Boolean(auth && auth.user && auth.user.role !== "patient")}
        />
        <Tabs.Screen
          name="(patient)/explore"
          options={{
            headerShown: false,
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
          redirect={Boolean(auth && auth.user && auth.user.role !== "patient")}
        />
        <Tabs.Screen
          name="(patient)/chat"
          options={{
            title: "Chat",
            headerShown: false,
            tabBarIcon: ({ color, focused }) => (
              <View className="items-center">
                <MessageLightIcon
                  width={28}
                  height={28}
                  className={`stroke-[1px]  ${
                    focused ? `stroke-blue200` : `stroke-gray300`
                  } `}
                />
                <CustomText
                  className={`${
                    focused ? `text-blue200` : `text-gray300`
                  } text-sm font-medium`}
                >
                  Chat
                </CustomText>
              </View>
            ),
          }}
          redirect={Boolean(auth && auth.user && auth.user.role !== "patient")}
        />
        <Tabs.Screen
          name="(patient)/vault"
          options={{
            title: "Vault",
            headerShown: false,
            tabBarIcon: ({ color, focused }) => (
              <View className="items-center">
                <VaultIcon
                  width={28}
                  height={28}
                  className={`stroke-[1px] ${
                    focused ? `stroke-blue200` : `stroke-gray300`
                  } `}
                />
                <CustomText
                  className={`${
                    focused ? `text-blue200` : `text-gray300`
                  } text-sm font-medium`}
                >
                  Vault
                </CustomText>
              </View>
            ),
          }}
          redirect={Boolean(auth && auth.user && auth.user.role !== "patient")}
        />
        <Tabs.Screen
          name="(patient)/insights"
          options={{
            title: "Insights",
            headerShown: false,
            tabBarIcon: ({ color, focused }) => (
              <View className="items-center">
                <InsightsIcon
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
                  Insights
                </CustomText>
              </View>
            ),
          }}
          redirect={Boolean(auth && auth.user && auth.user.role !== "patient")}
        />
        <Tabs.Screen
          name="(therapist)/index"
          options={{
            headerShown: false,
            title: "Vault",
            tabBarIcon: ({ color, focused }) => (
              <View className="items-center">
                <DashboardIcon
                  width={28}
                  height={28}
                  className={`stroke-[1px] ${
                    focused ? `stroke-blue200` : `stroke-gray300`
                  } `}
                />
                <CustomText
                  className={`${
                    focused ? `text-blue200` : `text-gray300`
                  } text-sm font-medium`}
                >
                  Dashboard
                </CustomText>
              </View>
            ),
          }}
          redirect={Boolean(
            auth && auth.user && auth.user.role !== "therapist"
          )}
        />

        <Tabs.Screen
          name="(therapist)/chat/[patientId]"
          options={{
            href: null,
            headerShown: false,
          }}
          redirect={Boolean(
            auth && auth.user && auth.user.role !== "therapist"
          )}
        />
        <Tabs.Screen
          name="(therapist)/settings/index"
          options={{
            title: "Vault",
            headerShown: false,
            tabBarIcon: ({ color, focused }) => (
              <View className="items-center">
                <SettingsIcon
                  width={28}
                  height={28}
                  className={`stroke-[1px] ${
                    focused ? `stroke-blue200` : `stroke-gray300`
                  } `}
                />
                <CustomText
                  className={`${
                    focused ? `text-blue200` : `text-gray300`
                  } text-sm font-medium`}
                >
                  Settings
                </CustomText>
              </View>
            ),
          }}
          redirect={Boolean(
            auth && auth.user && auth.user.role !== "therapist"
          )}
        />
        <Tabs.Screen
          name="(therapist)/settings/details"
          options={{
            href: null,
            headerShown: false,
          }}
          redirect={Boolean(
            auth && auth.user && auth.user.role !== "therapist"
          )}
        />

        <Tabs.Screen
          name="(therapist)/patients/[patientId]"
          options={{
            href: null,
          }}
          redirect={Boolean(
            auth && auth.user && auth.user.role !== "therapist"
          )}
        />
        <Tabs.Screen
          name="(therapist)/patients/[patientId]/notes"
          options={{
            href: null,
          }}
          redirect={Boolean(
            auth && auth.user && auth.user.role !== "therapist"
          )}
        />
        <Tabs.Screen
          name="(therapist)/patients/[patientId]/data/[date]"
          options={{
            href: null,
          }}
          redirect={Boolean(
            auth && auth.user && auth.user.role !== "therapist"
          )}
        />
        <Tabs.Screen
          name="(therapist)/patients/[patientId]/data/index"
          options={{
            href: null,
          }}
          redirect={Boolean(
            auth && auth.user && auth.user.role !== "therapist"
          )}
        />
      </Tabs>
      {/* {auth && auth.user && auth.user.role === "patient" ? (
        <PatientTabLayout />
      ) : auth && auth.user && auth.user.role === "therapist" ? (
        <TherapistTabLayout />
      ) : null} */}
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
