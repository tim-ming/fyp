import { getJournalEntries, getMoodEntries } from "@/api/api";
import ChevronLeft from "@/assets/icons/chevron-left.svg";
import ChevronRight from "@/assets/icons/chevron-right.svg";
import CustomText from "@/components/CustomText";
import GroupedProgressBar from "@/components/GroupedProgressBar";
import ProgressBar from "@/components/ProgressBar";
import TopNav from "@/components/TopNav";
import { Colors } from "@/constants/Colors";
import { useHydratedEffect } from "@/hooks/hooks";
import { MoodEntry } from "@/types/models";
import {
  addDays,
  eachDayOfInterval,
  endOfMonth,
  format,
  getDay,
  getDaysInMonth,
  isSameDay,
  startOfMonth,
  startOfToday,
  subDays,
} from "date-fns";
import { useNavigation } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import { Pressable, ScrollView, View } from "react-native";

const TODAY = startOfToday();

type JournalMood = { journal: number; mood: number; date: Date };

const interpolateColor = (value: number, preset: "r" | "g" | "b"): string => {
  // Ensure value is between 0 and 1
  value = Math.max(0, Math.min(1, value / 100));

  // Hex colors for red, green, and blue presets
  const presets = {
    r: {
      startColor: { r: 100, g: 13, b: 13 },
      endColor: { r: 255, g: 173, b: 173 },
    }, // Red shades
    g: {
      startColor: { r: 13, g: 100, b: 13 },
      endColor: { r: 173, g: 255, b: 173 },
    }, // Green shades
    b: {
      startColor: { r: 13, g: 59, b: 100 },
      endColor: { r: 173, g: 217, b: 255 },
    }, // Blue shades
  };

  // Choose the appropriate start and end colors based on the preset
  const { startColor, endColor } = presets[preset];

  // Interpolate each RGB component
  const r = Math.round(startColor.r + (endColor.r - startColor.r) * value);
  const g = Math.round(startColor.g + (endColor.g - startColor.g) * value);
  const b = Math.round(startColor.b + (endColor.b - startColor.b) * value);

  // Convert RGB to HSL
  const rgbToHsl = (r: number, g: number, b: number) => {
    r /= 255;
    g /= 255;
    b /= 255;
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h = 0,
      s = 0,
      l = (max + min) / 2;

    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r:
          h = (g - b) / d + (g < b ? 6 : 0);
          break;
        case g:
          h = (b - r) / d + 2;
          break;
        case b:
          h = (r - g) / d + 4;
          break;
      }
      h /= 6;
    }

    return [h, s, l];
  };

  // Convert HSL to RGB
  const hslToRgb = (h: number, s: number, l: number) => {
    let r, g, b;

    if (s === 0) {
      r = g = b = l; // achromatic
    } else {
      const hue2rgb = (p: number, q: number, t: number) => {
        if (t < 0) t += 1;
        if (t > 1) t -= 1;
        if (t < 1 / 6) return p + (q - p) * 6 * t;
        if (t < 1 / 2) return q;
        if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
        return p;
      };

      const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
      const p = 2 * l - q;
      r = hue2rgb(p, q, h + 1 / 3);
      g = hue2rgb(p, q, h);
      b = hue2rgb(p, q, h - 1 / 3);
    }

    return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
  };

  // Adjust saturation for middle values
  const [h, s, l] = rgbToHsl(r, g, b);
  const adjustedS = s + (value > 0.2 && value < 0.8 ? 0.2 : 0); // Increase saturation in the middle
  const [newR, newG, newB] = hslToRgb(h, Math.min(1, adjustedS), l);

  // Convert RGB to hex
  const toHex = (component: number) => component.toString(16).padStart(2, "0");
  return `#${toHex(newR)}${toHex(newG)}${toHex(newB)}`;
};

const correctDateToMonday = (date: Date) => {
  const dayOfWeek = getDay(date);
  if (dayOfWeek !== 1) {
    return subDays(date, (dayOfWeek + 6) % 7);
  }
  return date;
};

