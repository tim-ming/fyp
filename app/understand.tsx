import React, { useEffect, useState } from "react";
import { View, Pressable } from "react-native";
import { Image } from "expo-image";
import CustomText from "@/components/CustomText";
import { shadows } from "@/constants/styles";
import Check from "@/assets/icons/check.svg";
import { useRouter } from "expo-router";
import { updateOnboarded } from "@/api/api";

const SocialMediaScreen = () => {
  const router = useRouter();

  const handleSkipPress = async () => {
    await updateOnboarded();
    router.push("/");
  };

  interface Platform {
    id: string;
    name: string;
    url: string;
    linker: () => void;
    linked: boolean;
  }
  const initialPlatforms = [
    {
      id: "x",
      name: "X",
      url: require("@/assets/icons/twitter.png"),
      linker: () => mockPlatformLinker("x"),
      linked: true,
    },
    {
      id: "instagram",
      name: "Instagram",
      url: require("@/assets/icons/instagram.png"),
      linker: () => mockPlatformLinker("instagram"),
      linked: false,
    },
    {
      id: "reddit",
      name: "Reddit",
      url: require("@/assets/icons/reddit.png"),
      linker: () => mockPlatformLinker("reddit"),
      linked: false,
    },
    {
      id: "facebook",
      name: "Facebook",
      url: require("@/assets/icons/facebook.png"),
      linker: () => mockPlatformLinker("facebook"),
      linked: false,
    },
    {
      id: "linkedin",
      name: "LinkedIn",
      url: require("@/assets/icons/linkedin.png"),
      linker: () => mockPlatformLinker("linkedin"),
      linked: false,
    },
    {
      id: "threads",
      name: "Threads",
      url: require("@/assets/icons/threads.png"),
      linker: () => mockPlatformLinker("threads"),
      linked: false,
    },
  ];

  const [platforms, setPlatforms] = useState<Platform[]>(initialPlatforms);

  const mockPlatformLinker = (id: string) => {
    setPlatforms((prevPlatforms) =>
      prevPlatforms.map((platform) =>
        platform.id === id
          ? { ...platform, linked: !platform.linked }
          : platform
      )
    );
  };

  const skip = () => {
    router.push("/");
  };

  return (
    <View className="flex-1 p-4 bg-blue100 pt-20">
      <CustomText
        letterSpacing="tighter"
        className="text-4xl leading-10 font-medium text-black mb-6"
      >
        Help us better{" "}
        <CustomText letterSpacing="tighter" className="text-blue200">
          understand you.
        </CustomText>
      </CustomText>
      <CustomText className="text-base text-gray300 mb-4 leading-5">
        Link your social media accounts, so we can tailor the app's experience
        unique to you.
      </CustomText>

      <CustomText className=" text-gray100 mb-8">
        It's optional: You control what information you want to share with us.
      </CustomText>
      <View className="flex flex-row flex-wrap -m-2 justify-around mb-5">
        {platforms.map((platform) => (
          <View className="w-1/3 p-2" key={platform.id}>
            <Pressable
              className={`p-3 col-span-1 relative aspect-[10/9] flex items-center justify-center rounded-2xl bg-white `}
              onPress={platform.linker}
              style={shadows.card}
            >
              {platform.linked && (
                <View
                  className={`flex rounded-full absolute -right-2 -top-2 bg-blue200 w-7 h-7 p-1 items-center justify-center`}
                >
                  <Check className="stroke-white stroke-[2]" />
                </View>
              )}
              <Image source={platform.url} className="w-8 h-8" />
            </Pressable>
          </View>
        ))}
      </View>

      <Pressable>
        <CustomText className="text-sm text-blue200 text-center mb-5">
          Find out how and why we need your data.
        </CustomText>
      </Pressable>

      <Pressable
        className="bg-blue200 rounded-full py-3"
        onPress={handleSkipPress}
      >
        <CustomText
          className="text-white text-center text-lg"
          onPress={handleSkipPress}
        >
          Skip
        </CustomText>
      </Pressable>
    </View>
  );
};

export default SocialMediaScreen;
