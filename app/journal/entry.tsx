import { getJournalEntry, postJournalEntry } from "@/api/api";
import Plus from "@/assets/icons/plus.svg";
import CustomText from "@/components/CustomText";
import { Colors } from "@/constants/Colors";
import { useHydratedEffect } from "@/hooks/hooks";
import { JournalEntry, JournalEntryCreate } from "@/types/models";
import { capitalizeFirstLetter, getDayOfWeek } from "@/utils/helpers";
import { useRoute } from "@react-navigation/native";
import { format, getDay, getMonth } from "date-fns";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import { Pressable, TextInput, View } from "react-native";

type JournalInput = {
  title: string;
  body: string;
  image?: string | null;
};

const BASE_JOURNAL_ENTRY: JournalInput = {
  title: "",
  body: "",
  image: null,
};

const getJournalEntryHandler = async (date: string) => {
  try {
    const data = await getJournalEntry(date);
    console.log(data);
    return data;
  } catch (error) {
    console.error(error);
  }
};

const postJournalEntryHandler = async (journal: JournalInput, date: string) => {
  try {
    const data = await postJournalEntry({
      ...journal,
      date: new Date(date).toISOString().split("T")[0],
    } as JournalEntryCreate);
    console.log(data);
  } catch (error) {
    console.error(error);
  }
  router.push("/journal/completion");
  return journal;
};

const Entry: React.FC = () => {
  const today = new Date();
  const route = useRoute();
  const params = route.params as { date: string };
  const date = params?.date ?? format(today, "yyyy-MM-dd");

  const [journalEntry, setJournalEntry] =
    useState<JournalInput>(BASE_JOURNAL_ENTRY);

  const dateObj = new Date(date);

  useHydratedEffect(() => {
    const fetchData = async () => {
      const data = await getJournalEntryHandler(date);
      if (data) {
        setJournalEntry(data);
      }
    };
    fetchData();
  }, []);

  console.log(date);

  return (
    <View className="flex-1 justify-between bg-blue100 px-2 pt-12">
      <View>
        <CustomText className="text-[16px] font-semibold text-center text-gray200">
          {capitalizeFirstLetter(getDayOfWeek(dateObj.toISOString()))}
        </CustomText>
        <CustomText className="text-[20px] font-semibold text-center text-gray200">
          {format(dateObj, "dd MMM yyyy")}
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
            postJournalEntryHandler(journalEntry, date);
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

export default Entry;
