// Settings Screen
import ChevronRight from "@/assets/icons/chevron-right.svg";
import Logout from "@/assets/icons/logout.svg";
import CustomText from "@/components/CustomText";
import { shadows } from "@/constants/styles";
import useTherapistStore from "@/state/assignedTherapist";
import { useAuth } from "@/state/auth";
import { Href, router } from "expo-router";
import React from "react";
import { Pressable, SafeAreaView, ScrollView, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const SettingsScreen = () => {
  const insets = useSafeAreaInsets();
  const handlePress = (screen: Href<string>) => {
    router.push(screen);
  };
  const auth = useAuth();
  const therapist = useTherapistStore();

  /**
   * Logs out the user
   */
  const logout = () => {
    auth.reset();
    therapist.reset();
    router.push("/signin");
  };

  return (
    <SafeAreaView className="flex-1 bg-blue100">
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
        <View className="flex-1 bg-blue100 px-4 gap-y-7">
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
          {/* <View className="gap-y-3">
          <CustomText
            letterSpacing="tight"
            className="text-xl font-medium text-black200 ml-4"
          >
            Personalisation
          </CustomText>
          <View className="gap-y-1">
            <View className="flex bg-white rounded-2xl" style={shadows.card}>
              <Pressable
                className="flex-row justify-between items-center py-3 px-4"
                onPress={() => handlePress("/settings/appearance")}
              >
                <View className="flex-row items-center gap-3">
                  <Moon className="fill-gray300" width={20} height={20} />
                  <CustomText className=" text-gray300 font-medium">
                    Appearance
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
                  <UserHeart className="fill-gray300" width={20} height={20} />
                  <CustomText className=" text-gray300 font-medium">
                    Preferences
                  </CustomText>
                </View>
                <ChevronRight className="stroke-gray300" />
              </Pressable>
            </View>
            <View className="flex bg-white rounded-2xl" style={shadows.card}>
              <Pressable
                className="flex-row justify-between items-center py-3 px-4"
                onPress={() => handlePress("/settings/helplines")}
              >
                <View className="flex-row items-center gap-3">
                  <Lock className="fill-gray300" width={20} height={20} />
                  <CustomText className=" text-gray300 font-medium">
                    Security
                  </CustomText>
                </View>
                <ChevronRight className="stroke-gray300" />
              </Pressable>
            </View>
          </View>
        </View> */}

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
    </SafeAreaView>
  );
};

export default SettingsScreen;
