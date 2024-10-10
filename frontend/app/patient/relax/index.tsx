import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  Easing,
  Modal,
  Pressable,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { router } from "expo-router";
import CustomText from "@/components/CustomText";
import ProgressBar from "@/components/ProgressBar";
import { Colors } from "@/constants/Colors";
import { sleep } from "@/utils/helpers";
import { format } from "date-fns";
import { Slider } from "@miblanchard/react-native-slider";
import { shadows } from "@/constants/styles";
import BackButtonWrapper from "@/components/Back";

const RING_SIZES = [168, 168, 168, 168, 168, 168, 168, 168, 168, 168];
const Animation = {
  BREATHING_STAGGER: 250,
  SCALE_UP_DURATION: 4000,
  SCALE_DOWN_DURATION: 4000,
  BREATHE_IN_MSG: "hold",
  BREATHE_OUT_MSG: "release",
};

type Settings = {
  duration: number;
};

const getTimeLeft = (progress: number, duration: number) => {
  const timeLeftInSeconds = duration * (1 - progress);
  const minutes = Math.floor(timeLeftInSeconds / 60);
  const seconds = Math.floor(timeLeftInSeconds % 60);
  return format(new Date(0, 0, 0, 0, minutes, seconds), "mm:ss");
};

const SelectionPhase: React.FC<{
  onStart: () => void;
  settings: Settings;
  setSettings: (settings: Settings) => void;
}> = ({ onStart, settings, setSettings }) => {
  const TRACK_MARKS = [60, 120, 300, 600];
  const DESCRIPTIONS = ["1m", "2m", "5m", "10m"];
  return (
    <>
      <View className="flex-1 justify-center items-center bg-blue100 bg-opacity-50">
        <BackButtonWrapper className="absolute top-4 left-4"></BackButtonWrapper>
        <View className="w-4/5 p-6 bg-white rounded-lg">
          <CustomText className="text-xl font-medium mb-4 text-gray800">
            Set Session Duration
          </CustomText>

          <CustomText className="text-base mb-2 text-gray500">
            {`${settings.duration} seconds`}
          </CustomText>

          <View className="flex-1 p-1 rounded-full">
            <Slider
              value={settings.duration}
              onValueChange={(v) =>
                setSettings({ ...settings, duration: v[0] })
              }
              minimumValue={30}
              maximumValue={600}
              step={30}
              minimumTrackTintColor={Colors.blue200}
              maximumTrackTintColor={Colors.gray50}
              containerStyle={{ height: "auto", marginVertical: 16 }}
              trackMarks={TRACK_MARKS}
              renderTrackMarkComponent={(index) => (
                <View className="justify-center ml-[12px] items-center">
                  <View className="h-3 w-[1px] bg-gray200"></View>
                  <CustomText className="absolute top-5 text-xs text-gray300">
                    {DESCRIPTIONS[index]}
                  </CustomText>
                </View>
              )}
              thumbStyle={{
                width: 24,
                height: 24,
                borderRadius: 9999,
                backgroundColor: "#fff",
                borderWidth: 1,
                borderColor: Colors.gray50,
                ...shadows.card,
              }}
            />
          </View>
          <Pressable
            onPress={onStart}
            className="mt-6 w-full h-12 bg-blue200 rounded-full justify-center items-center"
          >
            <CustomText className="text-white text-base font-medium">
              Start
            </CustomText>
          </Pressable>
        </View>
      </View>
    </>
  );
};

