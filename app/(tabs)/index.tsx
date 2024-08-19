import React, { useCallback, useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Dimensions,
  StyleProp,
  ViewStyle,
  ScrollView,
  Platform,
  Pressable,
  RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Plus from "@/assets/icons/plus.svg";
import EditPen from "@/assets/icons/edit-pen.svg";
import Newpen from "@/assets/icons/new-pen.svg";
import CustomText from "@/components/CustomText";
import Carousel, {
  CarouselProps,
  getInputRangeFromIndexes,
} from "react-native-snap-carousel";
import Card from "@/components/Card";
import TopNav from "@/components/TopNav";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as SecureStore from "expo-secure-store";
import { router } from "expo-router";

const daysAfter = (days: number) => (date: Date) =>
  new Date(date.getTime() + days * (24 * 60 * 60 * 1000));

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
const getDay = (day: number) =>
  (day >= 0 && day < 7 ? _days[day] : "???").toUpperCase();

const ICON_SIZE = 28;

const ref = React.createRef<Carousel<any>>();

const renderCard = (item: JournalEntryDate) => {
  const handlePress = () => {
    router.push({
      pathname: `/journal/entry`,
      params: {
        date: `${item.date.getFullYear()}-${(item.date.getMonth() + 1)
          .toString()
          .padStart(2, "0")}-${item.date
          .getDate()
          .toString()
          .padStart(2, "0")}`,
      },
    });
  };

  return (
    <View
      style={[styles.mainCard, styles.mainCardHeight, styles.shadow]}
      className="bg-white flex flex-col items-center justify-end relative"
    >
      <CustomText
        letterSpacing="tighter"
        className="text-2xl font-medium text-center"
      >
        {`${item.date.getDate()} ${getMonth(item.date.getMonth())}`}
      </CustomText>
      <CustomText className="text-sm text-center mb-6 mt-1">
        {getDay(item.date.getDay())}
      </CustomText>

      <View className="absolute w-full h-full flex justify-center items-center">
        <TouchableOpacity onPress={handlePress}>
          <View
            className="rounded-full bg-white flex justify-center items-center"
            style={[styles.shadow, styles.circle]}
          >
            {item.id != -1 ? (
              <EditPen
                width={ICON_SIZE}
                height={ICON_SIZE}
                stroke={"rgba(0, 0, 0, 0.7)"}
              />
            ) : (
              <Plus
                width={ICON_SIZE}
                height={ICON_SIZE}
                stroke={"rgba(0, 0, 0, 0.7)"}
              />
            )}
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
};

type JournalEntry = {
  id: number;
  title?: string;
  body?: string;
};

type JournalEntryDate = {
  date: Date;
} & JournalEntry;

type JournalEntryRaw = {
  date: string;
} & JournalEntry;

const { width: viewportWidth, height: viewportHeight } =
  Dimensions.get("window");

const wp = (percentage: number) => {
  const value = (percentage * viewportWidth) / 100;
  return Math.round(value);
};

const scrollInterpolator2 = (
  index: number,
  carouselProps: CarouselProps<any>
) => {
  const range = [2, 1, 0, -1];
  const inputRange = getInputRangeFromIndexes(range, index, carouselProps);
  const outputRange = range;

  return { inputRange, outputRange };
};

const animatedStyles2 = (
  index: number,
  animatedValue: Animated.AnimatedValue,
  carouselProps: CarouselProps<any>
) => {
  return {
    zIndex: animatedValue
      .interpolate({
        inputRange: [-1, -0.5, 0, 0.5, 1],
        outputRange: [0, 0, 1, 0, 0],
        extrapolate: "clamp",
      })
      .interpolate({
        inputRange: [0, 1],
        outputRange: [0, 1000],
        extrapolate: "clamp",
      }),
    opacity: animatedValue.interpolate({
      inputRange: [-2, -1, 0, 1, 2],
      outputRange: [0.6, 0.75, 1, 0.75, 0.6],
    }),
    transform: [
      {
        scale: animatedValue.interpolate({
          inputRange: [-2, -1, 0, 1, 2],
          outputRange: [0.6, 0.75, 1, 0.75, 0.6],
        }),
      },
      {
        translateX: animatedValue.interpolate({
          inputRange: [-1, 0, 1],
          outputRange: [
            styles.mainCard.width / 2,
            0,
            (-1 * styles.mainCard.width) / 2,
          ],
        }),
      },
    ],
  };
};

const getJournalEntries = async (): Promise<JournalEntryDate[]> => {
  const BACKEND_URL = "http://localhost:8000";
  const token =
    Platform.OS === "web"
      ? await AsyncStorage.getItem("access_token")
      : await SecureStore.getItemAsync("access_token");
  if (!token) {
    throw new Error("No token found");
  }
  const response = await fetch(`${BACKEND_URL}/journals?limit=30`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error(
      `Failed to fetch journal entries: ${response.status} ${response.statusText}`
    );
  }

  const journals: JournalEntryRaw[] = await response.json();
  return journals.map((journal) => ({
    date: new Date(journal.date),
    id: journal.id,
  }));
};

const getJournalEntriesHandler = async () => {
  // get the last 30 days
  const today = new Date();
  const days: JournalEntryDate[] = Array.from({ length: 30 }, (_, i) => ({
    date: daysAfter(-1 * (29 - i))(today),
    id: -1,
  }));

  try {
    (await getJournalEntries()).forEach((journal) => {
      console.log(journal);
      const index = days.findIndex(
        (day) =>
          day.date.getDate() === journal.date.getDate() &&
          day.date.getMonth() === journal.date.getMonth() &&
          day.date.getFullYear() === journal.date.getFullYear()
      );
      if (index !== -1) {
        days[index] = journal;
      }
    });
  } catch (error) {
    alert(
      `Failed to fetch journal entries: ${
        error instanceof Error ? error.message : String(error)
      }`
    );
  }

  return days;
};
const HomeScreen = () => {
  const today = new Date();
  const [refreshing, setRefreshing] = useState(false);
  const [data, setData] = useState(
    Array.from({ length: 30 }, (_, i) => ({
      date: daysAfter(-1 * (29 - i))(today),
      id: -1,
    }))
  );

  useEffect(() => {
    const fetchData = async () => {
      const result = await getJournalEntriesHandler();
      setData(result);
    };
    fetchData();
  }, []);

  const onRefresh = useCallback(() => {
    const fetchData = async () => {
      const result = await getJournalEntriesHandler();
      setData(result);
    };
    fetchData();
    setRefreshing(true);
    fetchData().then(() => setRefreshing(false));
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <TopNav />

      <ScrollView className="" refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
        <View>
          <CustomText
            letterSpacing="tight"
            className="font-medium text-black200 text-[20px] text-center"
          >
            Good Morning, Ning.
          </CustomText>
        </View>

        <View className="w-full pt-4 flex flex-row justify-center items-center relative">
          <Carousel
            data={data}
            firstItem={data.length - 1}
            enableSnap={true}
            enableMomentum={true}
            snapToAlignment="center"
            renderItem={({ item }) => renderCard(item)}
            sliderWidth={wp(100)}
            containerCustomStyle={styles.slider}
            contentContainerCustomStyle={styles.sliderContentContainer}
            scrollInterpolator={scrollInterpolator2}
            itemWidth={styles.mainCard.width}
            ref={ref}
            // @ts-ignore
            slideInterpolatedStyle={animatedStyles2}
            useScrollView={true}
          />
        </View>

        <View className="px-4">
          <View className="w-full py-6">
            <View style={styles.line} className="h-0.5 w-full rounded-full" />
          </View>

          <CustomText letterSpacing="tight" className="font-medium text-2xl">
            Suggestions for you
          </CustomText>
          <CustomText className="text-base mt-1 text-gray300 mb-4">
            Based on your day
          </CustomText>
          <View className="flex-row">
            <View className="w-1/2">
              <Card
                title="Journal"
                subtitle="Write about your day."
                justifyContent="flex-start"
                href="/journal/start"
              />
            </View>
            <View className="w-1/2">
              <Card
                title="Writing"
                href="/guided-journal/start"
                subtitle="Write about your day."
                justifyContent="flex-start"
              />
            </View>
          </View>
          <View className="flex-row">
            <View className="w-1/2">
              <Card
                title="Relax"
                subtitle="Unwind out your day."
                href="/guided-journal/start"
                justifyContent="flex-start"
              />
            </View>
            <View className="w-1/2">
              <Card
                title="Reading"
                subtitle="Feed your mind and imagination."
                href="/(tabs)/read"
                justifyContent="flex-start"
              />
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  slider: {
    marginTop: 15,
    overflow: "visible", // for custom animations
  },
  sliderContentContainer: {
    paddingVertical: 10, // for custom animation
  },
  container: {
    flex: 1,
    backgroundColor: "#E7F1FB",
  },
  scaledCard: {
    transform: "scale(0.7)",
  },
  mainCard: {
    width: 210,
    borderRadius: 20,
  },
  mainCardHeight: {
    height: 270,
  },
  circle: {
    height: 48,
    width: 48,
  },
  shadow: {
    shadowColor: "rgba(0, 0, 0, 0.1)",
    shadowOffset: {
      width: 0,
      height: 0,
    },
    shadowRadius: 20,
  },
  line: {
    backgroundColor: "#D1CCC8",
  },
  suggestionBox: {
    backgroundColor: "white",
    padding: 20,
    margin: 10,
    borderRadius: 10,
  },
  suggestionTitle: {
    fontSize: 18,
    fontWeight: "bold",
  },
  suggestionDescription: {
    fontSize: 14,
    color: "gray",
  },
});

export default HomeScreen;
