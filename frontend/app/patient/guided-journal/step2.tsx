// Guided Journal Step 2 Screen
import React, { useEffect, useState } from "react";
import { View, Pressable, ScrollView } from "react-native";
import { router } from "expo-router";
import CustomText from "@/components/CustomText";
import { CognitiveDistortion, GuidedJournalEntryCreate } from "@/types/models";
import { getGuidedJournalEntry, postGuidedJournalEntry } from "@/api/api";
import { capitalizeFirstLetter, getDayOfWeek } from "@/utils/helpers";
import { format } from "date-fns";
import { useJournalStore } from "@/state/data";
import { useHydratedEffect } from "@/hooks/hooks";
import { STEPS_TEXT } from "./constants";

/**
 * List of cognitive distortions
 */
const distortionOptions = [
  {
    id: 1,
    title: CognitiveDistortion.FortuneTelling,
    description: "“I’m going to fail this assignment.”",
  },
  {
    id: 2,
    title: CognitiveDistortion.ShouldStatements,
    description: "“I should have known that.”",
  },
  {
    id: 3,
    title: CognitiveDistortion.MindReading,
    description: "“The audience doesn't like this presentation.”",
  },
  {
    id: 4,
    title: CognitiveDistortion.Catastrophising,
    description: "“I made a mistake, now they’re going to hate me.”",
  },
  {
    id: 5,
    title: CognitiveDistortion.EmotionalReasoning,
    description: "“I am anxious so I will stutter while talking.”",
  },
  {
    id: 6,
    title: CognitiveDistortion.AllOrNothingThinking,
    description: "“If I don’t succeed completely, I’m a total failure.”",
  },
  {
    id: 7,
    title: CognitiveDistortion.BlackAndWhiteThinking,
    description: "“I am a failure.”",
  },
  {
    id: 8,
    title: CognitiveDistortion.Personalisation,
    description: "“They are not talking to me because I am boring.”",
  },
  {
    id: 9,
    title: CognitiveDistortion.DiscountingThePositive,
    description: "“They are only being nice to me because they have to.”",
  },
  {
    id: 10,
    title: CognitiveDistortion.Labelling,
    description: "“I am just a lazy person.”",
  },
];

const GuidedJournalStep2: React.FC = () => {
  const today = new Date();
  const date = format(today, "yyyy-MM-dd");

  const { guidedJournalEntry, setGuidedJournalEntry } = useJournalStore();
  const [selectedDistortions, setSelectedDistortions] = useState<
    CognitiveDistortion[]
  >(guidedJournalEntry?.step2_selected_distortions || []);

  /**
   *  Handles the selection of a distortion
   * @param distortion The selected distortion
   */
  const handleSelectDistortion = (distortion: CognitiveDistortion) => {
    setSelectedDistortions((prevSelected) =>
      prevSelected.includes(distortion)
        ? prevSelected.filter((d) => d !== distortion)
        : [...prevSelected, distortion]
    );
  };

  // Fetch existing journal entry if it exists
  useHydratedEffect(() => {
    if (guidedJournalEntry?.step2_selected_distortions) return;
    const fetchData = async () => {
      const data = await getGuidedJournalEntry(date);
      if (data) {
        setSelectedDistortions(data.body.step2_selected_distortions || []);
        setGuidedJournalEntry({
          ...data.body,
          step2_selected_distortions:
            data.body.step2_selected_distortions || [],
        });
      }
    };
    fetchData();
  }, []);

  /**
   * Handles the next button press
   */
  const handleNext = () => {
    const updatedEntry = {
      ...guidedJournalEntry,
      step2_selected_distortions: selectedDistortions,
    };

    setGuidedJournalEntry(updatedEntry);
    postGuidedJournalEntry({
      body: updatedEntry,
      date: date,
    } as GuidedJournalEntryCreate);

    router.push("/patient/guided-journal/step3");
  };

  return (
    <View className="flex-1 bg-blue100 px-2 pt-12">
      <View>
        <CustomText className="text-[16px] font-semibold text-center text-gray200">
          {capitalizeFirstLetter(getDayOfWeek(today.toISOString()))}
        </CustomText>
        <CustomText className="text-[20px] font-semibold text-center text-gray200">
          {format(date, "dd MMM yyyy")}
        </CustomText>
      </View>

      <View className="flex-row justify-between items-center mt-6 mb-4 px-4">
        <View className="h-1 flex-1 bg-blue200 rounded-full mr-1" />
        <View className="h-1 flex-1 bg-blue200 rounded-full mx-1" />
        <View className="h-1 flex-1 bg-gray-300 rounded-full mx-1" />
        <View className="h-1 flex-1 bg-gray-300 rounded-full ml-1" />
      </View>

      <CustomText className="mt-4 text-[20px] font-semibold text-gray-800 px-4">
        Does your thought have distortions?
      </CustomText>

      <View className="mt-4 mx-2 p-4 bg-white rounded-3xl">
        <CustomText className="text-black100 leading-4 text-[14px]">
          {STEPS_TEXT.TWO}
        </CustomText>
      </View>

      <ScrollView className="mb-16 mt-4">
        {distortionOptions.map((item) => (
          <Pressable
            key={item.id}
            onPress={() => handleSelectDistortion(item.title)}
            className={`p-4 rounded-3xl mb-4 mx-2 ${
              selectedDistortions.includes(item.title)
                ? "bg-blue200"
                : "bg-white"
            }`}
          >
            <CustomText
              className={`text-lg font-semibold ${
                selectedDistortions.includes(item.title)
                  ? "text-white"
                  : "text-gray-800"
              }`}
            >
              {item.title}
            </CustomText>
            <CustomText
              className={`text-base ${
                selectedDistortions.includes(item.title)
                  ? "text-white"
                  : "text-gray-500"
              }`}
            >
              {item.description}
            </CustomText>
          </Pressable>
        ))}
      </ScrollView>

      <View className="flex-1 justify-end mb-6 mx-2">
        <Pressable
          onPress={handleNext}
          className="h-14 bg-blue200 items-center justify-center rounded-full"
        >
          <CustomText className="text-white text-base font-medium">
            Next
          </CustomText>
        </Pressable>
      </View>
    </View>
  );
};

export default GuidedJournalStep2;