const BreathingPhase: React.FC<{
  settings: Settings;
  onEndEarly: () => void;
  onComplete: () => void;
}> = ({ settings, onEndEarly, onComplete }) => {
  const [progress, setProgress] = useState(0);
  const [breathingPhase, setBreathingPhase] = useState(
    Animation.BREATHE_OUT_MSG
  );
  const [menuOpen, setMenuOpen] = useState(false);
  const [sliderVisible, setSliderVisible] = useState(false); // State to control the overlay
  const progressValue = new Animated.Value(0);

  const scaleAnims = useRef(
    Array.from({ length: RING_SIZES.length }, () => new Animated.Value(1))
  );

  const animateRing = () => {
    scaleAnims.current.forEach((scaleAnim, index) => {
      const a = Animated.timing(scaleAnim, {
        toValue: 2,
        duration: Animation.SCALE_UP_DURATION,
        easing: Easing.bezier(0, 0.67, 0.34, 1),
        useNativeDriver: true,
      });
      const b = Animated.timing(scaleAnim, {
        toValue: 1,
        duration: Animation.SCALE_DOWN_DURATION,
        easing: Easing.bezier(0, 0.25, 0.64, 1),
        useNativeDriver: true,
      });
      const calla = () => {
        a.start(() => {
          if (index == 0) {
            setBreathingPhase(Animation.BREATHE_IN_MSG);
          }
          callb();
        });
      };
      const callb = () => {
        b.start(() => {
          if (index == 0) {
            setBreathingPhase(Animation.BREATHE_OUT_MSG);
          }
          calla();
        });
      };
      sleep(index * Animation.BREATHING_STAGGER).then(() => {
        calla();
      });
    });
  };

  const animateProgress = () => {
    Animated.timing(progressValue, {
      toValue: 1,
      duration: settings.duration * 1000, // Use dynamic session duration
      useNativeDriver: false,
      easing: Easing.linear,
    }).start();

    progressValue.addListener(({ value }) => {
      setProgress(value);
    });
  };
  const complete = () => {
    // TODO: log something
    onComplete();
    router.push("/");
  };
  const endEarly = () => {
    // TODO: log something
    onEndEarly();
    router.push("/");
  };

  useEffect(() => {
    animateRing();
    animateProgress();

    return () => {
      progressValue.removeAllListeners();
    };
  }, [settings.duration]);

  return (
    <TouchableWithoutFeedback onPress={() => setMenuOpen(!menuOpen)}>
      <View className="flex-1 justify-center items-center bg-blue100 px-4">
        {/* Progress bar and time left */}
        <View
          className={`${
            !menuOpen ? "opacity-50" : "opacity-100"
          } w-full absolute top-4 justify-center items-center`}
        >
          <View className="w-full justify-center items-center rounded-full">
            <ProgressBar
              className="h-2 w-[90%] bg-gray-300 rounded-full overflow-hidden"
              progress={progress}
              barStyle={{ backgroundColor: Colors.blue200 }}
            />
          </View>
          <CustomText className={`text-sm font-medium text-gray100`}>
            {getTimeLeft(progress, settings.duration)} Left
          </CustomText>
        </View>

        {/* Rings and breathing phase */}
        <View
          className={`${
            !menuOpen ? "opacity-100" : "opacity-20"
          } absolute flex items-center justify-center`}
        >
          {scaleAnims.current.map((scaleAnim, index) => (
            <Animated.View
              key={index}
              style={{
                transform: [{ scale: scaleAnim }],
                width: RING_SIZES[index],
                height: RING_SIZES[index],
              }}
              className="absolute rounded-full border border-gray50"
            ></Animated.View>
          ))}
          <CustomText className="absolute text-xl text-gray300">
            {breathingPhase}
          </CustomText>
        </View>
        {!menuOpen && progress == 1 && (
          <View className={` absolute bottom-4 w-full px-4`}>
            <Pressable className="h-14 bg-blue200 items-center justify-center rounded-full">
              <CustomText
                className="text-white text-base font-medium"
                onPress={() => {
                  complete();
                }}
              >
                Complete
              </CustomText>
            </Pressable>
          </View>
        )}

        {menuOpen && (
          <>
            <View className="w-[90%] bg-white p-4 rounded-lg border border-gray50">
              <CustomText
                letterSpacing="tight"
                className="text-xl mb-2 font-medium text-gray200"
              >
                Breathe
              </CustomText>
              <CustomText className="leading-5 text-gray100">
                Deep breathing helps to reduce stress and promote relaxation. It
                involves taking slow, deep breaths, filling your lungs with air
                and then exhaling slowly.
              </CustomText>
            </View>
            <View className={` absolute bottom-4 w-full px-4`}>
              <Pressable className="h-14 bg-blue200 items-center justify-center rounded-full">
                <CustomText
                  className="text-white text-base font-medium"
                  onPress={() => {
                    endEarly();
                  }}
                >
                  End Session
                </CustomText>
              </Pressable>
            </View>
          </>
        )}
      </View>
    </TouchableWithoutFeedback>
  );
};

const Screen = () => {
  const [phase, setPhase] = useState<"selection" | "breathing">("selection");
  const [settings, setSettings] = useState<Settings>({ duration: 300 });
  function onStart() {
    setPhase("breathing");
  }
  function onEndEarly() {
    setPhase("selection");
  }
  function onComplete() {
    setPhase("selection");
  }

  return phase == "selection" ? (
    <SelectionPhase
      onStart={onStart}
      settings={settings}
      setSettings={setSettings}
    />
  ) : (
    <BreathingPhase
      onEndEarly={onEndEarly}
      onComplete={onComplete}
      settings={settings}
    />
  );
};

export default Screen;
