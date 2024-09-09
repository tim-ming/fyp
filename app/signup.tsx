import React from "react";
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
import { router } from "expo-router";
import * as SecureStore from "expo-secure-store";
import { postSignup } from "@/api/api";
import { SignInWithGoogle, SignInWithApple } from "@/components/SignInWith";
import { WEBSITE_URL } from "@/constants/globals";

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

const signUpHandler = async (email: string, password: string, name: string) => {
  if (!email || !password || !name) {
    alert("Please enter all fields");
    return;
  }

  postSignup(email, password, name)
    .then((response) => {
      console.log(response);
      router.push("/bioinput");
    })
    .catch((error) => {
      console.error(error);
    });
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

const SignUpScreen = () => {
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
              Create
            </CustomText>{" "}
            <CustomText letterSpacing="tighter" className="text-black200">
              an account.
            </CustomText>
          </CustomText>
          <CustomText className="text-base text-gray-500 mt-4 mb-6 tracking-tight">
            Be a better you today.
          </CustomText>

          <View className="flex flex-col gap-3">
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

            <Pressable
              onPress={() => passwordInputRef.current?.focus()}
              tabIndex={-1}
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
          </View>
        </View>

        <View className="flex-row items-center my-6">
          <Checkbox />
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

        <Pressable
          className="h-14 bg-blue200 items-center justify-center rounded-full"
          onPress={() => {
            signUpHandler(email, password, "Yu Kogure");
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
          <SignInWithApple />
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
export default SignUpScreen;
