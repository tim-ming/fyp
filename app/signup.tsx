import React, { useEffect, useMemo } from "react";
import { Linking } from "react-native";
import {
  View,
  TextInput,
  Pressable,
  Image,
  Keyboard,
  TouchableWithoutFeedback,
  StyleSheet,
  Platform,
} from "react-native";
import {} from "nativewind";
import CustomText from "@/components/CustomText";
import Lock from "@/assets/icons/lock.svg";
import Mail from "@/assets/icons/mail.svg";
import { useRef } from "react";
import { shadows } from "@/constants/styles";
import { useState } from "react";
import Check from "@/assets/icons/check.svg";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router, useRouter } from "expo-router";
import * as SecureStore from "expo-secure-store";
import { checkEmailExists, getUser, postSignin, postSignup } from "@/api/api";
import { SignInWithGoogle, SignInWithApple } from "@/components/SignInWith";
import { WEBSITE_URL } from "@/constants/globals";
import { useAuth } from "@/state/auth";
import Male from "@/assets/icons/male.svg";
import Female from "@/assets/icons/female.svg";
import User from "@/assets/icons/user.svg";
import Briefcase from "@/assets/icons/briefcase.svg";
import Calendar from "@/assets/icons/calendar.svg";
import DatePicker from "react-native-date-picker";
import { Sex } from "@/types/globals";
import { differenceInYears, format, isValid, parse, set } from "date-fns";

type Phase = "credentials" | "details";

