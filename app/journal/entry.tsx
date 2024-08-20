import React, { useEffect, useState } from "react";
import { View, Text, TextInput, Pressable, Platform } from "react-native";
import { Link, router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import CustomText from "@/components/CustomText";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useRoute, RouteProp } from "@react-navigation/native";
import Plus from "@/assets/icons/plus.svg";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as SecureStore from "expo-secure-store";
import { Colors } from "@/constants/Colors";

type JournalEntry = {
  date: string;
  image?: string;
  title: string;
  body: string;
};

const _months = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];
const getMonth = (month: number) =>
  month >= 0 && month < 12 ? _months[month] : "???";

const _days = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];
const getDay = (day: number) => (day >= 0 && day < 7 ? _days[day] : "???");

const getJournalEntry = async (state: JournalEntry): Promise<JournalEntry> => {
  const BACKEND_URL = "http://localhost:8000";
  const token =
    Platform.OS === "web"
      ? await AsyncStorage.getItem("access_token")
      : await SecureStore.getItemAsync("access_token");
  if (!token) {
    throw new Error("No token found");
  }

  const response = await fetch(
    `${BACKEND_URL}/journals/date/${encodeURIComponent(state.date)}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error(
      `Failed to fetch journal entries: ${response.status} ${response.statusText}`
    );
  }

  const data: JournalEntry = await response.json();
  return data;
};

const getJournalEntryHandler = async (state: JournalEntry) => {
  try {
    const data = await getJournalEntry(state);
    console.log(data);
    return data;
  } catch (error) {
    console.log(error);
  }
  return state;
};

const postJournalEntry = async (state: JournalEntry): Promise<JournalEntry> => {
  const BACKEND_URL = "http://localhost:8000";
  const token =
    Platform.OS === "web"
      ? await AsyncStorage.getItem("access_token")
      : await SecureStore.getItemAsync("access_token");
  if (!token) {
    throw new Error("No token found");
  }
  const response = await fetch(`${BACKEND_URL}/journals`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },

    body: JSON.stringify(state),
  });

  if (!response.ok) {
    throw new Error(
      `Failed to create journal entry: ${response.status} ${response.statusText}`
    );
  }

  const data: JournalEntry = await response.json();
  return data;
};

const postJournalEntryHandler = async (state: JournalEntry) => {
  try {
    const data = await postJournalEntry(state);
    console.log(data);
  } catch (error) {
    console.log(error);
  }
  router.push("/journal/completion");
  return state;
};

const JournalEntry: React.FC = () => {
  const today = new Date();
  const { date } = (useRoute().params as { date: string }) || {};

  const [journalEntry, setJournalEntry] = useState<JournalEntry>({
    date:
      date ||
      `${today.getFullYear()}-${(today.getMonth() + 1)
        .toString()
        .padStart(2, "0")}-${today.getDate().toString().padStart(2, "0")}`,
    title: "",
    body: "",
  });

  const dateObj = new Date(journalEntry.date);

  useEffect(() => {
    const fetchData = async () => {
      const data = await getJournalEntryHandler(journalEntry);
      setJournalEntry(data);
    };
    fetchData();
  }, []);

  return (
    <View className="flex-1 justify-between bg-blue100 px-2 pt-12">
      <View>
        <CustomText className="text-[16px] font-semibold text-center text-gray200">
          {getDay(dateObj.getDay())}
        </CustomText>
        <CustomText className="text-[20px] font-semibold text-center text-gray200">
          {`${dateObj.getDate()} ${getMonth(
            dateObj.getMonth()
          )} ${dateObj.getFullYear()}`}
        </CustomText>
      </View>

      <View className="w-full pt-8 flex justify-center items-center">
        <View className="relative bg-white w-[210px] h-[270px] shadow-2xl rounded-3xl flex justify-center items-center">
          <View className="absolute rounded-full bg-white h-12 w-12 shadow-md flex justify-center items-center">
            <Pressable>
              <Plus width={28} height={28} stroke={"rgba(0, 0, 0, 0.7)"} />
            </Pressable>
          </View>
          <CustomText className="absolute bottom-[39px] text-black text-[20px] font-normal">
            Add a photo
          </CustomText>
        </View>
      </View>

      <TextInput
        className="font-semibold tracking-tighter mt-14 px-4 text-black100 font-[PlusJakartaSans] text-base h-[36px] rounded-md"
        placeholder="Title"
        multiline
        placeholderTextColor={Colors.gray100}
        style={{ fontSize: 28 }}
        value={journalEntry.title}
        onChangeText={(text) =>
          setJournalEntry({ ...journalEntry, title: text })
        }
      />

      <TextInput
        className="font-normal px-4 py-1 tracking-tight text-gray300 font-[PlusJakartaSans] text-base flex-grow rounded-md"
        placeholder="Today was a lovely day..."
        multiline
        placeholderTextColor={Colors.gray100}
        style={{ fontSize: 16 }}
        value={journalEntry.body}
        onChangeText={(text) =>
          setJournalEntry({ ...journalEntry, body: text })
        }
      />

      <View className="flex-1 justify-end mb-6 mx-2">
        <Pressable
          className="h-14 bg-blue200 items-center justify-center rounded-full"
          onPress={() => {
            postJournalEntryHandler(journalEntry);
          }}
        >
          <CustomText className="text-white text-base font-medium">
            Next
          </CustomText>
        </Pressable>
      </View>
    </View>
  );
};

export default JournalEntry;
