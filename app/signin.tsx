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
import { router } from "expo-router";
import * as SecureStore from "expo-secure-store"
import AsyncStorage from '@react-native-async-storage/async-storage';

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

const signIn = async (email: string, password: string): Promise<void> => {
  const BACKEND_URL = "http://localhost:8000";
  const form = new FormData();
  form.append('username', email);
  form.append('password', password);

  const response = await fetch(`${BACKEND_URL}/signin`, {
    method: "POST",
    body: form,
  });

  if (!response.ok) {
    throw new Error(response.statusText);
  }

  const data: { access_token: string; token_type: string; expires_in: number } =
    await response.json();

    const expiresAt = new Date(Date.now() + data.expires_in * 60 * 1000).toISOString();
    if (Platform.OS === 'web') {
      await AsyncStorage.setItem("access_token", data.access_token);
      await AsyncStorage.setItem("expires_at", expiresAt);
    } else { // mobile
      await SecureStore.setItemAsync("access_token", data.access_token);
      await SecureStore.setItemAsync("expires_at", expiresAt);
    }
};

const hasOnboarded = async (): Promise<boolean> => {
  const BACKEND_URL = "http://localhost:8000";
  const token = await SecureStore.getItemAsync("access_token");
  const response = await fetch(`${BACKEND_URL}/user/me`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error(response.statusText);
  }

  const profile : {has_onboarded: boolean} = await response.json();
  return profile.has_onboarded;
}

const signInHandler = async (email: string, password: string) => {
  if (!email || !password) {
    alert("Please enter both email and password");
    return;
  }

  try {
    await signIn(email, password);
    const onboarded = await hasOnboarded();
    if (onboarded) {
      router.push('/(tabs)');
    } else {
      router.push('/understand');
    }
  } catch (error) {
    alert(
      `Sign in failed: ${
        error instanceof Error ? error.message : String(error)
      }`
    );
  }
};

const SignInScreen = () => {
  const emailInputRef = useRef<TextInput>(null);
  const passwordInputRef = useRef<TextInput>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  
  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <View className="flex-1 p-4 pt-20 bg-gray-100">
        <View className="flex flex-col">
          <CustomText className="text-4xl leading-10 font-medium text-black200 tracking-tighter">
            Hello!
          </CustomText>
          <CustomText className="text-4xl leading-10 font-medium">
            <CustomText letterSpacing="tighter" className="text-blue200">
              Login
            </CustomText>{" "}
            <CustomText letterSpacing="tighter" className="text-black200">
              your account.
            </CustomText>
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
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                />
                <Lock
                  width={24}
                  height={24}
                  pointerEvents="none"
                  className="fill-gray200 absolute left-4 top-0 h-full w-6 items-center justify-center"
                />
              </View>
            </Pressable>
          </View>
        </View>

        <Pressable className="flex flex-row w-full justify-end my-4">
          <CustomText className="text-blue200 text-base font-medium">
            Forgot password?
          </CustomText>
        </Pressable>

        <Pressable className="h-14 bg-blue200 items-center justify-center rounded-full">
          <CustomText
            className="text-white text-base font-medium"
            onPress={() => {
              signInHandler(email, password);
            }}>
            Sign in
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
          Don't have an account?{" "}
          <CustomText className="text-blue200 underline font-medium">
            Sign up
          </CustomText>
        </CustomText>
      </View>
    </TouchableWithoutFeedback>
  );
};
export default SignInScreen;
