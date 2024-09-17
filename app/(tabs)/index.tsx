import { getJournalEntries } from "@/api/api";
import EditPen from "@/assets/icons/edit-pen.svg";
import Plus from "@/assets/icons/plus.svg";
import CustomText from "@/components/CustomText";
import TopNav from "@/components/TopNav";
import { Colors } from "@/constants/Colors";
import { shadows } from "@/constants/styles";
import { useAuth } from "@/state/auth";
import { JournalEntry } from "@/types/models";
import { capitalizeFirstLetter, getDayOfWeek } from "@/utils/helpers";
import { addDays, format, isSameDay, isToday, isYesterday } from "date-fns";
import { Image } from "expo-image";
import { Href, Link, router } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
  Animated,
  Dimensions,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Carousel, {
  CarouselProps,
  getInputRangeFromIndexes,
} from "react-native-snap-carousel";
import doctorsData from "@/assets/data/doctors.json";
import { Doctor } from "@/types/globals";
import { useHydratedEffect } from "@/hooks/hooks";

type JournalEntryCard = {
  journal: JournalEntry | null;
  date: Date;
};

const ICON_SIZE = 28;

const ref = React.createRef<Carousel<any>>();

const renderCard = (journal: JournalEntryCard) => {
  const handlePress = () => {
    router.push({
      pathname: `/journal/entry`,
      params: {
        date: `${journal.date.getFullYear()}-${(journal.date.getMonth() + 1)
          .toString()
          .padStart(2, "0")}-${journal.date
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
        {format(journal.date, "dd MMM")}
      </CustomText>
      <CustomText className="text-sm text-center mb-6 mt-1">
        {capitalizeFirstLetter(getDayOfWeek(journal.date.toISOString()))}
      </CustomText>

      <View className="absolute w-full h-full flex justify-center items-center">
        <Pressable onPress={handlePress}>
          <View
            className="rounded-full bg-white flex justify-center items-center"
            style={[styles.shadow, styles.circle]}
          >
            {journal ? (
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
        </Pressable>
      </View>
    </View>
  );
};

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

const getJournalEntriesHandler = (journalEntries: JournalEntry[]) => {
  const today = new Date();
  const days: JournalEntryCard[] = Array.from({ length: 30 }, (_, i) =>
    addDays(today, -1 * (29 - i))
  ).map((d) => ({
    date: d,
    journal: journalEntries.find(({ date }) => isSameDay(d, date)) || null,
  }));

  console.log(days);

  return days;
};

interface CardProps {
  title: string;
  href: Href<string | object>;
  icon?: "book" | "dove" | "bookopen" | "bookandpen";
}

const SuggestedCard: React.FC<CardProps> = ({ title, href, icon }) => {
  let imageSource;
  switch (icon) {
    case "book":
      imageSource = require("@/assets/images/book.png");
      break;
    case "dove":
      imageSource = require("@/assets/images/dove.png");
      break;
    case "bookopen":
      imageSource = require("@/assets/images/bookopen.png");
      break;
    case "bookandpen":
      imageSource = require("@/assets/images/bookandpen.png");
      break;
    default:
      imageSource = null;
  }

  return (
    <Link href={href} asChild>
      <Pressable>
        {({ pressed }) => (
          <View
            style={[
              styles.card,
              { transform: [{ scale: pressed ? 0.95 : 1 }] },
            ]}
          >
            {imageSource && <Image source={imageSource} style={styles.image} />}
            <CustomText letterSpacing="tight" style={styles.title}>
              {title}
            </CustomText>
          </View>
        )}
      </Pressable>
    </Link>
  );
};

type DoctorsData = {
  [id: string]: Doctor;
};

type DoctorPair = [string, Doctor][];

const convertToPairs = (data: DoctorsData): DoctorPair[] => {
  const entries = Object.entries(data);
  const pairs: DoctorPair[] = [];
  for (let i = 0; i < entries.length; i += 2) {
    pairs.push(entries.slice(i, i + 2) as DoctorPair);
  }
  return pairs;
};

const HomeScreen = () => {
  const today = new Date();
  const [refreshing, setRefreshing] = useState(false);
  const [journals, setJournals] = useState<JournalEntryCard[]>([]);
  const auth = useAuth();
  useHydratedEffect(() => {
    const fetchData = async () => {
      getJournalEntries()
        .then((journalEntries) =>
          setJournals(getJournalEntriesHandler(journalEntries))
        )
        .catch((error) => {
          console.error(error);
        });
    };
    fetchData();
  }, []);

  const onRefresh = useCallback(() => {
    const fetchData = async () => {
      getJournalEntries()
        .then((journalEntries) =>
          setJournals(getJournalEntriesHandler(journalEntries))
        )
        .catch((error) => {
          console.error(error);
        });
    };
    fetchData();
    setRefreshing(true);
    fetchData().then(() => setRefreshing(false));
  }, []);

  return (
    <SafeAreaView style={styles.container} className="bg-blue100">
      <TopNav />

      <ScrollView
        className=""
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View>
          <CustomText
            letterSpacing="tight"
            className="font-medium text-black200 text-[24px] text-center"
          >
            {`Good Morning${auth.user && ", " + auth.user.name}`}.
          </CustomText>
        </View>

        <View className="w-full pt-4 flex flex-row justify-center items-center relative">
          <Carousel
            data={journals}
            firstItem={journals.length - 1}
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
          <CustomText className=" mt-1 text-gray300 mb-4">
            Based on your day
          </CustomText>
          <View className="flex-row">
            <View className="w-1/2">
              <SuggestedCard
                title="Journal"
                href="/journal/start"
                icon="book"
              />
            </View>
            <View className="w-1/2">
              <SuggestedCard
                title="Write"
                href="/guided-journal/start"
                icon="bookandpen"
              />
            </View>
          </View>
          <View className="flex-row">
            <View className="w-1/2">
              <SuggestedCard title="Relax" href="/relax" icon="dove" />
            </View>
            <View className="w-1/2">
              <SuggestedCard title="Read" href="/read" icon="bookopen" />
            </View>
          </View>

          <View className="w-full py-6">
            <View style={styles.line} className="h-0.5 w-full rounded-full" />
          </View>

          <CustomText letterSpacing="tight" className="font-medium text-2xl">
            Therapists
          </CustomText>
          <CustomText className=" mt-1 text-gray300 mb-4">
            Share your data with our trusted professionals to get better
            insights on your mental health.
          </CustomText>
          {convertToPairs(doctorsData).map(([[id1, doc1], [id2, doc2]]) => (
            <View key={id1}>
              <View className="flex-row mb-2">
                <Pressable
                  onPress={() => router.push(`/doctors/${id1}`)}
                  className="flex-1 justify-center items-center"
                  style={stylesCard.container}
                >
                  <Image
                    source={`../assets/images/${doc1.image}`}
                    className="w-full h-32"
                  />
                  <CustomText className="text-lg text-center">
                    {doc1.name}
                  </CustomText>
                </Pressable>
                <Pressable
                  onPress={() => router.push(`/doctors/${id2}`)}
                  className="flex-1 justify-center items-center ml-2"
                  style={stylesCard.container}
                >
                  <Image
                    source={`../assets/images/${doc2.image}`}
                    className="w-full h-32"
                  />
                  <CustomText className="text-lg text-center">
                    {doc2.name}
                  </CustomText>
                </Pressable>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: "white",
    borderRadius: 20, // rounded-2xl
    padding: 20, // p-5
    width: "100%",
    justifyContent: "center",
    alignItems: "center",

    ...shadows.card,
  },
  title: {
    fontSize: 20, // text-[24px]
    fontWeight: "500", // font-semibold
  },
  subtitle: {
    fontSize: 14, // text-[14px]
    color: Colors.gray200,
    marginTop: 4,
  },
  image: {
    width: 100, // Adjust the size as needed
    height: 100, // Adjust the size as needed
    marginBottom: 8, // Add some margin below the image
    opacity: 0.6, // Adjust the opacity as needed
  },
  slider: {
    marginTop: 15,
    overflow: "visible", // for custom animations
  },
  sliderContentContainer: {
    paddingVertical: 10, // for custom animation
  },
  container: {
    flex: 1,
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

const stylesCard = StyleSheet.create({
  container: {
    backgroundColor: "white",
    padding: 16, // 1rem is approximately 16 pixels
    borderRadius: 16, // Adjust as needed
    borderWidth: 1, // Adjust as needed
    borderColor: Colors.gray50, // Adjust as needed
    ...shadows.card,
  },
});

export default HomeScreen;