const UserDetails: React.FC<{
  name: string;
  setName: (name: string) => void;
  dob: Date;
  setDob: (dob: Date) => void;
  occupation: string;
  setOccupation: (occupation: string) => void;
  selectedSex: Sex;
  setSelectedSex: (sex: Sex) => void;
  onSubmit: () => Promise<Response>;
}> = ({
  name,
  setName,
  dob,
  setDob,
  occupation,
  setOccupation,
  selectedSex,
  setSelectedSex,
  onSubmit,
}) => {
  type Errors = {
    name?: string;
    dob?: string;
    sex?: string;
    occupation?: string;
  };
  const [open, setOpen] = useState(false);
  const [day, setDay] = useState("");
  const [month, setMonth] = useState("");
  const [year, setYear] = useState("");
  const [errors, setErrors] = useState<Errors>({});
  const [loading, setLoading] = useState(false);

  const handleDateChange = (value: string, type: "day" | "month" | "year") => {
    if (type === "day") {
      if (/^\d{0,2}$/.test(value)) setDay(value);
    } else if (type === "month") {
      if (/^\d{0,2}$/.test(value)) setMonth(value);
    } else if (type === "year") {
      if (/^\d{0,4}$/.test(value)) setYear(value);
    }
  };

  useEffect(() => {
    setDob(new Date(`${year}-${month}-${day}`));
  }, [day, month, year]);

  const validateForm = (): boolean => {
    const newErrors: Errors = {};
    if (!name.trim()) newErrors.name = "Full name is required";
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

    const dateString = `${year}-${month}-${day}`;
    const date = parse(dateString, "yyyy-MM-dd", new Date());
    setLoading(true);
    try {
      await onSubmit();
      router.push("/understand");
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
          <CustomText className="mt-4 text-blue200 font-medium">
            Find out how and why we need your data.
          </CustomText>
          <View className="w-full h-px bg-gray50 my-6" />
          {/* Full Name Input */}
          <CustomText className="mb-2 text-base text-black font-medium">
            Full name
          </CustomText>
          <Pressable className={`mb-4`} tabIndex={-1}>
            <View className="relative">
              <TextInput
                style={{ ...shadows.card }}
                className="h-14 bg-white text-base rounded-2xl pl-12 pr-4 font-[PlusJakartaSans] placeholder:text-gray100"
                placeholder="Enter your full name"
                value={name}
                onChangeText={setName}
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
          {errors.name && (
            <CustomText className="text-red-500 mb-4">{errors.name}</CustomText>
          )}
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
              <Briefcase
                width={24}
                height={24}
                strokeWidth={1.5}
                pointerEvents="none"
                className="fill-gray200 absolute left-4 top-0 h-full w-6 items-center justify-center"
              />
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
          <CustomText className="mt-6 text-sm text-black">
            Date of birth
          </CustomText>
          {Platform.OS === "web" ? (
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
          ) : (
            <Pressable
              onPress={() => setOpen(true)}
              className="mt-2 flex-row items-center bg-white rounded-lg shadow-sm px-3 py-2"
            >
              <Calendar width={20} height={20} className="stroke-gray200" />
              <CustomText className="flex-1 ml-2 text-black">
                {dob ? dob.toDateString() : "DD / MM / YYYY"}
              </CustomText>
            </Pressable>
          )}
          {errors.dob && (
            <CustomText className="text-red-500 mt-2">{errors.dob}</CustomText>
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
              onCancel={() => setOpen(false)}
            />
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

const SignUp: React.FC<{
  email: string;
  setEmail: (email: string) => void;
  password: string;
  setPassword: (password: string) => void;
  setPhase: (phase: Phase) => void;
}> = ({ email, setEmail, password, setPassword, setPhase }) => {
  type Errors = {
    email?: string;
    password?: string;
    terms?: string;
  };
  const emailInputRef = useRef<TextInput>(null);
  const passwordInputRef = useRef<TextInput>(null);
  const [checked, setChecked] = useState(false);
  const [errors, setErrors] = useState<Errors>({});
  const [loading, setLoading] = useState(false);

  const isValidEmailSyntax = useMemo(() => {
    const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
    return emailRegex.test(email);
  }, [email]);

  const isValidPassword = useMemo(() => password.length >= 8, [password]);

  interface CheckboxProps {
    checked: boolean;
    toggleCheckbox: () => void;
  }

  const Checkbox: React.FC<CheckboxProps> = ({ checked, toggleCheckbox }) => {
    return (
      <Pressable
        className="w-7 h-7 items-center justify-center mr-2"
        onPress={toggleCheckbox}
      >
        <View
          style={shadows.cardDarker}
          className={`${
            checked ? "bg-blue200" : "bg-white"
          } rounded-full w-full h-full items-center justify-center`}
        >
          {checked && <Check className="stroke-white p-1 stroke-[3]" />}
        </View>
      </Pressable>
    );
  };

  const termsOfService = () => {
    const openURL = () => {
      const url = WEBSITE_URL + "/terms"; // Replace with your URL
      Linking.openURL(url).catch((err) =>
        console.error("Failed to open URL:", err)
      );
    };
    openURL();
  };

  const privacyPolicy = () => {
    const openURL = () => {
      const url = WEBSITE_URL + "/privacy"; // Replace with your URL
      Linking.openURL(url).catch((err) =>
        console.error("Failed to open URL:", err)
      );
    };
    openURL();
  };

  const toggleCheckbox = () => {
    setChecked(!checked);
  };

  const signUpHandler = async (email: string, password: string) => {
    setLoading(true);
    const newErrors: Errors = {};
    if (!email) {
      newErrors.email = "Please enter your email";
    } else if (!isValidEmailSyntax) {
      newErrors.email = "Invalid email syntax";
    }

    if (!password) {
      newErrors.password = "Please enter your password";
    } else if (!isValidPassword) {
      newErrors.password = "Password must be at least 8 characters long";
    }

    if (!checked) {
      newErrors.terms = "You must agree to the terms and conditions.";
    }

    if (Object.keys(newErrors).length == 0) {
      try {
        const emailExistsResponse = await checkEmailExists(email);

        if (emailExistsResponse.ok) {
          const emailExists =
            (await emailExistsResponse.json()).detail === "True";
          if (emailExists) {
            newErrors.email = "Email already exists";
          } else {
            newErrors.email = "";
            setPhase("details");
          }
        } else {
          const emailError = await emailExistsResponse.json();
          newErrors.email = emailError.detail;
          throw new Error(emailError.detail);
        }
      } catch (error) {
        console.error(error);
      }
    }
    setErrors(newErrors);
    setLoading(false);
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <View className="flex-1 p-4 pt-20 bg-blue100">
        <View className="flex flex-col">
          <CustomText className="text-4xl leading-10 font-medium text-black200 tracking-tighter">
            Hello!
          </CustomText>
          <CustomText className="text-4xl leading-10 font-medium">
            <CustomText letterSpacing="tighter" className="text-blue200">
              Create
            </CustomText>{" "}
            <CustomText letterSpacing="tighter" className="text-black200">
              an account.
            </CustomText>
          </CustomText>
          <CustomText className="text-base text-gray-500 mt-4 mb-6 tracking-tight">
            Be a better you today.
          </CustomText>

          <View className="flex flex-col">
            {/* Email Input */}
            <Pressable
              onPress={() => emailInputRef.current?.focus()}
              tabIndex={-1}
            >
              <View className="relative">
                <TextInput
                  style={shadows.card}
                  ref={emailInputRef}
                  className="h-14 bg-white text-base rounded-2xl pl-12 pr-4 font-[PlusJakartaSans] placeholder:text-gray100"
                  placeholder="Enter your email address"
                  keyboardType="email-address"
                  value={email}
                  onChangeText={setEmail}
                />
                <Mail
                  width={24}
                  height={24}
                  strokeWidth={1.5}
                  pointerEvents="none"
                  className="stroke-gray200 absolute left-4 top-0 h-full w-6 items-center justify-center"
                />
              </View>
            </Pressable>

            {/* Email Error Message */}
            {errors.email && (
              <CustomText className="text-red-500 text-sm">
                {errors.email}
              </CustomText>
            )}

            {/* Password Input */}
            <Pressable
              onPress={() => passwordInputRef.current?.focus()}
              tabIndex={-1}
              className="mt-3"
            >
              <View className="relative">
                <TextInput
                  style={shadows.card}
                  ref={passwordInputRef}
                  className="h-14 bg-white text-base rounded-2xl pl-12 pr-4 shadow-[0px_4px_20px_0px_rgba(0,_0,_0,_0.1)] font-[PlusJakartaSans] placeholder:text-gray100"
                  placeholder="Enter your password"
                  secureTextEntry
                  value={password}
                  onChangeText={setPassword}
                />
                <Lock
                  width={24}
                  height={24}
                  pointerEvents="none"
                  className="fill-gray200 absolute left-4 top-0 h-full w-6 items-center justify-center"
                />
              </View>
            </Pressable>

            {/* Password Error Message */}
            {errors.password && (
              <CustomText className="text-red-500 text-sm">
                {errors.password}
              </CustomText>
            )}
          </View>
        </View>

        <View className="my-6 mb-4">
          <View className="flex-row items-center mb-2">
            <Checkbox checked={checked} toggleCheckbox={toggleCheckbox} />
            <CustomText className="text-sm text-gray-500 ">
              By signing up, you agree to our{" "}
              <Pressable onPress={termsOfService}>
                <CustomText className="text-blue200 underline">
                  Terms of Service
                </CustomText>
              </Pressable>{" "}
              and{" "}
              <Pressable onPress={privacyPolicy}>
                <CustomText className="text-blue200 underline">
                  Privacy Policy
                </CustomText>
              </Pressable>
              .
            </CustomText>
          </View>

          {/* Terms Error Message */}
          {errors.terms && (
            <CustomText className="text-red-500 text-sm">
              {errors.terms}
            </CustomText>
          )}
        </View>

        <Pressable
          disabled={loading}
          className={`h-14 ${
            loading ? "bg-gray50" : "bg-blue200"
          } items-center justify-center rounded-full`}
          onPress={() => {
            signUpHandler(email, password);
          }}
        >
          <CustomText className="text-white text-base font-medium">
            Sign up
          </CustomText>
        </Pressable>

        <View className="flex-row items-center my-6">
          <View className="flex-1 h-px bg-gray-300" />
          <CustomText className="text-center text-gray-500 mx-2">OR</CustomText>
          <View className="flex-1 h-px bg-gray-300" />
        </View>

        <View className="flex flex-col">
          <SignInWithGoogle />
          {/* <SignInWithApple /> */}
        </View>

        <CustomText className="text-center text-gray-500 mt-10">
          Already have an account?{" "}
          <Pressable onPress={() => router.push("/signin")}>
            <CustomText className="text-blue200 underline font-medium">
              Sign in
            </CustomText>
          </Pressable>
        </CustomText>
      </View>
    </TouchableWithoutFeedback>
  );
};

const Screen = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phase, setPhase] = useState<Phase>("credentials");

  const [name, setName] = useState("");
  const [dob, setDob] = useState(new Date());
  const [selectedSex, setSelectedSex] = useState<Sex | null>(null);
  const [occupation, setOccupation] = useState("");
  const auth = useAuth();
  const onSubmit = async () => {
    // TODO: make postSignup take a data object?
    const data = {
      email: email,
      password: password,
      name: name,
      sex: selectedSex,
      occupation: occupation,
      dob: dob.toISOString().split("T")[0],
    };

    const signupResponse = await postSignup(data);
    if (!signupResponse.ok) {
      const signupError = await signupResponse.json();
      throw new Error(signupError.detail);
    }

    const signinResponse = await postSignin(email, password);
    if (!signinResponse.ok) {
      const passwordError = await signinResponse.json();
      throw new Error(passwordError.detail);
    }

    const token = await signinResponse.json();
    auth.setToken(token);

    const user = await getUser();
    auth.setUser(user);

    return token;
  };
  return phase == "credentials" ? (
    <SignUp
      email={email}
      setEmail={setEmail}
      password={password}
      setPassword={setPassword}
      setPhase={setPhase}
    />
  ) : (
    <UserDetails
      name={name}
      setName={setName}
      dob={dob}
      setDob={setDob}
      occupation={occupation}
      setOccupation={setOccupation}
      selectedSex={selectedSex}
      setSelectedSex={setSelectedSex}
      onSubmit={onSubmit}
    />
  );
};

export default Screen;
