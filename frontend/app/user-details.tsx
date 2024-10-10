import React from "react";
import {
  View,
  TextInput,
  Pressable,
  Keyboard,
  TouchableWithoutFeedback,
  Platform,
} from "react-native";
import {} from "nativewind";
import CustomText from "@/frontend/components/CustomText";
import { shadows } from "@/frontend/constants/styles";
import { useState } from "react";
import { router } from "expo-router";
import { getPatientData, getUser, updateUser } from "@/frontend/api/api";
import { useAuth } from "@/state/auth";
import Male from "@/assets/icons/male.svg";
import Female from "@/assets/icons/female.svg";
import Briefcase from "@/assets/icons/briefcase.svg";
import Calendar from "@/assets/icons/calendar.svg";
import { Sex } from "@/types/globals";
import { differenceInYears, format, isValid, parse, set } from "date-fns";
import { useHydratedEffect } from "@/hooks/hooks";

const UserDetails = () => {
  type Errors = {
    dob?: string;
    sex?: string;
    occupation?: string;
  };

  const [email, setEmail] = useState("");
  const [id, setId] = useState(0);
  const [dob, setDob] = useState(new Date());
  const [selectedSex, setSelectedSex] = useState<Sex | null>(null);
  const [occupation, setOccupation] = useState("");
  const [open, setOpen] = useState(false);
  const [day, setDay] = useState("");
  const [month, setMonth] = useState("");
  const [year, setYear] = useState("");
  const [errors, setErrors] = useState<Errors>({});
  const [loading, setLoading] = useState(false);
  const auth = useAuth();

  useHydratedEffect(() => {
    const fetchData = async () => {
      try {
        if (auth.user) {
          setEmail(auth.user.email);
          setId(auth.user.id);
          return;
        }
        const token = auth.token;
        if (!token) {
          throw new Error("No token found");
        }
        auth.setToken(token);

        const user = await getUser();
        if (!user) {
          throw new Error("No user found");
        }
        auth.setUser(user);
        setEmail(user.email);
        setId(user.id);
      } catch (error) {
        console.log(error);
      }
    };
    fetchData();
  }, []);

  const onSubmit = async () => {
    const dateString = `${year}-${month}-${day}`;
    const date = format(
      parse(dateString, "yyyy-MM-dd", new Date()),
      "yyyy-MM-dd"
    );
    const data = {
      email: email,
      sex: selectedSex,
      occupation: occupation,
      dob: date,
    };

    try {
      const response = await updateUser(data);
      auth.setUser(response);
      return response;
    } catch (error) {
      console.error(error);
    }
  };

  const handleDateChange = (value: string, type: "day" | "month" | "year") => {
    if (type === "day") {
      if (/^\d{0,2}$/.test(value)) setDay(value);
    } else if (type === "month") {
      if (/^\d{0,2}$/.test(value)) setMonth(value);
    } else if (type === "year") {
      if (/^\d{0,4}$/.test(value)) setYear(value);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Errors = {};
    if (!occupation.trim()) newErrors.occupation = "Occupation is required";
    if (!selectedSex) newErrors.sex = "Sex is required";
    if (!day || !month || !year) {
      newErrors.dob = "Complete date of birth is required";
    } else {
      const dateString = `${year}-${month}-${day}`;
      const date = parse(dateString, "yyyy-MM-dd", new Date());

      if (!isValid(date)) {
        newErrors.dob = "Invalid date of birth";
      } else {
        const age = differenceInYears(new Date(), date);
        if (age < 13) {
          newErrors.dob = "You must be at least 13 years old";
        }
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const submit = async () => {
    if (!validateForm()) return;
    setLoading(true);
    try {
      await onSubmit();
      const patient = await getPatientData(id);
      if (patient.patient_data?.has_onboarded) {
        router.push("/(tabs)");
      } else {
        // router.push("/understand");
        router.push("/");
      }
    } catch (error) {
      alert(error);
      console.error("Failed to submit form:", error);
    }
    setLoading(false);
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <View className="flex-1 p-4 pt-20 bg-blue100 justify-between">
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
          <View className="w-full h-px bg-gray50 my-6" />
          {/* Occupation Input */}
          <CustomText className="mb-2 text-base text-black font-medium">
            Occupation
          </CustomText>
          <Pressable className={`mb-4`} tabIndex={-1}>
            <View className="relative">
              <TextInput
                style={{ ...shadows.card }}
                className="h-14 bg-white text-base rounded-2xl pl-12 pr-4 font-[PlusJakartaSans] placeholder:text-gray100"
                placeholder="Enter your occupation"
                value={occupation}
                onChangeText={setOccupation}
              />
              <View className="absolute left-4 top-0 h-full w-6 flex items-center justify-center">
                <Briefcase
                  width={24}
                  height={24}
                  strokeWidth={1.5}
                  pointerEvents="none"
                  className="fill-gray200"
                />
              </View>
            </View>
          </Pressable>

          {errors.occupation && (
            <CustomText className="text-red-500 mb-4">
              {errors.occupation}
            </CustomText>
          )}
          {/* Sex Selection */}
          <CustomText className="mb-2 text-base text-black font-medium">
            Sex
          </CustomText>
          <View className="flex-row">
            <Pressable
              className={`flex-1 flex-row items-center justify-center py-3 rounded-2xl border-2 ${
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
                    ? "text-blue200 font-medium"
                    : "text-black"
                }`}
              >
                Male
              </CustomText>
            </Pressable>
            <Pressable
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
            </Pressable>
          </View>
          {errors.sex && (
            <CustomText className="text-red-500 mb-4">{errors.sex}</CustomText>
          )}
          {/* Date of Birth Input */}
          <CustomText className="mt-6 text-base font-medium text-black">
            Date of birth
          </CustomText>
          {
            <View className="mt-2 flex-row">
              <Pressable tabIndex={-1}>
                <TextInput
                  placeholder="DD"
                  style={shadows.card}
                  className="h-14 w-16 bg-white text-base rounded-2xl px-4 text-center font-[PlusJakartaSans] placeholder:text-gray100"
                  value={day}
                  keyboardType="numeric"
                  onChangeText={(value) => handleDateChange(value, "day")}
                />
              </Pressable>
              <Pressable tabIndex={-1}>
                <TextInput
                  placeholder="MM"
                  style={shadows.card}
                  className="h-14 w-16 bg-white text-base rounded-2xl ml-2 px-4 text-center font-[PlusJakartaSans] placeholder:text-gray100"
                  value={month}
                  keyboardType="numeric"
                  onChangeText={(value) => handleDateChange(value, "month")}
                />
              </Pressable>
              <Pressable tabIndex={-1}>
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
          }
          {errors.dob && (
            <CustomText className="text-red-500 mt-2">{errors.dob}</CustomText>
          )}
        </View>
        <Pressable
          disabled={loading}
          onPress={submit}
          className={`h-14 ${
            loading ? "bg-gray50" : "bg-blue200"
          } items-center justify-center rounded-full`}
        >
          <CustomText className="text-white text-base font-medium">
            Next
          </CustomText>
        </Pressable>
      </View>
    </TouchableWithoutFeedback>
  );
};

export default UserDetails;
