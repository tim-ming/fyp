import { getJournalEntry, postJournalEntry } from "@/frontend/api/api";
import Plus from "@/assets/icons/plus.svg";
import X from "@/assets/icons/x.svg";
import CustomText from "@/frontend/components/CustomText";
import { Colors } from "@/frontend/constants/Colors";
import { useHydratedEffect } from "@/hooks/hooks";
import { JournalEntry, JournalEntryCreate } from "@/types/models";
import { capitalizeFirstLetter, getDayOfWeek } from "@/utils/helpers";
import { useRoute } from "@react-navigation/native";
import { format, getDay, getMonth, set } from "date-fns";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import { Pressable, TextInput, View, Image } from "react-native";
import * as ImagePicker from "expo-image-picker";
import { BACKEND_URL } from "@/frontend/constants/globals";

const ICON_SIZE = 28;

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

const postJournalEntryHandler = async (
  journal: JournalInput,
  date: string,
  source: string
) => {
  try {
    let base64Image = null;
    if (journal.image) {
      const imageBlob = await fetch(journal.image).then((r) => r.blob());
      base64Image = await new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.readAsDataURL(imageBlob);
      });
      // Remove the data URL prefix (e.g., "data:image/jpeg;base64,")
      base64Image = (base64Image as string).split(",")[1];
    }

    const data = await postJournalEntry({
      ...journal,
      image: base64Image,
      date: new Date(date).toISOString().split("T")[0],
    } as JournalEntryCreate);
    console.log(data);
  } catch (error) {
    console.error(error);
  }
  router.push({
    pathname: "/patient/journal/completion",
    params: {
      newJournalAdded: 1,
      source: source,
    },
  });
  return journal;
};

const Entry: React.FC = () => {
  const today = new Date();
  const route = useRoute();
  const params = route.params as { date: string; source: string };
  const date = params?.date ?? format(today, "yyyy-MM-dd");
  const source = params?.source ?? "/";

  const [journalEntry, setJournalEntry] =
    useState<JournalInput>(BASE_JOURNAL_ENTRY);
  const [loading, setLoading] = useState(true);

  const dateObj = new Date(date);

  useHydratedEffect(() => {
    const fetchData = async () => {
      const data = await getJournalEntryHandler(date);
      if (data) {
        setJournalEntry({
          ...data,
          image: data.image ? `${BACKEND_URL}${data.image}` : null,
        });
      }
      setLoading(false);
    };
    fetchData();
  }, []);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      const image = result.assets[0];

      if (
        (image.type && image.type !== "image") ||
        (image.mimeType && !image.mimeType.startsWith("image"))
      ) {
        return;
      }

      setJournalEntry({ ...journalEntry, image: image.uri });
    }
  };

  console.log(date);

  return loading ? (
    <View className="flex-1 justify-center items-center bg-blue100">
      <CustomText className="text-black text-[20px] font-semibold">
        Loading...
      </CustomText>
    </View>
  ) : (
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
        <View className="relative bg-white w-[210px] h-[280px] shadow-2xl rounded-3xl flex justify-center items-center overflow-hidden">
          {journalEntry.image && (
            <Image
              source={{ uri: journalEntry.image }}
              style={{ position: "absolute", width: "100%", height: "100%" }}
              resizeMode="cover"
            />
          )}
          {!journalEntry.image ? (
            <>
              <View className="absolute rounded-full bg-white h-12 w-12 shadow-md flex justify-center items-center">
                <Pressable onPress={pickImage}>
                  <Plus
                    width={ICON_SIZE}
                    height={ICON_SIZE}
                    stroke={"rgba(0, 0, 0, 0.7)"}
                  />
                </Pressable>
              </View>
              <CustomText className="absolute bottom-[39px] text-black text-[20px] font-normal">
                Add a photo
              </CustomText>
            </>
          ) : (
            <View className="absolute bottom-[5px] right-[5px] rounded-full bg-white h-8 w-8 shadow-md flex justify-center items-center">
              <Pressable
                onPress={() =>
                  setJournalEntry({ ...journalEntry, image: null })
                }
              >
                <X width="16" height="16" stroke={"rgba(0, 0, 0, 0.7)"} />
              </Pressable>
            </View>
          )}
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
            postJournalEntryHandler(journalEntry, date, source);
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