const getMonthMoodData = async (date: Date): Promise<JournalMood[]> => {
  // TODO: super inefficient code :) optimise pls, maybe create backend to get both journal and mood entries
  const monthData: { [key: string]: JournalMood } = {};

  const startDate = startOfMonth(date);
  const endDate = endOfMonth(date);

  const allDates = eachDayOfInterval({ start: startDate, end: endDate });

  allDates.forEach((date) => {
    const formattedDate = format(date, "yyyy-MM-dd");
    monthData[formattedDate] = { journal: 0, mood: 0, date };
  });

  const journalEntries = await getJournalEntries(365);

  journalEntries.forEach((entry) => {
    if (entry.date in monthData) {
      monthData[entry.date].journal++;
    }
  });

  const moodEntries = await getMoodEntries(365);

  moodEntries.forEach((entry) => {
    if (entry.date in monthData) {
      monthData[entry.date].mood = entry.mood;
    }
  });

  return Object.values(monthData).sort(
    (a, b) => a.date.getTime() - b.date.getTime()
  );
};

const getWeekMoodData = async (startDate: Date): Promise<MoodEntry[]> => {
  // Check if the first day is not Monday (getDay returns 1 for Monday)
  const correctedStartDate = correctDateToMonday(startDate);

  const endDate = addDays(correctedStartDate, 6);
  // Fetch mood entries for the past year
  const moodEntries = await getMoodEntries(365);
  console.log(moodEntries);
  // Filter mood entries for the current week
  const weekMoodEntries = moodEntries.filter(
    (d) =>
      new Date(d.date) >= correctedStartDate &&
      new Date(d.date) < addDays(endDate, 1)
  );

  // Create a map of the fetched mood entries
  const moodEntriesMap = new Map(
    weekMoodEntries.map((entry) => [new Date(entry.date).toDateString(), entry])
  );

  // Generate a list of all dates in the week
  const allDates = eachDayOfInterval({
    start: correctedStartDate,
    end: endDate,
  });

  // Fill in any missing dates with a MoodEntry with values of 0
  const filledMoodEntries = allDates.map((date) => {
    const dateString = date.toDateString();
    return (
      moodEntriesMap.get(dateString) ||
      ({ date: dateString, mood: 0, sleep: 0, eat: 0, id: -1 } as MoodEntry)
    );
  });
  console.log(filledMoodEntries);
  return filledMoodEntries;
};

