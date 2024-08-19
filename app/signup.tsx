import React from "react";
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
import Apple from "@/assets/icons/apple.svg";
import Google from "@/assets/icons/google.svg";
import { useRef } from "react";
import { shadows } from "@/constants/styles";
import { useState } from "react";
import Check from "@/assets/icons/check.svg";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import * as SecureStore from "expo-secure-store";

const Checkbox = () => {
  const [checked, setChecked] = useState(false);

  const toggleCheckbox = () => {
    setChecked(!checked);
  };

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

const signUp = async (email: string, password: string, name: string): Promise<void> => {
  const BACKEND_URL = "http://localhost:8000";

  const response = await fetch(`${BACKEND_URL}/signup`, {
    method: "POST",
    body: JSON.stringify({ email, password, name }),
  });

  if (!response.ok) {
    throw new Error(response.statusText);
  }
};

const signUpHandler = async (email: string, password: string, name: string) => {
  if (!email || !password || !name) {
    alert("Please enter all fields");
    return;
  }

  try {
    await signUp(email, password, name);
    router.push("/signin");
  } catch (error) {
    alert(
      `Sign up failed: ${
        error instanceof Error ? error.message : String(error)
      }`
    );
  }
};

const SignUpScreen = () => {
  const emailInputRef = useRef<TextInput>(null);
  const passwordInputRef = useRef<TextInput>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <View className="flex-1 p-4 pt-20 bg-gray-100">
        <View className="flex flex-col">
          <CustomText className="text-[40px] leading-10 font-medium text-black200 tracking-tighter">
            Hello!
          </CustomText>
          <CustomText className="text-[40px] leading-[48px] font-medium tracking-tighter">
            <CustomText className="text-blue200">Create</CustomText>{" "}
            <CustomText className="text-black200">an account.</CustomText>
          </CustomText>
          <CustomText className="text-base text-gray-500 mt-4 mb-6 tracking-tight">
            Be a better you today.
          </CustomText>

          <View className="flex flex-col gap-3">
            <Pressable onPress={() => emailInputRef.current?.focus()}>
              <View className="relative">
                <TextInput
                  style={shadows.card}
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

            <Pressable onPress={() => passwordInputRef.current?.focus()}>
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
                  strokeWidth={1.5}
                  pointerEvents="none"
                  className="stroke-gray200 absolute left-4 top-0 h-full w-6 items-center justify-center"
                />
              </View>
            </Pressable>
          </View>
        </View>

        <View className="flex-row items-center my-6">
          <Checkbox />
          <CustomText className="text-sm text-gray-500 ">
            By signing up, you agree to our{" "}
            <CustomText className="text-blue200 underline">
              Terms of Service
            </CustomText>{" "}
            and{" "}
            <CustomText className="text-blue200 underline">
              Privacy Policy
            </CustomText>
            .
          </CustomText>
        </View>

        <Pressable className="h-14 bg-blue200 items-center justify-center rounded-full" onPress={() => {
          signUpHandler(email, password, "Yu Kogure");
        }}>
          <CustomText className="text-white text-base font-medium">
            Sign up
          </CustomText>
        </Pressable>

        <View className="flex-row items-center my-6">
          <View className="flex-1 h-px bg-gray-300" />
          <CustomText className="text-center text-gray-500 mx-2">OR</CustomText>
          <View className="flex-1 h-px bg-gray-300" />
        </View>

        <View className="flex flex-col gap-3">
          <Pressable className="flex-row justify-center items-center h-14 bg-white border border-gray-300 px-4 rounded-full">
            <Google width={24} height={24} className="mr-2" />
            <CustomText className="text-black text-base font-medium">
              Sign in with Google
            </CustomText>
          </Pressable>

          <Pressable className="flex-row justify-center items-center h-14 bg-black px-4 rounded-full">
            <Apple width={24} height={24} className="mr-2" />
            <CustomText className="text-white text-base font-medium">
              Sign in with Apple
            </CustomText>
          </Pressable>
        </View>

        <CustomText className="text-center text-gray-500 mt-10">
          Already have an account?{" "}
          <CustomText className="text-blue200 underline font-medium">
            Sign in
          </CustomText>
        </CustomText>
      </View>
    </TouchableWithoutFeedback>
  );
};
export default SignUpScreen;
