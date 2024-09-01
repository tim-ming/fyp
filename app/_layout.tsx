import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
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
import TopNav from "@/components/TopNav";
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
      router.push("/");
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
            name="settings"
            options={{
              presentation: "modal", // Makes it slide in from the right
              animation: "slide_from_right", // Specifies the slide animation
            }}
          />
          <Stack.Screen name="signin" options={{ headerShown: false }} />
          <Stack.Screen name="signup" options={{ headerShown: false }} />
          <Stack.Screen name="understand" options={{ headerShown: false }} />
          <Stack.Screen name="relax" />
          <Stack.Screen name="relax/breathe" options={{ headerShown: false }} />
          <Stack.Screen
            name="guided-journal/completion"
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="journal/completion"
            options={{ headerShown: false }}
          />
          <Stack.Screen name="moodtracking" options={{ headerShown: false }} />
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
        </Stack>
      </SafeAreaProvider>
    </ThemeProvider>
  );
}
