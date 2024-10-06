import { getJournalEntries, getMoodEntry, getTherapists } from "@/api/api";
import EditPen from "@/assets/icons/edit-pen.svg";
import Plus from "@/assets/icons/plus.svg";
import CustomText from "@/components/CustomText";
import TopNav from "@/components/TopNav";
import { Colors } from "@/constants/Colors";
import { shadows } from "@/constants/styles";
import { useAuth } from "@/state/auth";
import {
  JournalEntry,
  MoodEntry,
  UserWithoutSensitiveData,
} from "@/types/models";
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
import { useRoute } from "@react-navigation/native";
import { SafeAreaView } from "react-native-safe-area-context";
import Carousel, {
  CarouselProps,
  getInputRangeFromIndexes,
} from "react-native-snap-carousel";
import doctorsData from "@/assets/data/doctors.json";
import { useHydratedEffect } from "@/hooks/hooks";
import { BACKEND_URL } from "@/constants/globals";

type JournalEntryCard = {
  journal: JournalEntry | null;
  date: Date;
};

const ICON_SIZE = 28;
const CARD = {
  HEIGHT: 280,
  WIDTH: 210,
};

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
        source: `/`,
      },
    });
  };

  return (
    <View
      style={[styles.mainCard, styles.mainCardHeight, styles.shadow]}
      className="bg-white flex flex-col items-center justify-end relative"
    >
      {journal.journal?.image && (
        <Image
          source={{ uri: `${BACKEND_URL}${journal.journal.image}` }}
          style={{ position: "absolute", width: "100%", height: "100%" }}
          resizeMode="cover"
        />
      )}
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
            {journal.journal ? (
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

const HomeScreen = () => {
  const [refreshing, setRefreshing] = useState(false);
  const date = format(new Date(), "yyyy-MM-dd");
  const [journals, setJournals] = useState<JournalEntryCard[] | null>(null);
  const [moodEntry, setMoodEntry] = useState<MoodEntry | null>(null);
  const [doneFetch, setDoneFetch] = useState(false);
  const [doctors, setDoctors] = useState<UserWithoutSensitiveData[]>([]);
  const auth = useAuth();
  const route = useRoute();
  const params = route.params as { newJournalAdded: number };

  const lotusImage = require("@/assets/images/lotus.png");

  const fetchData = async () => {
    setDoneFetch(false);
    try {
      const journalEntries = await getJournalEntries();
      setJournals(getJournalEntriesHandler(journalEntries));

      const moodEntry = await getMoodEntry(date);
      setMoodEntry(moodEntry);

      const therapists = await getTherapists();
      setDoctors(therapists);
    } catch (error) {
      console.error(error);
    }
    setDoneFetch(true);
  };

  useHydratedEffect(() => {
    fetchData();
    if (params?.newJournalAdded) {
      params.newJournalAdded = 0;
    }
  }, [params?.newJournalAdded]);

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

  if (!doneFetch) {
    return null;
  }

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
          {journals ? (
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
          ) : (
            <View
              style={{ height: CARD.HEIGHT }}
              className="items-center justify-center"
            >
              <CustomText>Loading journals...</CustomText>
            </View>
          )}
        </View>

        {!moodEntry && (
          <View className="px-4">
            <View className="w-full py-8">
              <View style={styles.line} className="h-0.5 w-full rounded-full" />
            </View>

            <CustomText letterSpacing="tight" className="font-medium text-2xl">
              Daily check-in
            </CustomText>
            <CustomText className="mt-1 text-gray300 mb-4">
              You have not checked in today. How are you feeling?
            </CustomText>
            <Link href={"/patient/mood"} asChild>
              <Pressable>
                {({ pressed }) => (
                  <View
                    style={[
                      styles.card,
                      { transform: [{ scale: pressed ? 0.95 : 1 }] },
                    ]}
                    className="border-gray50 border-[1px]"
                  >
                    <Image
                      source={lotusImage}
                      className="w-32 h-32 opacity-60"
                    />
                    <CustomText letterSpacing="tight" style={styles.title}>
                      Tracking
                    </CustomText>
                    <CustomText
                      letterSpacing="tight"
                      className="text-gray100 mt-2 text-center"
                    >
                      Track your mood, sleep, appetite for better insights on
                      your mental health.
                    </CustomText>
                  </View>
                )}
              </Pressable>
            </Link>
          </View>
        )}

        <View className="px-4">
          <View className="w-full py-8">
            <View style={styles.line} className="h-0.5 w-full rounded-full" />
          </View>

          <CustomText letterSpacing="tight" className="font-medium text-2xl">
            Suggestions for you
          </CustomText>
          <CustomText className=" mt-1 text-gray300 mb-4">
            Based on your day.
          </CustomText>
          <View className="flex-row">
            <View className="w-1/2">
              <SuggestedCard
                title="Journal"
                href="/patient/journal/start"
                icon="book"
              />
            </View>
            <View className="w-1/2">
              <SuggestedCard
                title="Write"
                href="/patient/guided-journal/start"
                icon="bookandpen"
              />
            </View>
          </View>
          <View className="flex-row">
            <View className="w-1/2">
              <SuggestedCard title="Relax" href="/patient/relax" icon="dove" />
            </View>
            <View className="w-1/2">
              <SuggestedCard
                title="Read"
                href="/patient/read"
                icon="bookopen"
              />
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
          <View className="flex-wrap flex-row justify-start">
            {doctors.map((doctor, index) => (
              <View
                key={doctor.id}
                className={`w-1/2 mb-2 ${index % 2 === 0 ? "pr-1" : "pl-1"}`}
              >
                <Pressable
                  onPress={() => router.push(`/patient/doctors/${doctor.id}`)}
                  className="flex-1 justify-center items-center"
                  style={stylesCard.container}
                >
                  <Image
                    source={`../assets/images/${doctor.image}`}
                    className="w-full h-32"
                  />
                  <CustomText className="text-lg text-center">
                    {doctor.name}
                  </CustomText>
                </Pressable>
              </View>
            ))}
          </View>
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
    borderColor: Colors.gray50,
    borderWidth: 1,
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
    opacity: 0.8, // Adjust the opacity as needed
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
    width: CARD.WIDTH,
    borderRadius: 20,
  },
  mainCardHeight: {
    height: CARD.HEIGHT,
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
