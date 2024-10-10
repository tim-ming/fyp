import UserDetails from "@/app/user-details";
import ChevronRight from "@/assets/icons/chevron-right.svg";
import Data from "@/assets/icons/data.svg";
import Feedback from "@/assets/icons/feedback.svg";
import Link from "@/assets/icons/link.svg";
import Lock from "@/assets/icons/lock.svg";
import Logout from "@/assets/icons/logout.svg";
import Moon from "@/assets/icons/moon.svg";
import Notification from "@/assets/icons/notification.svg";
import Question from "@/assets/icons/question.svg";
import Support from "@/assets/icons/support.svg";
import UserHeart from "@/assets/icons/user-heart.svg";
import CustomText from "@/components/CustomText";
import { shadows } from "@/constants/styles";
import { useHydratedEffect } from "@/hooks/hooks";
import useTherapistStore from "@/state/assignedTherapist";
import { useAuth } from "@/state/auth";
import * as ImagePicker from "expo-image-picker";
import { Href, router } from "expo-router";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { Pressable, ScrollView, TextInput, View, Image } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const Passcode: React.FC = () => {
  const length = 4;
  const inputRefs = useRef<Array<TextInput | null>>(Array(length).fill(null)); // Refs for TextInput fields

  const [passcodeIsConfigured, setPasscodeIsConfigured] = useState(false);
  const [passcode, setPasscode] = useState(Array(length).fill(""));
  const isValidPasscode = useMemo(
    () =>
      passcode.every((char) => /^\d$/.test(char)) && passcode.length === length,
    [passcode]
  );

  const handleChangeText = (text: string, index: number) => {
    const updatedPasscode = [...passcode];

    if (/^\d$/.test(text)) {
      // Only allow digits
      updatedPasscode[index] = text;
      setPasscode(updatedPasscode);

      // Automatically focus on the next input
      if (index < length - 1 && text !== "") {
        inputRefs.current[index + 1]?.focus();
      }
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    const { key } = e.nativeEvent;
    // If user presses backspace and the current input is empty, move to the previous input
    if (key === "Backspace") {
      if ((index === length - 1 && passcode[index]) || index === 0) {
        passcode[index] = "";
        setPasscode([...passcode]);
      } else {
        passcode[index - 1] = "";
        setPasscode([...passcode]);
        inputRefs.current[index - 1]?.focus();
      }
    }
  };

  const focusFirstEmptyInput = () => {
    const firstEmptyIndex = passcode.findIndex((value) => value === "");
    if (firstEmptyIndex !== -1) {
      inputRefs.current[firstEmptyIndex]?.focus();
    } else {
      inputRefs.current[length - 1]?.focus();
    }
  };

  const savePasscode = () => {
    console.log("passcode", passcode.join(""));
    setPasscodeIsConfigured(true);
  };

  const disablePasscode = () => {
    setPasscode(Array(length).fill(""));
    setPasscodeIsConfigured(false);
  };

  useEffect(() => {
    // can check if passcodeIsConfigured here
  }, [passcodeIsConfigured]);

  return (
    <>
      {passcodeIsConfigured ? (
        <View>
          <CustomText className="text-xl font-semibold text-black200 my-2 ml-4">
            Change or Disable Passcode
          </CustomText>
          <View className="flex-row justify-between items-center mt-4 mb-6">
            <View className="w-full items-center">
              <Pressable
                className="flex-row justify-between mt-5 gap-2 w-full"
                onPress={focusFirstEmptyInput}
              >
                {Array.from({ length }).map((_, index) => (
                  <TextInput
                    tabIndex={-1} // Disable tab focus, but need to work on this for accessibility
                    key={index}
                    style={{ ...shadows.card }}
                    className="w-full bg-white text-center text-lg rounded-3xl aspect-square"
                    keyboardType="numeric"
                    maxLength={1}
                    ref={(ref) => (inputRefs.current[index] = ref)}
                    defaultValue={passcode[index]}
                    onChangeText={(text) => handleChangeText(text, index)}
                    onKeyPress={(e) => handleKeyPress(e, index)}
                    pointerEvents="none"
                  />
                ))}
              </Pressable>
            </View>
          </View>
          <View className="flex-1">
            <Pressable
              onPress={savePasscode}
              disabled={!isValidPasscode}
              className={`h-14 ${
                isValidPasscode ? "bg-blue200" : "bg-disabled"
              } items-center justify-center rounded-full`}
              style={shadows.card}
            >
              <CustomText className="text-white text-base font-medium">
                Change Passcode
              </CustomText>
            </Pressable>
            <Pressable
              onPress={disablePasscode}
              className="h-14 bg-red-500 mt-4 items-center justify-center rounded-full"
              style={shadows.card}
            >
              <CustomText className="text-white text-base font-medium">
                Disable Passcode
              </CustomText>
            </Pressable>
          </View>
        </View>
      ) : (
        <View>
          <CustomText className="text-xl font-semibold text-black200 my-2 ml-4">
            Set a Passcode
          </CustomText>
          <View className="flex-row justify-between items-center mt-4 mb-6">
            <View className="w-full items-center">
              <Pressable
                className="flex-row justify-between mt-5 gap-2 w-full"
                onPress={focusFirstEmptyInput}
              >
                {Array.from({ length }).map((_, index) => (
                  <TextInput
                    tabIndex={-1} // Disable tab focus, but need to work on this for accessibility
                    key={index}
                    style={{ ...shadows.card }}
                    className="w-full bg-white text-center text-lg rounded-3xl aspect-square"
                    keyboardType="numeric"
                    maxLength={1}
                    ref={(ref) => (inputRefs.current[index] = ref)}
                    defaultValue={passcode[index]}
                    onChangeText={(text) => handleChangeText(text, index)}
                    onKeyPress={(e) => handleKeyPress(e, index)}
                    pointerEvents="none"
                  />
                ))}
              </Pressable>
            </View>
          </View>
          <View className="flex-1">
            <Pressable
              onPress={savePasscode}
              disabled={!isValidPasscode}
              className={`h-14 ${
                isValidPasscode ? "bg-blue200" : "bg-disabled"
              } items-center justify-center rounded-full`}
              style={shadows.card}
            >
              <CustomText className="text-white text-base font-medium">
                Activate Passcode
              </CustomText>
            </Pressable>
          </View>
        </View>
      )}
    </>
  );
};

const SettingsScreen = () => {
  const insets = useSafeAreaInsets();
  const handlePress = (screen: Href<string>) => {
    router.push(screen);
  };

  const auth = useAuth();
  const therapist = useTherapistStore();

  const logout = () => {
    auth.reset();
    therapist.reset();
    router.push("/signin");
  };

  return (
    <ScrollView
      style={{
        paddingTop: insets.top,
        paddingBottom: insets.bottom,
        paddingLeft: insets.left,
        paddingRight: insets.right,
      }}
      className=" bg-blue100"
    >
      {/* <BackButtonWrapper
        style={{
          paddingLeft: 8,
          paddingTop: 12,
        }}
      > */}
      <View className="flex-1 bg-blue100 px-4 py-16 gap-y-7">
        <CustomText
          letterSpacing="tight"
          className="text-2xl font-semibold text-black200"
        >
          Profile
        </CustomText>
        {/* 
        <View className="flex bg-white rounded-2xl" style={shadows.card}>
          <Pressable
            className="flex-row justify-between items-center py-5 px-4"
            onPress={() => handlePress("/settings/profile")}
          >
            <View className="items-center flex-row gap-4">
              <View className="p-1 w-16 h-16 items-center justify-center bg-gray-50 rounded-full">
                <Image
                  className="w-full h-full rounded-full"
                  source="/assets/images/man.jpg"
                />
              </View>
              <View>
                <CustomText className="text-lg text-black200 font-medium">
                  Ming
                </CustomText>
                <CustomText className=" text-gray200">Edit profile</CustomText>
              </View>
            </View>
            <ChevronRight className="stroke-gray300" />
          </Pressable>
        </View> */}

        {/* Profile Section */}
        {/* <View className="gap-y-3">
          <CustomText
            letterSpacing="tight"
            className="text-xl font-medium text-black200 ml-4"
          >
            Settings
          </CustomText>
          <View className="flex bg-white rounded-2xl" style={shadows.card}>
            <Pressable
              className="flex-row justify-between items-center py-3 px-4"
              onPress={() => handlePress("/settings/notifications")}
            >
              <View className="flex-row items-center gap-3">
                <Notification className="fill-gray300" width={20} height={20} />
                <CustomText className=" text-gray300 font-medium">
                  Notifications
                </CustomText>
              </View>
              <ChevronRight className="stroke-gray300" />
            </Pressable>
            <View className="h-px flex bg-beige300 mx-4"></View>
            <Pressable
              className="flex-row justify-between items-center py-3 px-4"
              onPress={() => handlePress("/settings/link")}
            >
              <View className="flex-row items-center gap-3">
                <Link className="fill-gray300" width={20} height={20} />
                <CustomText className=" text-gray300 font-medium">
                  Link accounts
                </CustomText>
              </View>
              <ChevronRight className="stroke-gray300" />
            </Pressable>
            <View className="h-px flex bg-beige300 mx-4"></View>
            <Pressable
              className="flex-row justify-between items-center py-3 px-4"
              onPress={() => handlePress("/settings/yourdata")}
            >
              <View className="flex-row items-center gap-3">
                <Data className="fill-gray300" width={20} height={20} />
                <CustomText className=" text-gray300 font-medium">
                  Your data
                </CustomText>
              </View>
              <ChevronRight className="stroke-gray300" />
            </Pressable>
          </View>
        </View> */}

        {/* Personalisation Section */}
        <View className="gap-y-3">
          <View className="gap-y-1">
            <View className="flex bg-white rounded-2xl" style={shadows.card}>
              <Pressable
                className="flex-row justify-between items-center py-3 px-4"
                onPress={() => handlePress("/patient/profile/details")}
              >
                <View className="flex-row items-center gap-3">
                  <UserHeart className="fill-gray300" width={20} height={20} />
                  <CustomText className=" text-gray300 font-medium">
                    User Data
                  </CustomText>
                </View>
                <ChevronRight className="stroke-gray300" />
              </Pressable>
            </View>
          </View>
        </View>
        <View className="flex bg-white rounded-2xl" style={shadows.card}>
          <Pressable
            className="flex-row justify-between items-center py-3 px-4"
            onPress={() => handlePress("/patient/profile/helplines")}
          >
            <View className="flex-row items-center gap-3">
              <Support className="fill-gray300" width={20} height={20} />
              <CustomText className=" text-gray300 font-medium">
                Helplines
              </CustomText>
            </View>
            <ChevronRight className="stroke-gray300" />
          </Pressable>
        </View>
        {/* Help & Support Section */}
        {/* <View className="gap-y-3">
          <CustomText
            letterSpacing="tight"
            className="text-xl font-medium text-black200 ml-4"
          >
            Help & Support
          </CustomText>
          <View className="gap-y-1">
            <View className="flex bg-white rounded-2xl" style={shadows.card}>
              <Pressable
                className="flex-row justify-between items-center py-3 px-4"
                onPress={() => handlePress("/settings/helplines")}
              >
                <View className="flex-row items-center gap-3">
                  <Support className="fill-gray300" width={20} height={20} />
                  <CustomText className=" text-gray300 font-medium">
                    Helplines
                  </CustomText>
                </View>
                <ChevronRight className="stroke-gray300" />
              </Pressable>
            </View>
            <View className="flex bg-white rounded-2xl" style={shadows.card}>
              <Pressable
                className="flex-row justify-between items-center py-3 px-4"
                onPress={() => handlePress("/settings/appearance")}
              >
                <View className="flex-row items-center gap-3">
                  <Question className="fill-gray300" width={20} height={20} />
                  <CustomText className=" text-gray300 font-medium">
                    FAQ
                  </CustomText>
                </View>
                <ChevronRight className="stroke-gray300" />
              </Pressable>
              <View className="h-px flex bg-beige300 mx-4"></View>
              <Pressable
                className="flex-row justify-between items-center py-3 px-4"
                onPress={() => handlePress("/settings/preferences")}
              >
                <View className="flex-row items-center gap-3">
                  <Feedback className="fill-gray300" width={20} height={20} />
                  <CustomText className=" text-gray300 font-medium">
                    Feedback
                  </CustomText>
                </View>
                <ChevronRight className="stroke-gray300" />
              </Pressable>
            </View>
          </View>
        </View> */}

        <View className="flex bg-white rounded-2xl" style={shadows.card}>
          <Pressable
            className="flex-row justify-between items-center py-3 px-4"
            onPress={() => logout()}
          >
            <View className="flex-row items-center gap-3">
              <Logout
                className="stroke-gray300 stroke-2"
                width={20}
                height={20}
              />
              <CustomText className=" text-gray300 font-medium">
                Logout
              </CustomText>
            </View>
            <ChevronRight className="stroke-gray300" />
          </Pressable>
        </View>
      </View>
      {/* </BackButtonWrapper> */}
    </ScrollView>
  );
};

export default SettingsScreen;
