import React from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  Button,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import User from "@/assets/icons/user.svg";
import Droplet from "@/assets/icons/droplet.svg";
import Plus from "@/assets/icons/plus.svg";
import CustomText from "@/components/CustomText";

const daysAfter = (days: number) => (date: Date) =>
  new Date(date.getTime() + days * (24 * 60 * 60 * 1000));
const yesterday = daysAfter(-1);
const tomorrow = daysAfter(1);

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

const HomeScreen = () => {
  const today = new Date();

  return (
    <SafeAreaView style={styles.container}>
      <View className="flex flex-row justify-between">
        <TouchableOpacity className="p-4">
          <Droplet width={ICON_SIZE} height={ICON_SIZE} />
        </TouchableOpacity>
        <TouchableOpacity className="p-4">
          <User width={ICON_SIZE} height={ICON_SIZE} />
        </TouchableOpacity>
      </View>

      <View>
        <CustomText className="font-bold text-2xl text-center">
          Good Morning, Ning.
        </CustomText>
      </View>

      <View className="w-full pt-12 flex flex-row justify-center items-center relative">
        <View
          className="absolute w-full"
          style={[styles.mainCardHeight, styles.scaledCard]}
        >
          <View
            style={[styles.mainCard, styles.mainCardHeight, styles.shadow]}
            className="bg-white flex flex-col items-center justify-end relative"
          >
            <Text className="text-3xl font-semibold text-center">
              {`${yesterday(today).getDate()} ${getMonth(
                yesterday(today).getMonth()
              )}`}
            </Text>
            <Text className="text-sm text-center mb-5 mt-1">
              {getDay(yesterday(today).getDay())}
            </Text>

            <View className="absolute w-full h-full flex justify-center items-center">
              <TouchableOpacity>
                <View
                  className="rounded-full bg-white flex justify-center items-center"
                  style={[styles.shadow, styles.circle]}
                >
                  <Plus
                    width={ICON_SIZE}
                    height={ICON_SIZE}
                    stroke={"rgba(0, 0, 0, 0.7)"}
                  />
                </View>
              </TouchableOpacity>
            </View>
          </View>
        </View>
        <View
          style={[styles.mainCard, styles.mainCardHeight, styles.shadow]}
          className="bg-white flex flex-col items-center justify-end relative"
        >
          <Text className="text-3xl font-semibold text-center">
            {`${today.getDate()} ${getMonth(today.getMonth())}`}
          </Text>
          <Text className="text-sm text-center mb-5 mt-1">
            {getDay(today.getDay())}
          </Text>

          <View className="absolute w-full h-full flex justify-center items-center">
            <TouchableOpacity>
              <View
                className="rounded-full bg-white flex justify-center items-center"
                style={[styles.shadow, styles.circle]}
              >
                <Plus
                  width={ICON_SIZE}
                  height={ICON_SIZE}
                  stroke={"rgba(0, 0, 0, 0.7)"}
                />
              </View>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <View className="w-screen px-5 pt-8">
        <View style={styles.line} className="h-0.5 w-full rounded-full" />
      </View>

      <CustomText className="font-bold px-5 pt-5 text-2xl">
        Suggestions for you
      </CustomText>
      <CustomText className="mt-1 px-5 color-gray">
        Based on your day
      </CustomText>

      <View style={styles.suggestionBox}>
        <Text style={styles.suggestionTitle}>Relax</Text>
        <Text style={styles.suggestionDescription}>Unwind out your day.</Text>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
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
    margin: 20,
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