const InsightsCard = () => {
  type Variables = "mood" | "eat" | "sleep";

  // State for date range
  const [startDate, setStartDate] = useState(correctDateToMonday(TODAY)); // Set start date to TODAY
  const endDate = useMemo(() => addDays(startDate, 6), [startDate]); // End date is 6 days after start date
  const [showVariables, setShowVariables] = useState<{
    mood: boolean;
    eat: boolean;
    sleep: boolean;
  }>({ mood: true, eat: true, sleep: true });

  useHydratedEffect(() => {
    const getMood = async () => {
      const mood = await getWeekMoodData(startDate);
      setMoodData(mood);
    };

    getMood();
  }, []);

  // Mood data for the week
  const [moodData, setMoodData] = useState<MoodEntry[]>([]);

  const dayLabels = ["M", "T", "W", "T", "F", "S", "S"];
  // Handle left chevron click
  const handleLeftChevronClick = async () => {
    const newDate = subDays(startDate, 7);
    setStartDate(newDate);
    const mood = await getWeekMoodData(newDate);
    setMoodData(mood);
  };

  // Handle right chevron click
  const handleRightChevronClick = async () => {
    const newDate = addDays(startDate, 7);
    if (newDate > TODAY) return;
    setStartDate(newDate);
    const mood = await getWeekMoodData(newDate);
    setMoodData(mood);
  };

  const toggleVariables = (variable: Variables) => {
    setShowVariables((prev) => ({ ...prev, [variable]: !prev[variable] }));
  };

  const navigation = useNavigation<any>();
  const routeTracking = (date: string) => {
    navigation.navigate("patient/vault/history/mood/[date]", { date });
  };

  return (
    <>
      <View className="bg-white rounded-2xl p-6 shadow-2xl">
        <View className="flex-row justify-between items-center mb-6">
          <Pressable onPress={handleLeftChevronClick}>
            <ChevronLeft width={24} height={24} />
          </Pressable>
          <View className="">
            <CustomText
              letterSpacing="tight"
              className="text-center mx-8 font-medium text-lg"
            >
              {format(startDate, "dd MMM")} - {format(endDate, "dd MMM")}
            </CustomText>
            <CustomText className="text-center text-sm text-gray-500">
              Tracking
            </CustomText>
          </View>
          <Pressable onPress={handleRightChevronClick}>
            <ChevronRight width={24} height={24} />
          </Pressable>
        </View>

        <View className="flex flex-row w-full justify-center items-center">
          {moodData.map(({ mood, eat, sleep, date }, index) => (
            <Pressable
              onPress={() => routeTracking(date)}
              disabled={mood === 0 && eat === 0 && sleep === 0}
              key={index}
              className="items-center h-full"
              style={{ marginLeft: index > 0 ? 10 : 0 }} // Add margin-left for all items except the first one
            >
              {/* Vertical ProgressBar */}
              <GroupedProgressBar
                className="w-8 bg-gray0 rounded-[4px] h-56 justify-end"
                orientation="vertical"
                bars={(() => {
                  const barsToShow = [];
                  if (showVariables.mood)
                    barsToShow.push({
                      progress: mood,
                      barStyle: {
                        backgroundColor: interpolateColor(mood, "b"),
                        borderRadius: 4,
                      },
                    });
                  if (showVariables.eat)
                    barsToShow.push({
                      progress: eat,
                      barStyle: {
                        backgroundColor: interpolateColor(eat, "r"),
                        borderRadius: 4,
                      },
                    });
                  if (showVariables.sleep)
                    barsToShow.push({
                      progress: sleep,
                      barStyle: {
                        backgroundColor: interpolateColor(sleep, "g"),
                        borderRadius: 4,
                      },
                    });
                  return barsToShow;
                })()}
              />

              {/* <ProgressBar
                progress={mood}
                barStyle={{
                  backgroundColor: interpolateColor(mood), // Darker blue for the progress
                  borderRadius: 4,
                }}
                className="w-8 bg-gray0 rounded-[4px] h-56 justify-end"
                orientation="vertical"
              /> */}

              <CustomText className="text-gray300 mt-1">
                {dayLabels[index]}
              </CustomText>
            </Pressable>
          ))}
        </View>

        <View className="items-center justify-center flex-row mt-4">
          <View className="items-center justify-center flex-1">
            <Pressable
              onPress={() => toggleVariables("mood")}
              className={`items-center justify-center px-5 py-2 border ${
                showVariables["mood"]
                  ? "bg-blue-500 border-transparent text-white"
                  : "border-blue-500"
              } rounded-full`}
            >
              <CustomText
                className={`text-center text-sm ${
                  showVariables["mood"]
                    ? "bg-blue-500 border-transparent text-white"
                    : "text-gray300"
                }`}
              >
                Mood
              </CustomText>
            </Pressable>
          </View>
          <View className="items-center justify-center flex-1">
            <Pressable
              onPress={() => toggleVariables("eat")}
              className={`items-center justify-center px-5 py-2 border ${
                showVariables["eat"]
                  ? "bg-red-500 border-transparent text-white"
                  : "border-red-500"
              } rounded-full`}
            >
              <CustomText
                className={`text-center text-sm ${
                  showVariables["eat"]
                    ? "bg-red-500 border-transparent text-white"
                    : "text-gray300"
                }`}
              >
                Diet
              </CustomText>
            </Pressable>
          </View>
          <View className="items-center justify-center flex-1">
            <Pressable
              onPress={() => toggleVariables("sleep")}
              className={`items-center justify-center px-5 py-2 border ${
                showVariables["sleep"]
                  ? "bg-green-500 border-transparent text-white"
                  : "border-green-500"
              } rounded-full`}
            >
              <CustomText
                className={`text-center text-sm ${
                  showVariables["sleep"]
                    ? "bg-green-500 border-transparent text-white"
                    : "text-gray300"
                }`}
              >
                Sleep
              </CustomText>
            </Pressable>
          </View>
        </View>
      </View>
    </>
  );
};

