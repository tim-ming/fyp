import CustomText from "@/components/CustomText";
import ProgressBar from "@/components/ProgressBar";
import { Colors } from "@/constants/Colors";
import { sleep } from "@/utils/helpers";
import { format } from "date-fns";
import { router } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  Easing,
  Pressable,
  TouchableWithoutFeedback,
  View,
} from "react-native";

const RING_SIZES = [168, 168, 168, 168, 168, 168, 168, 168, 168, 168];
const Animation = {
  BREATHING_STAGGER: 250,
  SCALE_UP_DURATION: 4000, // Duration for "Breathe In"
  SCALE_DOWN_DURATION: 4000, // Duration for "Breathe Out"
  BREATHE_IN_MSG: "hold",
  BREATHE_OUT_MSG: "release",
};
const SESSION_DURATION_S = 60;

const getTimeLeft = (progress: number) => {
  const timeLeftInSeconds = SESSION_DURATION_S * (1 - progress);
  const minutes = Math.floor(timeLeftInSeconds / 60);
  const seconds = Math.floor(timeLeftInSeconds % 60);

  return format(new Date(0, 0, 0, 0, minutes, seconds), "mm:ss");
};

const BreathingScreen = () => {
  const progressValue = new Animated.Value(0);

  const [progress, setProgress] = useState(0);

  const [breathingPhase, setBreathingPhase] = useState(
    Animation.BREATHE_OUT_MSG
  );

  const [menuOpen, setMenuOpen] = useState(true);

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
      duration: SESSION_DURATION_S * 1000,
      useNativeDriver: false,
      easing: Easing.linear,
    }).start();

    progressValue.addListener(({ value }) => {
      setProgress(value);
    });
  };

  const focus = () => {
    setMenuOpen(!menuOpen);
  };

  const finish = () => {
    // TODO: log something

    router.push("/relax");
  };

  useEffect(() => {}, [menuOpen]);

  useEffect(() => {
    animateRing();
    animateProgress();

    return () => {
      progressValue.removeAllListeners();
    };
  }, []);

  return (
    <TouchableWithoutFeedback onPress={focus}>
      <View className="flex-1 justify-center items-center bg-blue100 px-4">
        <View
          className={`${
            menuOpen ? "opacity-50" : "opacity-100"
          } w-full absolute top-4 justify-center items-center`}
        >
          <View className="w-full justify-center items-center rounded-full">
            <ProgressBar
              className="h-2 w-[90%] bg-gray-300 rounded-full overflow-hidden"
              progress={progress}
              barStyle={{ backgroundColor: Colors.blue200 }}
            />
          </View>
          <CustomText className={` text-sm font-medium text-gray100`}>
            {getTimeLeft(progress)} Left
          </CustomText>
        </View>

        <View
          className={`${
            menuOpen ? "opacity-100" : "opacity-20"
          } absolute flex items-center justify-center`}
        >
          {/* Dynamically generated rings */}
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
          {/* Breathing phase text */}
          <CustomText className="absolute text-xl text-gray300">
            {breathingPhase}
          </CustomText>
        </View>

        {!menuOpen && (
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
                    finish();
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

export default BreathingScreen;
