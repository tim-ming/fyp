import React from "react";
import {
  View,
  TextInput,
  TouchableOpacity,
  Image,
  Keyboard,
  TouchableWithoutFeedback,
  StyleSheet,
} from "react-native";
import {} from "nativewind";
import CustomText from "@/components/CustomText";
import Lock from "@/assets/icons/lock.svg";
import Mail from "@/assets/icons/mail.svg";
import Apple from "@/assets/icons/apple.svg";
import Google from "@/assets/icons/google.svg";
import { useRef } from "react";
import { shadows } from "@/constants/styles";

const SignUpScreen = () => {
  const emailInputRef = useRef<TextInput>(null);
  const passwordInputRef = useRef<TextInput>(null);
  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <View className="flex-1 p-4 pt-20 bg-gray-100">
        <View className="flex flex-col">
          <CustomText className="text-4xl font-medium text-black200 tracking-tighter">
            Hello!
          </CustomText>
          <CustomText className="text-4xl font-medium tracking-tighter">
            <CustomText className="text-blue200">Create</CustomText>{" "}
            <CustomText className="text-black200">an account.</CustomText>
          </CustomText>
          <CustomText className="text-base text-gray-500 mt-4 mb-6 tracking-tight">
            Be a better you today.
          </CustomText>

          <View className="flex flex-col gap-3">
            <View className="relative">
              <TextInput
                ref={emailInputRef}
                style={shadows.card}
                className="h-14 bg-white rounded-2xl pl-12 pr-4 font-[PlusJakartaSans] placeholder:text-gray100"
                placeholder="Enter your email address"
                keyboardType="email-address"
              />
              <TouchableOpacity
                className="absolute left-0 top-0 h-full w-14 items-center justify-center"
                onPress={() => emailInputRef.current?.focus()}
              >
                <Mail
                  width={24}
                  height={24}
                  strokeWidth={1.5}
                  className="stroke-gray200"
                />
              </TouchableOpacity>
            </View>

            <View className="relative">
              <TextInput
                style={shadows.card}
                ref={passwordInputRef}
                className="h-14 bg-white rounded-2xl pl-12 pr-4 shadow-[0px_4px_20px_0px_rgba(0,_0,_0,_0.1)] font-[PlusJakartaSans] placeholder:text-gray100"
                placeholder="Enter your password"
                secureTextEntry
              />
              <TouchableOpacity
                className="absolute left-0 top-0 h-full w-14 items-center justify-center"
                onPress={() => passwordInputRef.current?.focus()}
              >
                <Lock
                  width={24}
                  height={24}
                  strokeWidth={1.5}
                  className="stroke-gray200"
                />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <View className="flex-row items-center my-6">
          <TouchableOpacity className="w-7 h-7 items-center justify-center mr-2">
            <View
              style={shadows.cardDarker}
              className="bg-white rounded-full w-full h-full"
            ></View>
          </TouchableOpacity>
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

        <TouchableOpacity className="h-14 bg-blue200 items-center justify-center rounded-full">
          <CustomText className="text-white text-base font-medium">
            Sign up
          </CustomText>
        </TouchableOpacity>

        <View className="flex-row items-center my-6">
          <View className="flex-1 h-px bg-gray-300" />
          <CustomText className="text-center text-gray-500 mx-2">OR</CustomText>
          <View className="flex-1 h-px bg-gray-300" />
        </View>

        <View className="flex flex-col gap-3">
          <TouchableOpacity className="flex-row justify-center items-center h-14 bg-white border border-gray-300 px-4 rounded-full">
            <Google width={24} height={24} className="mr-2" />
            <CustomText className="text-black text-base font-medium">
              Sign in with Google
            </CustomText>
          </TouchableOpacity>

          <TouchableOpacity className="flex-row justify-center items-center h-14 bg-black px-4 rounded-full">
            <Apple width={24} height={24} className="mr-2" />
            <CustomText className="text-white text-base font-medium">
              Sign in with Apple
            </CustomText>
          </TouchableOpacity>
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
