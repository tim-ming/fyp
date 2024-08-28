import React, { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Pressable,
} from "react-native";
import { Link } from "expo-router";
import ProgressBar from "@/components/ProgressBar";
import CustomText from "@/components/CustomText";
import ChevronLeft from "@/assets/icons/chevron-left.svg";
import ChevronRight from "@/assets/icons/chevron-right.svg";
import TopNav from "@/components/TopNav";
import {
  format,
  addDays,
  subDays,
  startOfToday,
  getDaysInMonth,
  getDay,
  eachDayOfInterval,
  isSameDay,
  startOfMonth,
  endOfMonth,
} from "date-fns";
import { Colors } from "@/constants/Colors";

const TODAY = startOfToday();

type DummyData = { journal: number; date: Date; mood: number };

const interpolateColor = (value: number): string => {
  // Ensure value is between 0 and 1
  value = Math.max(0, Math.min(1, value));

  // Hex colors to interpolate between
  const startColor = { r: 13, g: 59, b: 100 }; // #0D3B64
  const endColor = { r: 173, g: 217, b: 255 }; // #ADD9FF

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
const dummyMoodData: DummyData[] = [
  { journal: 2, date: subDays(TODAY, 0), mood: 0.2 },
  { journal: 1, date: subDays(TODAY, 1), mood: 0.4 },
  { journal: 1, date: subDays(TODAY, 2), mood: 0.6 },
  { journal: 0, date: subDays(TODAY, 4), mood: 0.9 },
  { journal: 0, date: subDays(TODAY, 5), mood: 0.7 },
  { journal: 2, date: subDays(TODAY, 6), mood: 0.5 },
  { journal: 1, date: subDays(TODAY, 7), mood: 0.2 },
  { journal: 3, date: subDays(TODAY, 8), mood: 0.4 },
  { journal: 1, date: subDays(TODAY, 9), mood: 0.6 },
  { journal: 1, date: subDays(TODAY, 10), mood: 0.8 },
  { journal: 2, date: subDays(TODAY, 11), mood: 0.9 },
  { journal: 1, date: subDays(TODAY, 12), mood: 0.7 },
  { journal: 0, date: subDays(TODAY, 14), mood: 0.9 },
  { journal: 1, date: subDays(TODAY, 15), mood: 0.7 },
  { journal: 0, date: subDays(TODAY, 16), mood: 0.5 },
  { journal: 0, date: subDays(TODAY, 17), mood: 0.2 },
  { journal: 2, date: subDays(TODAY, 18), mood: 0.4 },
  { journal: 0, date: subDays(TODAY, 19), mood: 0.6 },
];

const getMoodData =
  (data: DummyData[]) => (startDate: Date) => (endDate: Date) => {
    const allDates = eachDayOfInterval({ start: startDate, end: endDate });

    const filteredData = allDates.map((date) => {
      const found = data.find((d) => isSameDay(d.date, date));
      return found ? found : { journal: 0, date, mood: 0 };
    });

    return filteredData;
  };

const correctDateToMonday = (date: Date) => {
  const dayOfWeek = getDay(date);
  if (dayOfWeek !== 1) {
    return subDays(date, (dayOfWeek + 6) % 7);
  }
  return date;
};

const getMonthMoodData = (date: Date): DummyData[] => {
  return getMoodData(dummyMoodData)(startOfMonth(date))(endOfMonth(date));
};

const getWeekMoodData = (startDate: Date): DummyData[] => {
  // Check if the first day is not Monday (getDay returns 1 for Monday)
  const correctedStartDate = correctDateToMonday(startDate);

  const endDate = addDays(correctedStartDate, 7);
  return getMoodData(dummyMoodData)(correctedStartDate)(endDate);
};

const JourneyScreen = () => {
  // Mood data for the week'

  const daysInMonth = getDaysInMonth(TODAY);
  const [moodData, setMoodData] = useState<number[]>([]);

  const dayLabels = ["M", "T", "W", "T", "F", "S", "S"];

  // Generate data for the month
  const [monthData, setMonthData] = useState<
    { journals: number; mood: number }[]
  >([]);

  useEffect(() => {
    setMonthData(
      getMonthMoodData(TODAY).map((d) => ({
        journals: d.journal,
        mood: d.mood,
      }))
    );
    setMoodData(getWeekMoodData(startDate).map((d) => d.mood));
  }, []);

  // State for date range
  const [startDate, setStartDate] = useState(TODAY); // Set start date to TODAY
  const endDate = useMemo(() => addDays(startDate, 7), [startDate]); // End date is 7 days after start date

  // Handle left chevron click
  const handleLeftChevronClick = () => {
    const newDate = subDays(startDate, 7);
    setStartDate(newDate);
    setMoodData(getWeekMoodData(newDate).map((d) => d.mood));
  };

  // Handle right chevron click
  const handleRightChevronClick = () => {
    const newDate = addDays(startDate, 7);
    setStartDate(newDate);
    setMoodData(getWeekMoodData(newDate).map((d) => d.mood));
  };

  return (
    <ScrollView className="bg-blue100 flex-1">
      <TopNav />

      <View className="mb-8 px-4">
        <View className="mb-8">
          <CustomText className="text-center text-2xl font-medium mb-4">
            Insights
          </CustomText>

          <View className="bg-white rounded-2xl p-6 shadow-2xl">
            <View className="flex-row justify-between items-center mb-6">
              <TouchableOpacity onPress={handleLeftChevronClick}>
                <ChevronLeft width={24} height={24} />
              </TouchableOpacity>
              <View className="">
                <CustomText
                  letterSpacing="tight"
                  className="text-center mx-8 font-medium text-lg"
                >
                  {format(startDate, "dd MMM")} - {format(endDate, "dd MMM")}
                </CustomText>
                <CustomText className="text-center text-sm text-gray-500">
                  Mood
                </CustomText>
              </View>
              <TouchableOpacity onPress={handleRightChevronClick}>
                <ChevronRight width={24} height={24} />
              </TouchableOpacity>
            </View>

            <View className="flex flex-row w-full justify-center items-center">
              {moodData.map((mood, index) => (
                <View
                  key={index}
                  className="items-center h-full"
                  style={{ marginLeft: index > 0 ? 10 : 0 }} // Add margin-left for all items except the first one
                >
                  {/* Vertical ProgressBar */}
                  <ProgressBar
                    progress={mood}
                    barStyle={{
                      backgroundColor: interpolateColor(mood), // Darker blue for the progress
                      borderRadius: 4,
                    }}
                    className="w-8 bg-gray0 rounded-[4px] h-56 justify-end"
                    orientation="vertical"
                  />
                  <CustomText className="text-gray300 mt-1">
                    {dayLabels[index]}
                  </CustomText>
                </View>
              ))}
            </View>
          </View>
        </View>
        <View className="mb-4">
          <CustomText className="text-center mb-1 text-[20px] font-medium">
            Calendar
          </CustomText>
          <CustomText className="text-center text-sm text-gray-500 mb-4">
            Journals and mood history
          </CustomText>
          <View className="bg-white rounded-2xl p-6">
            <View className="justify-between flex-row mb-5">
              <CustomText className="font-medium text-base text-black200">
                Aug
              </CustomText>
              <CustomText className="font-medium text-base text-gray300">
                2024
              </CustomText>
            </View>
            {/* Grid calendar */}
            <View className="justify-center items-center">
              <View className="flex flex-wrap flex-row items-center">
                {monthData.map(({ journals, mood }, i) => {
                  const isEndOfRow = (i + 1) % 7 === 0;
                  return (
                    <View
                      key={i}
                      className={`aspect-square items-center justify-center`}
                      style={{
                        width: `calc(1/7*100% - 3px)`,
                        marginRight: isEndOfRow ? 0 : 3,
                        marginBottom: 3,
                      }}
                    >
                      {TODAY.getDate() === i + 1 ? (
                        <View
                          className={`w-full h-full items-center justify-center rounded-[6px] border-[2px] p-[2px] border-blue200`}
                        >
                          <View
                            className={`w-full h-full items-center justify-center rounded-[4px]`}
                            style={{
                              backgroundColor:
                                i < TODAY.getDate()
                                  ? interpolateColor(mood)
                                  : Colors.gray0,
                            }}
                          >
                            <CustomText className="text-white font-medium text-base leading-4 mb-[6px]">
                              {i + 1}
                            </CustomText>
                            <View className="flex-row">
                              {journals > 0 ? (
                                Array.from({ length: journals }).map((_, j) => (
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
                        </View>
                      ) : (
                        <View
                          className={`w-full h-full items-center justify-center rounded-[4px]`}
                          style={{
                            backgroundColor:
                              i < TODAY.getDate()
                                ? interpolateColor(mood)
                                : Colors.gray100,
                          }}
                        >
                          <CustomText className="text-white font-medium text-base leading-4 mb-[6px]">
                            {i + 1}
                          </CustomText>
                          <View className="flex-row">
                            {journals > 0 ? (
                              Array.from({ length: journals }).map((_, j) => (
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
                      )}
                    </View>
                  );
                })}
              </View>
            </View>
            <View className="h-px bg-gray0 w-full my-4" />
            <Pressable className="flex-row justify-end">
              <CustomText className="text-blue200 font-medium mr-1">
                View all days
              </CustomText>
              <ChevronRight className="stroke-blue200" width={20} height={20} />
            </Pressable>
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

export default JourneyScreen;
