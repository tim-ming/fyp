import { getPatientData, getUser, postSignin } from "@/api/api";
import Check from "@/assets/icons/check.svg";
import Lock from "@/assets/icons/lock.svg";
import Mail from "@/assets/icons/mail.svg";
import CustomText from "@/components/CustomText";
import { SignInWithApple, SignInWithGoogle } from "@/components/SignInWith";
import { shadows } from "@/constants/styles";
import { useAuth } from "@/state/auth";
import { router } from "expo-router";
import {} from "nativewind";
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Keyboard,
  Pressable,
  TextInput,
  TouchableWithoutFeedback,
  View,
} from "react-native";

const SignInScreen = () => {
  const emailInputRef = useRef<TextInput>(null);
  const passwordInputRef = useRef<TextInput>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const auth = useAuth();

  const [errorMessage, setErrorMessage] = useState("");
  const [canSignin, setCanSignin] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setCanSignin(email.length > 0 && password.length > 0);
  }, [email, password]);

  const signInHandler = async (email: string, password: string) => {
    setLoading(true);
    try {
      const signinResponse = await postSignin(email, password);
      if (!signinResponse.ok) {
        const errorData = await signinResponse.json();
        setErrorMessage(errorData.detail);
        return;
      }
      const token = await signinResponse.json();
      console.log(token);
      auth.setToken(token);

      const user = await getUser();
      auth.setUser(user);

      const isTherapist = user.role === "therapist";

      if (isTherapist) {
        router.push("/");
      } else {
        if (!user.dob || !user.sex || !user.occupation) {
          router.push("/user-details");
        } else {
          const patient = await getPatientData(user.id);
          if (patient.patient_data?.has_onboarded) {
            router.push("/");
          } else {
            router.push("/understand");
          }
        }
      }
    } catch (error) {
      console.error(error);
    }
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
              Login
            </CustomText>{" "}
            <CustomText letterSpacing="tighter" className="text-black200">
              your account.
            </CustomText>
          </CustomText>
          <CustomText className="text-base text-gray-500 mt-4 mb-6 tracking-tight">
            Be a better you today.
          </CustomText>

          <View className="flex flex-col">
            <Pressable
              className="mb-3"
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
                <View className="stroke-gray200 absolute left-4 top-0 flex h-full w-6 flex items-center justify-center">
                  <Mail
                    width={24}
                    height={24}
                    strokeWidth={1.5}
                    pointerEvents="none"
                    className="stroke-gray200"
                  />
                </View>
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
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                />
                <View className="fill-gray200 absolute left-4 top-0 h-full w-6 items-center justify-center">
                  <Lock
                    width={24}
                    height={24}
                    pointerEvents="none"
                    className="fill-gray200"
                  />
                </View>
              </View>
            </Pressable>
          </View>
        </View>

        <Pressable className="flex flex-row w-full justify-end my-4">
        </Pressable>
        <CustomText className="text-center text-red-500 text-sm mb-1">
          {errorMessage}
        </CustomText>
        <Pressable
          disabled={!canSignin && loading}
          onPress={() => {
            signInHandler(email, password);
          }}
          className={`h-14 ${
            !canSignin && loading ? "bg-gray50" : "bg-blue200"
          } items-center justify-center rounded-full`}
        >
          <CustomText className="text-white text-base font-medium">
            Sign in
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
          Don't have an account?{" "}
          <Pressable onPress={() => router.push("/signup")}>
            <CustomText className="text-blue200 underline font-medium">
              Sign up
            </CustomText>
          </Pressable>
        </CustomText>
      </View>
    </TouchableWithoutFeedback>
  );
};
export default SignInScreen;
