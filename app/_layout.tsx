import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { useFonts } from "expo-font";
import { Slot, Stack, usePathname } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect, useState } from "react";
import { Pressable } from "react-native";
import { useColorScheme } from "@/hooks/useColorScheme";
import { NativeWindStyleSheet } from "nativewind";
import { router } from "expo-router";
import ChevronLeft from "@/assets/icons/chevron-left.svg";
import {
  SafeAreaProvider,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { getUser } from "@/api/api";
import { useHydratedEffect } from "@/hooks/hooks";
import { useAuth } from "@/state/auth";

NativeWindStyleSheet.setOutput({
  default: "native",
});
// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
    PlusJakartaSans: require("../assets/fonts/PlusJakartaSans.ttf"),
  });
  const pathname = usePathname();
  const auth = useAuth();
  useHydratedEffect(() => {
    const fetchData = async () => {
      try {
        if (auth.user) return;
        const token = auth.token;
        if (!token) {
          throw new Error("No token found");
        }
        auth.setToken(token);

        const user = await getUser();
        if (!user) {
          throw new Error("No user found");
        }
        auth.setUser(user);
      } catch (error) {
        console.log("Redirecting to /signin,", error);
        router.push("/signin");
      }
    };
    if (pathname !== "/signin" && pathname !== "/signup") fetchData();
  }, []);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return <Slot />;
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
    <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
      <SafeAreaProvider>
        <Stack
          screenOptions={{
            headerTitle: "",
            headerBackTitleVisible: false,
            headerTransparent: true,
            headerShadowVisible: false,
            headerLeft: () => (
              <Pressable onPress={goBack} style={{ marginLeft: 16 }}>
                <ChevronLeft width={24} height={24} />
              </Pressable>
            ),
          }}
        >
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="+not-found" />
          <Stack.Screen
            name="patient/profile/index"
            options={{
              presentation: "modal", // Makes it slide in from the right
              animation: "slide_from_right", // Specifies the slide animation
            }}
          />
          <Stack.Screen name="signin" options={{ headerShown: false }} />
          <Stack.Screen name="signup" options={{ headerShown: false }} />
          <Stack.Screen name="understand" options={{ headerShown: false }} />
          <Stack.Screen name="user-details" options={{ headerShown: false }} />
          <Stack.Screen
            name="patient/relax/index"
            options={{ headerShown: false }}
          />

          <Stack.Screen
            name="patient/guided-journal/completion"
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="patient/journal/completion"
            options={{ headerShown: false }}
          />
          <Stack.Screen name="patient/mood" options={{ headerShown: false }} />
          <Stack.Screen
            name="patient/read/[articleId]/chapter/[chapterId]/page/[pageId]"
            options={({ route, navigation }) => ({
              headerLeft: () => {
                const { articleId } = route.params as { articleId: string };

                return (
                  <Pressable
                    onPress={() =>
                      navigation.navigate("patient/read/[articleId]", {
                        articleId,
                      })
                    }
                    style={{ marginLeft: 16 }}
                  >
                    <ChevronLeft width={24} height={24} />
                  </Pressable>
                );
              },
            })}
          />

          <Stack.Screen name="patient/vault/history/guided-journal/[date]" />
          <Stack.Screen name="patient/vault/history/journal/[date]" />
          <Stack.Screen name="patient/vault/history/mood/[date]" />
        </Stack>
      </SafeAreaProvider>
    </ThemeProvider>
  );
}
