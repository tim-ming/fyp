import React, { useEffect, useState } from "react";
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
import { format, addDays, subDays } from "date-fns";
import { Colors } from "@/constants/Colors";

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

const JourneyScreen = () => {
  // Mood data for the week
  const moodData = [0.9, 0.6, 0.4, 0.2, 0.7, 0.1, 0.8];
  const dayLabels = ["M", "T", "W", "T", "F", "S", "S"];
  const currentDay = 20;

  // Generate data for the month
  const [monthData, setMonthData] = useState<
    { journals: number; mood: number }[]
  >([]);

  useEffect(() => {
    setMonthData(
      Array.from({ length: 31 }, () => ({
        journals: Math.floor(Math.random() * 5), // Random number of journals between 0 and 4
        mood: Math.random(), // Random mood value between 0 and 1
      }))
    );
  }, []);

  // State for date range
  const [startDate, setStartDate] = useState(new Date(2023, 3, 28)); // Initial start date
  const endDate = addDays(startDate, 7); // End date is 7 days after start date

  // Handle left chevron click
  const handleLeftChevronClick = () => {
    setStartDate(subDays(startDate, 7));
  };

  // Handle right chevron click
  const handleRightChevronClick = () => {
    setStartDate(addDays(startDate, 7));
  };

  return (
    <ScrollView className="bg-blue-50 flex-1">
      <TopNav />
      {/* Journey Section */}

      <View className="mb-8 px-4">
        <View className="mb-8">
          <CustomText className="text-center text-2xl font-semibold mb-4">
            Journey
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

        <View className="bg-white rounded-2xl p-6">
          <View className="justify-between flex-row mb-5">
            <CustomText className="font-medium text-base text-black200">
              May
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
                    {currentDay === i + 1 ? (
                      <View
                        className={`w-full h-full items-center justify-center rounded-[6px] border-[2px] p-[2px] border-blue200`}
                      >
                        <View
                          className={`w-full h-full items-center justify-center rounded-[4px]`}
                          style={{
                            backgroundColor:
                              i < 28 ? interpolateColor(mood) : Colors.gray0,
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
                            i < 28 ? interpolateColor(mood) : Colors.gray100,
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
    </ScrollView>
  );
};

export default JourneyScreen;