const CalendarCard = () => {
  // Generate data for the month
  const [monthData, setMonthData] = useState<JournalMood[]>([]);

  useHydratedEffect(() => {
    const getMood = async () => {
      const data = await getMonthMoodData(TODAY);

      setMonthData(data);
    };
    getMood();
  }, []);
  const navigation = useNavigation<any>();
  const viewDay = (day: Date) => {
    navigation.navigate("patient/vault/history/day/[date]", {
      date: format(day, "yyyy-MM-dd"),
    });
  };
  return (
    <>
      <CustomText className="text-center mb-1 text-[20px] font-medium">
        Calendar
      </CustomText>
      <CustomText className="text-center text-sm text-gray-500 mb-4">
        Journals and mood history
      </CustomText>
      <View className="bg-white rounded-2xl p-6">
        <View className="justify-between flex-row mb-5">
          <CustomText className="font-medium text-base text-black200">
            {format(TODAY, "MMM")}
          </CustomText>
          <CustomText className="font-medium text-base text-gray300">
            {format(TODAY, "yyyy")}
          </CustomText>
        </View>
        {/* Grid calendar */}
        <View className="justify-center items-center">
          <View className="flex flex-wrap flex-row items-center">
            {monthData.map(({ journal, mood, date }, i) => {
              const day = i + 1;
              const isEndOfRow = day % 7 === 0;
              return (
                <View
                  key={day}
                  className={`aspect-square items-center justify-center`}
                  style={{
                    width: `calc(1/7*100% - 3px)`,
                    marginRight: isEndOfRow ? 0 : 3,
                    marginBottom: 3,
                  }}
                >
                  {TODAY.getDate() === day ? (
                    <Pressable
                      onPress={() => viewDay(date)}
                      className={`w-full h-full items-center justify-center rounded-[6px] border-[2px] p-[2px] border-blue200`}
                    >
                      <View
                        className={`w-full h-full items-center justify-center rounded-[4px]`}
                        style={{
                          backgroundColor:
                            mood > 0
                              ? interpolateColor(mood, "b")
                              : Colors.gray200,
                        }}
                      >
                        <CustomText className="text-white font-medium text-base leading-4 mb-[6px]">
                          {day}
                        </CustomText>
                        <View className="flex-row">
                          {journal > 0 ? (
                            Array.from({ length: journal }).map((_, j) => (
                              <View
                                key={j}
                                className={`w-1 h-1 bg-white rounded-full ${
                                  j > 0 ? "ml-[2px]" : ""
                                }`}
                              />
                            ))
                          ) : (
                            <View
                              className={`w-1 h-1  rounded-full border-[1px] border-white`}
                            />
                          )}
                        </View>
                      </View>
                    </Pressable>
                  ) : (
                    <Pressable
                      onPress={() => viewDay(date)}
                      disabled={day > TODAY.getDate()}
                      className={`w-full h-full items-center justify-center rounded-[4px]`}
                      style={{
                        backgroundColor:
                          day < TODAY.getDate()
                            ? mood == 0
                              ? Colors.gray200
                              : interpolateColor(mood, "b")
                            : Colors.gray100,
                      }}
                    >
                      <CustomText className="text-white font-medium text-base leading-4 mb-[6px]">
                        {day}
                      </CustomText>
                      <View className="flex-row">
                        {journal > 0 ? (
                          Array.from({ length: journal }).map((_, j) => (
                            <View
                              key={j}
                              className={`w-1 h-1 bg-white rounded-full ${
                                j > 0 ? "ml-[2px]" : ""
                              }`}
                            />
                          ))
                        ) : (
                          <View
                            className={`w-1 h-1  rounded-full border-[1px] border-white`}
                          />
                        )}
                      </View>
                    </Pressable>
                  )}
                </View>
              );
            })}
          </View>
        </View>
        {/* <View className="h-px bg-gray0 w-full my-4" />
            <Pressable className="flex-row justify-end">
              <CustomText className="text-blue200 font-medium mr-1">
                View all days
              </CustomText>
              <ChevronRight className="stroke-blue200" width={20} height={20} />
            </Pressable> */}
      </View>
    </>
  );
};

const JourneyScreen = () => {
  return (
    <ScrollView className="bg-blue100 flex-1">
      <TopNav />

      <View className="mb-8 px-4">
        <CustomText className="text-center text-2xl font-medium mb-4">
          Insights
        </CustomText>
        <View className="mb-8">
          <InsightsCard />
        </View>
        <View className="mb-4">
          <CalendarCard />
        </View>
      </View>
    </ScrollView>
  );
};

export default JourneyScreen;
