import EatIcon from "@/assets/icons/eat.svg";
import HeartIcon from "@/assets/icons/heart.svg";
import MoonIcon from "@/assets/icons/moon.svg";
import CustomText from "@/components/CustomText";
import { Colors } from "@/constants/Colors";
import { getStatus } from "@/constants/globals";
import { shadows } from "@/constants/styles";
import { Slider } from "@miblanchard/react-native-slider";
import { router } from "expo-router";
import React, { useState } from "react";
import { Pressable, View } from "react-native";

interface MoodSliderSectionProps {
  label: string;
  value: number;
  setValue: (value: number) => void;
  getStatus: (value: number) => string;
  thumbIcon: React.ReactNode;
}

const Thumb: React.FC<MoodSliderSectionProps["thumbIcon"]> = (thumbIcon) => (
  <View
    style={shadows.card}
    className="w-8 h-8 rounded-full bg-white flex justify-center items-center"
  >
    {thumbIcon}
  </View>
);
// New component for slider sections
const MoodSliderSection: React.FC<MoodSliderSectionProps> = ({
  label,
  value,
  setValue,
  getStatus,
  thumbIcon,
}) => {
  return (
    <View className="w-full mb-12 items-center">
      <CustomText className="text-base leading-4 text-gray200">
        {label}
      </CustomText>
      <CustomText className="text-2xl font-medium mb-2 text-black200">
        {getStatus(value)}
      </CustomText>
      <View className="flex-1 w-4/5 bg-gray50 p-1 rounded-full">
        <Slider
          value={value}
          onValueChange={(v) => setValue(v[0])}
          minimumValue={0}
          maximumValue={1}
          containerStyle={{ height: "auto" }}
          minimumTrackTintColor={Colors.blue200}
          maximumTrackTintColor={Colors.blue200}
          trackStyle={{
            height: 32,
            borderRadius: 9999,
            backgroundColor: "transparent",
          }}
          thumbStyle={{
            width: 32,
            height: 32,
            borderRadius: 9999,
            backgroundColor: "#fff",
          }}
          renderThumbComponent={() => Thumb(thumbIcon)}
        />
      </View>
    </View>
  );
};

export default function MoodScreen() {
  const [feeling, setFeeling] = useState(0.5);
  const [eating, setEating] = useState(0.5);
  const [sleeping, setSleeping] = useState(0.5);

  const submit = () => {
    router.push("/");
  };
  const skip = () => {
    router.push("/");
  };

  return (
    <View className="flex-1 justify-center items-center bg-blue100 p-5">
      <View className="flex-1 justify-center items-center w-full">
        <CustomText
          letterSpacing="tight"
          className="text-xl font-medium mb-12 text-black"
        >
          How are you today?
        </CustomText>
      </View>

      <View className="flex-1 justify-center w-full">
        <MoodSliderSection
          label="I feel"
          value={feeling}
          setValue={setFeeling}
          getStatus={getStatus}
          thumbIcon={
            <HeartIcon width={24} height={24} className="fill-gray300" />
          }
        />

        <MoodSliderSection
          label="I eat"
          value={eating}
          setValue={setEating}
          getStatus={getStatus}
          thumbIcon={
            <EatIcon width={24} height={24} className="fill-gray300" />
          }
        />

        <MoodSliderSection
          label="Last night, I slept"
          value={sleeping}
          setValue={setSleeping}
          getStatus={getStatus}
          thumbIcon={
            <MoonIcon width={24} height={24} className="fill-gray300" />
          }
        />
      </View>
      <View className="flex-1 justify-end w-full">
        <Pressable
          onPress={submit}
          className="w-full h-14 bg-blue200 rounded-full justify-center items-center mb-2"
        >
          <CustomText className="text-base font-medium text-white">
            Next
          </CustomText>
        </Pressable>
        <Pressable
          onPress={skip}
          className="w-full h-14 border border-blue200 rounded-full justify-center items-center"
        >
          <CustomText className="text-base font-medium text-blue200">
            Skip
          </CustomText>
        </Pressable>
      </View>
    </View>
  );
}
