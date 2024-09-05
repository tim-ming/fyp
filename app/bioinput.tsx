import React, { useState } from "react";
import {
  View,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  TouchableWithoutFeedback,
  Keyboard,
  Pressable,
  Platform,
} from "react-native";
import Male from "@/assets/icons/male.svg";
import Female from "@/assets/icons/female.svg";
import User from "@/assets/icons/user.svg";
import Calendar from "@/assets/icons/calendar.svg";
import CustomText from "@/components/CustomText";
import { shadows } from "@/constants/styles";
import { router } from "expo-router";
import DatePicker from "react-native-date-picker";

type Sex = "m" | "f";

const UserDetailsScreen = () => {
  const [selectedSex, setSelectedSex] = useState<Sex | null>(null);

  const [dob, setDob] = useState(new Date());
  const [open, setOpen] = useState(false);
  const [day, setDay] = useState("");
  const [month, setMonth] = useState("");
  const [year, setYear] = useState("");

  const handleDateChange = (value: string, type: "day" | "month" | "year") => {
    if (type === "day") {
      if (/^\d{0,2}$/.test(value)) setDay(value);
    } else if (type === "month") {
      if (/^\d{0,2}$/.test(value)) setMonth(value);
    } else if (type === "year") {
      if (/^\d{0,4}$/.test(value)) setYear(value);
    }
  };

  const submit = () => {
    router.push("/understand");
  };
  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <View className="flex-1 p-4 pt-20 bg-gray-100 justify-between">
        <View>
          {/* Title */}
          <CustomText className="text-3xl font-semibold text-black">
            Fill in your details.
          </CustomText>

          {/* Subtitle */}
          <CustomText className="mt-2 text-gray200">
            We need your details to help us deliver accurate & personalized
            insights.
          </CustomText>

          <CustomText className="mt-4 text-blue200 font-medium">
            Find out how and why we need your data.
          </CustomText>

          <View className="w-full h-px bg-gray50 my-6" />

          {/* Full Name Input */}
          <CustomText className="mb-2 text-base text-black font-medium">
            Full name
          </CustomText>
          <Pressable
            className={`mb-4`}
            // onPress={}
            tabIndex={-1}
          >
            <View className="relative">
              <TextInput
                style={shadows.card}
                className="h-14 bg-white text-base rounded-2xl pl-12 pr-4 font-[PlusJakartaSans] placeholder:text-gray100"
                placeholder="Enter your full name"
                // value={email}
                // onChangeText={setEmail}
              />
              <User
                width={24}
                height={24}
                strokeWidth={1.5}
                pointerEvents="none"
                className="fill-gray200 absolute left-4 top-0 h-full w-6 items-center justify-center"
              />
            </View>
          </Pressable>

          {/* Sex Selection */}
          <CustomText className="mb-2 text-base text-black font-medium">
            Sex
          </CustomText>
          <View className="flex-row">
            <TouchableOpacity
              className={`flex-1 flex-row items-center justify-center py-3 rounded-2xl border-2  ${
                selectedSex === "m"
                  ? "border-blue200 bg-white"
                  : "border-transparent bg-white opacity-60"
              }`}
              onPress={() => setSelectedSex("m")}
            >
              <Male
                width={24}
                height={24}
                className={
                  selectedSex === "m" ? "fill-blue200" : "fill-gray200"
                }
              />
              <CustomText
                className={`ml-2 text-base ${
                  selectedSex === "m"
                    ? "text-blue200 font-medium "
                    : "text-black"
                }`}
              >
                Male
              </CustomText>
            </TouchableOpacity>
            <TouchableOpacity
              className={`flex-1 flex-row items-center justify-center py-3 ml-2 rounded-2xl border-2 ${
                selectedSex === "f"
                  ? "border-blue200 bg-white"
                  : "border-transparent bg-white opacity-60"
              }`}
              onPress={() => setSelectedSex("f")}
            >
              <Female
                width={24}
                height={24}
                className={
                  selectedSex === "f" ? "fill-blue200" : "fill-gray200"
                }
              />
              <CustomText
                className={`ml-2 text-base ${
                  selectedSex === "f"
                    ? "text-blue200 font-medium"
                    : "text-black"
                }`}
              >
                Female
              </CustomText>
            </TouchableOpacity>
          </View>

          {/* Date of Birth Input */}
          <CustomText className="mt-6 text-sm text-black">
            Date of birth
          </CustomText>
          {Platform.OS === "web" ? (
            <View className="mt-2 flex-row">
              <Pressable>
                <TextInput
                  placeholder="DD"
                  style={shadows.card}
                  className="h-14 w-16 bg-white text-base rounded-2xl px-4 text-center font-[PlusJakartaSans] placeholder:text-gray100"
                  value={day}
                  keyboardType="numeric"
                  onChangeText={(value) => handleDateChange(value, "day")}
                />
              </Pressable>
              <Pressable>
                <TextInput
                  placeholder="MM"
                  style={shadows.card}
                  className="h-14 w-16 bg-white text-base rounded-2xl ml-2 px-4 text-center font-[PlusJakartaSans] placeholder:text-gray100"
                  value={month}
                  keyboardType="numeric"
                  onChangeText={(value) => handleDateChange(value, "month")}
                />
              </Pressable>
              <Pressable>
                <TextInput
                  placeholder="YYYY"
                  style={shadows.card}
                  className="h-14 w-32 bg-white text-base rounded-2xl ml-2 px-4 text-center font-[PlusJakartaSans] placeholder:text-gray100"
                  value={year}
                  keyboardType="numeric"
                  onChangeText={(value) => handleDateChange(value, "year")}
                />
              </Pressable>
            </View>
          ) : (
            <TouchableOpacity
              onPress={() => setOpen(true)}
              className="mt-2 flex-row items-center bg-white rounded-lg shadow-sm px-3 py-2"
            >
              <Calendar width={20} height={20} className="stroke-gray200" />
              <CustomText className="flex-1 ml-2 text-black">
                {dob ? dob.toDateString() : "DD / MM / YYYY"}
              </CustomText>
            </TouchableOpacity>
          )}

          {/* Date Picker Modal */}
          {Platform.OS !== "web" && (
            <DatePicker
              modal
              open={open}
              date={dob}
              mode="date"
              onConfirm={(date) => {
                setOpen(false);
                setDob(date);
              }}
              onCancel={() => {
                setOpen(false);
              }}
            />
          )}
        </View>
        {/* Next Button */}
        <Pressable
          onPress={submit}
          className="h-14 bg-blue200 items-center justify-center rounded-full"
        >
          <CustomText className="text-white text-base font-medium">
            Sign in
          </CustomText>
        </Pressable>
      </View>
    </TouchableWithoutFeedback>
  );
};

export default UserDetailsScreen;
