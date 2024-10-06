import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect, useState } from "react";
import "react-native-reanimated";
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
    fetchData();
  }, []);

  useEffect(() => {
    console.log(auth);
  }, [auth]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  const goBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      if (!auth.user) {
        router.push("/signin");
      } else {
        switch (auth.user.role) {
          case "therapist":
            router.push("/therapist/dashboard");
            break;
          case "patient":
            router.push("/");
            break;
          default:
            console.error("Unknown role: ", auth.user.role);
        }
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
            name="settings/index"
            options={{
              presentation: "modal", // Makes it slide in from the right
              animation: "slide_from_right", // Specifies the slide animation
            }}
          />
          <Stack.Screen name="signin" options={{ headerShown: false }} />
          <Stack.Screen name="signup" options={{ headerShown: false }} />
          <Stack.Screen name="understand" options={{ headerShown: false }} />
          <Stack.Screen name="user-details" options={{ headerShown: false }} />
          <Stack.Screen name="relax/index" />
          <Stack.Screen name="relax/breathe" options={{ headerShown: false }} />
          <Stack.Screen
            name="guided-journal/completion"
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="journal/completion"
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="therapist/dashboard"
            options={{ headerShown: false }}
          />
          <Stack.Screen name="mood" options={{ headerShown: false }} />
          <Stack.Screen
            name="read/[articleId]/chapter/[chapterId]/page/[pageId]"
            options={({ route, navigation }) => ({
              headerLeft: () => {
                const { articleId } = route.params as { articleId: string };

                return (
                  <Pressable
                    onPress={() =>
                      navigation.navigate("read/[articleId]", { articleId })
                    }
                    style={{ marginLeft: 16 }}
                  >
                    <ChevronLeft width={24} height={24} />
                  </Pressable>
                );
              },
            })}
          />

          <Stack.Screen name="vault/history/guided-journal/[date]" />
          <Stack.Screen name="vault/history/journal/[date]" />
          <Stack.Screen name="vault/history/mood/[date]" />
        </Stack>
      </SafeAreaProvider>
    </ThemeProvider>
  );
}
