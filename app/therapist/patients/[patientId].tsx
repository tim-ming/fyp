import React from "react";
import { View, ScrollView, Pressable } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import CustomText from "@/components/CustomText";
import { SafeAreaView } from "react-native-safe-area-context";
import { Image } from "expo-image";
import Edit from "@/assets/icons/edit.svg";
import Message from "@/assets/icons/message.svg";
import Notes from "@/assets/icons/notes.svg";
import Info from "@/assets/icons/info.svg";

const ICON_SIZE = 24;

type Patient = {
  name: string;
  risk: string;
  dob: string;
  sex: string;
  occupation: string;
  riskDescription: string;
  treatment: string;
};

const patientsData: { [key: string]: Patient } = {
  "00001": {
    name: "Kok Tim Ming",
    risk: "Severe",
    dob: "01 Jan 2003",
    sex: "Male",
    occupation: "Student",
    riskDescription:
      "Patient has a high likelihood of depression and/or other related mental illnesses.",
    treatment:
      "Immediate initiation of pharmacotherapy and, if severe impairment or poor response to therapy, expedited referral to a mental health specialist for psychotherapy and/or collaborative management.",
  },
  "00002": {
    name: "Thian Ren Ning",
    risk: "Moderately Severe",
    dob: "01 Jan 2003",
    sex: "Female",
    occupation: "Student",
    riskDescription:
      "Patient shows moderate signs of depression and requires monitoring and possible therapy.",
    treatment:
      "Suggested regular counseling sessions and monitoring of symptoms for potential escalation.",
  },
  "00003": {
    name: "Chai Wai Jin",
    risk: "Moderate",
    dob: "01 Jan 2003",
    sex: "Male",
    occupation: "Student",
    riskDescription:
      "Patient is exhibiting mild to moderate depressive symptoms and could benefit from lifestyle changes.",
    treatment:
      "Recommended lifestyle changes and mindfulness practices. No pharmacotherapy needed at this stage.",
  },
  "00004": {
    name: "Lim Yi Xuan",
    risk: "Mild",
    dob: "01 Jan 2003",
    sex: "Female",
    occupation: "Student",
    riskDescription:
      "Patient has mild depressive symptoms. General well-being checkups recommended.",
    treatment:
      "Suggested regular exercise and periodic checkups to ensure no worsening of symptoms.",
  },
  "00005": {
    name: "Takumi Kotobuki",
    risk: "None",
    dob: "01 Jan 2003",
    sex: "Male",
    occupation: "Student",
    riskDescription: "Patient does not exhibit any depressive symptoms.",
    treatment:
      "No treatment required. Continue with regular wellness checkups.",
  },
  "00006": {
    name: "Balqis",
    risk: "Unknown",
    dob: "01 Jan 2003",
    sex: "Female",
    occupation: "Student",
    riskDescription:
      "Unknown risk level. Patient has not been assessed for depressive symptoms.",
    treatment:
      "Assessment required to determine the patient's risk level and treatment plan.",
  },
};

