import AsyncStorage from "@react-native-async-storage/async-storage";
import { addDays, format } from "date-fns";
import { Platform } from "react-native";
import * as SecureStore from "expo-secure-store";
import { Token } from "@/types/models";

export const getStatus = (value: number) => {
  if (value < 0.2) return "horrible";
  if (value < 0.4) return "bad";
  if (value < 0.6) return "fine";
  if (value < 0.85) return "well";
  return "excellent";
};

export const BACKEND_URL = "http://localhost:8000";

// export const getToken = async () =>
//   Platform.OS === "web"
//     ? await AsyncStorage.getItem("access_token")
//     : // AsyncStorage claims to work for iOS and Android too, can be tested later
//       await SecureStore.getItemAsync("access_token");

// export const setToken = async (data: Token, expiresAt: Date) => {
//   if (Platform.OS === "web") {
//     await AsyncStorage.setItem("access_token", data.access_token);
//     await AsyncStorage.setItem("expires_at", expiresAt.toISOString());
//   } else {
//     // mobile
//     await SecureStore.setItemAsync("access_token", data.access_token);
//     await SecureStore.setItemAsync("expires_at", expiresAt.toISOString());
//   }
// };