const PatientDetails = () => {
  const router = useRouter();
  const { patientId } = useLocalSearchParams();
  const patient = patientsData[patientId as string];
  const riskColorMap: { [key: string]: string } = {
    Severe: "red300",
    "Moderately Severe": "orange300",
    Moderate: "clay300",
    Mild: "limegreen300",
    None: "gray300",
    Unknown: "gray100",
  };
  const getTextRiskColor = (risk: string) => riskColorMap[risk] || "gray100";
  const textRiskColor = getTextRiskColor(patient.risk);

  return (
    <SafeAreaView className="flex-1 bg-blue100">
      <ScrollView className="flex-1 p-4">
        <View className="flex-row justify-between items-center mb-6 mt-[65px]">
          <View className="flex-row items-center gap-5">
            <View className="p-1 w-16 h-16 items-center justify-center bg-gray-50 rounded-full">
              <Image
                className="w-full h-full rounded-full"
                source="/assets/images/man.jpg"
              />
            </View>
            <View className="flex-col">
              <View className="flex-row items-center gap-x-4">
                <CustomText className="text-[20px] font-medium text-black">
                  {patient.name}
                </CustomText>
                <View
                  className={`border-2 ${
                    patient.risk === "Severe"
                      ? "border-red300"
                      : patient.risk === "Moderately Severe"
                      ? "border-[#cd6000]"
                      : patient.risk === "Moderate"
                      ? "border-[#b68500]"
                      : patient.risk === "Mild"
                      ? "border-[#8d9700]"
                      : patient.risk === "None"
                      ? "border-[#535353]"
                      : "border-gray100"
                  } px-4 py-1 rounded-full`}
                >
                  <CustomText
                    className={`text-${textRiskColor} text-[16px] font-bold`}
                  >
                    {patient.risk.split(" ").join("\n")}
                  </CustomText>
                </View>
              </View>
              <CustomText className="text-gray300 text-[16px]">
                ID: {patientId}
              </CustomText>
            </View>
          </View>
        </View>

        <View className="flex-row justify-center items-center mb-6 gap-4">
          <View className="p-1 w-14 h-14 items-center justify-center rounded-[20px] border-2 border-blue200">
            <Edit width={ICON_SIZE} height={ICON_SIZE} fill="#256CD0" />
          </View>
          <View className="p-1 w-14 h-14 items-center justify-center rounded-[20px] border-2 border-blue200">
            <Message width={ICON_SIZE} height={ICON_SIZE} fill="#256CD0" />
          </View>
          <View className="flex-1 bg-blue200 items-center justify-center py-4 rounded-[20px]">
            <View className="flex-row items-center gap-3">
              <Notes width={ICON_SIZE} height={ICON_SIZE} fill="#FFFFFF" />
              <CustomText className="text-white text-[16px] font-medium">
                Patient Data
              </CustomText>
            </View>
          </View>
        </View>

        <View className="bg-white p-5 rounded-[20px] mb-10">
          <View className="flex-row items-center mt-1 mx-1 mb-4">
            <View className="flex-1">
              <CustomText className="text-[16px] text-gray300 mb-1">
                Date of Birth
              </CustomText>
              <CustomText className="text-[16px] text-black font-medium">
                {patient.dob}
              </CustomText>
            </View>

            <View className="flex-1">
              <CustomText className="text-[16px] text-gray300 mb-1">
                Sex
              </CustomText>
              <CustomText className="text-[16px] text-black font-medium">
                {patient.sex}
              </CustomText>
            </View>
          </View>

          <View className="flex-row items-center mt-1 mx-1 mb-1">
            <View className="flex-1">
              <CustomText className="text-[16px] text-gray300 mb-1">
                Occupation
              </CustomText>
              <CustomText className="text-[16px] text-black font-medium">
                {patient.occupation}
              </CustomText>
            </View>
          </View>
        </View>

        <View className="mb-10">
          <View className="flex-row items-center justify-center mb-[14px] w-[212px]">
            <CustomText className="text-[20px] font-semibold text-black mr-2">
              Depression Risk
            </CustomText>
            <Info width={ICON_SIZE} height={ICON_SIZE} />
          </View>
          <View className="bg-white p-4 rounded-[20px]">
            <CustomText
              className={`text-${textRiskColor} font-bold text-[24px] mb-[14px]`}
            >
              {patient.risk}
            </CustomText>
            <CustomText className="text-gray300 text-[16px]">
              {patient.riskDescription}
            </CustomText>
          </View>
        </View>

        <View className="mb-10">
          <View className="flex-row items-center justify-center mb-[14px] w-[212px]">
            <CustomText className="text-[20px] font-semibold text-black mr-2">
              Proposed Actions
            </CustomText>
          </View>

          <View className="bg-white p-4 rounded-[20px]">
            <CustomText className="text-red300 text-[20px] font-medium mb-[14px]">
              Assess patient’s status
            </CustomText>
            <CustomText className="text-gray300 text-[16px]">
              {patient.riskDescription}
            </CustomText>
            <Pressable className="border border-blue200 rounded-full py-[18px] my-[16px] items-center">
              <CustomText className="text-blue200 text-[16px] font-medium">
                View patient data
              </CustomText>
            </Pressable>

            <View className="h-[1px] bg-gray50 mt-[2px]" />

            <View className="mt-4">
              <CustomText className="text-[20px] font-medium text-black mb-[14px]">
                Treatment
              </CustomText>
              <CustomText className="text-gray300 text-[16px]">
                {patient.treatment}
              </CustomText>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default PatientDetails;
