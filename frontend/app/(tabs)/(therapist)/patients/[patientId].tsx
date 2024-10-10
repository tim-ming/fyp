import React, { useEffect, useState } from "react";
import {
  View,
  ScrollView,
  Pressable,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import CustomText from "@/components/CustomText";
import { SafeAreaView } from "react-native-safe-area-context";
import { Image } from "expo-image";
import Edit from "@/assets/icons/edit.svg";
import Message from "@/assets/icons/message.svg";
import Notes from "@/assets/icons/notes.svg";
import Info from "@/assets/icons/info.svg";
import { getDepressionRisks, getPatientData, getPatients } from "@/api/api";
import { UserWithPatientData } from "@/types/models";
import { useHydratedEffect } from "@/hooks/hooks";
import { BACKEND_URL } from "@/constants/globals";
import { useAuth } from "@/state/auth";
import { eachDayOfInterval, format } from "date-fns";
import { Dimensions } from "react-native";
import { LineChart } from "react-native-chart-kit";
import { LineChartData } from "react-native-chart-kit/dist/line-chart/LineChart";
import { LogBox } from "react-native";

const ICON_SIZE = 24;

const riskDescriptions: { [key: string]: string } = {
  Severe:
    "Patient has a high likelihood of depression and/or other related mental illnesses.",
  "Moderately Severe":
    "Patient shows moderate signs of depression and requires monitoring and possible therapy.",
  Moderate:
    "Patient is exhibiting mild to moderate depressive symptoms and could benefit from lifestyle changes.",
  Mild: "Patient has mild depressive symptoms. General well-being checkups recommended.",
  None: "Patient does not exhibit any depressive symptoms.",
  Unknown:
    "Unknown risk level. Patient has not been assessed for depressive symptoms.",
};

const treatments: { [key: string]: string } = {
  Severe:
    "Immediate initiation of pharmacotherapy and, if severe impairment or poor response to therapy, expedited referral to a mental health specialist for psychotherapy and/or collaborative management.",
  "Moderately Severe":
    "Suggested regular counseling sessions and monitoring of symptoms for potential escalation.",
  Moderate:
    "Recommended lifestyle changes and mindfulness practices. No pharmacotherapy needed at this stage.",
  Mild: "Suggested regular exercise and periodic checkups to ensure no worsening of symptoms.",
  None: "No treatment required. Continue with regular wellness checkups.",
  Unknown:
    "Assessment required to determine the patient's risk level and treatment plan.",
};

const DepressionGraph = ({ risks }: { risks: LineChartData }) => {
  const chartConfig = {
    backgroundGradientFrom: "#fff",
    backgroundGradientFromOpacity: 1,
    backgroundGradientTo: "#fff",
    backgroundGradientToOpacity: 1,
    fillShadowGradientFrom: "#256CD0",
    fillShadowGradientTo: "#256CD0",
    fillShadowGradientFromOpacity: 0.8,
    fillShadowGradientToOpacity: 0,
    color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
    strokeWidth: 2,
    barPercentage: 0.5,
    useShadowColorFromDataset: false,
  };

  const screenWidth = Dimensions.get("window").width - 64;

  return (
    risks && (
      <LineChart
        data={risks}
        width={screenWidth}
        height={250}
        chartConfig={chartConfig}
        fromZero={true} // Start Y-axis from zero
        yAxisInterval={1} // Set Y-axis steps
        segments={5} // Number of horizontal lines, for steps of 0.2 (1/0.2 = 5)
      />
    )
  );
};

const RiskTable = () => {
  return (
    <View className="w-3/4">
      {/* Header Row */}
      <View className="flex-row border-b border-gray-300 pb-2">
        <CustomText className="flex-1 text-gray-600 font-bold">
          Risk Level
        </CustomText>
        <CustomText className="flex-1 text-gray-600 font-bold">
          Value Range
        </CustomText>
      </View>
      {/* Table Row 1 */}
      <View className="flex-row py-1">
        <CustomText className="flex-1 text-black">No depression</CustomText>
        <CustomText className="flex-1 text-black">0</CustomText>
      </View>

      {/* Table Row 5 */}
      <View className="flex-row py-1">
        <CustomText className="flex-1 text-black">Depression</CustomText>
        <CustomText className="flex-1 text-black">1</CustomText>
      </View>
      {/* <ValueLine value={depressionRisk}/> */}
    </View>
  );
};

const PatientDetails = () => {
  const router = useRouter();
  const { patientId } = useLocalSearchParams();
  const [patient, setPatient] = useState<UserWithPatientData | null>(null);
  const [loading, setLoading] = useState(true);
  const [risks, setRisks] = useState<LineChartData>();

  const originalConsoleError = console.error;
  // remove default props error message for LineChart
  console.error = (message, ...args) => {
    if (typeof message === "string") {
      return;
    }
    originalConsoleError.apply(console, [message, ...args]);
  };

  useHydratedEffect(() => {
    const fetchPatient = async (patientId: number) => {
      try {
        const patients = await getPatients();
        if (!patients.find((p) => p.id === patientId)) {
          throw new Error("Patient is not found");
        }
        const data = await getPatientData(patientId);
        setPatient(data);
        console.log(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    const fetch = async () => {
      try {
        let risks = (
          await getDepressionRisks(parseInt(patientId as string))
        ).toReversed();
        // filter for the last 7 days only, but raw could be smaller than 7
        if (risks.length > 7) risks = risks.slice(risks.length - 7);
        const mapped = {
          labels: risks.map(({ date }) => format(date, "dd/MM")),
          datasets: [
            {
              data: risks.map(({ value }) => value),
            },
          ],
        };
        setRisks(mapped);
      } catch (e) {
        console.error(e);
      }
    };

    fetchPatient(Number(patientId));
    fetch();
  }, [patientId]);

  const riskColorMap: { [key: string]: string } = {
    Severe: "red300",
    "Moderately Severe": "orange300",
    Moderate: "clay300",
    Mild: "limegreen300",
    None: "gray300",
    Unknown: "gray100",
  };
  const getTextRiskColor = (risk: string) => riskColorMap[risk] || "gray100";
  const textRiskColor = getTextRiskColor(patient?.patient_data?.severity || "");

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-blue100">
        <ActivityIndicator size="large" color="#256CD0" />
      </View>
    );
  }

  const severity = patient?.patient_data?.severity || "Unknown";
  const riskDescription = riskDescriptions[severity];
  const treatment = treatments[severity];

  return (
    <SafeAreaView className="flex-1 bg-blue100">
      <ScrollView className="flex-1 p-4">
        <View className="flex-row justify-between items-center mb-6 mt-12">
          <View className="flex-row items-center gap-5">
            <View className="p-1 w-16 h-16 items-center justify-center bg-gray-50 rounded-full">
              <Image
                className="w-full h-full rounded-full"
                source={{
                  uri: BACKEND_URL + patient?.image,
                }}
              />
            </View>
            <View className="flex-col">
              <View className="flex-row items-center gap-x-4">
                <CustomText className="text-[20px] font-medium text-black">
                  {patient?.name}
                </CustomText>
                <View
                  className={`border-2 ${
                    severity === "Severe"
                      ? "border-red300"
                      : severity === "Moderately Severe"
                      ? "border-[#cd6000]"
                      : severity === "Moderate"
                      ? "border-[#b68500]"
                      : severity === "Mild"
                      ? "border-[#8d9700]"
                      : severity === "None"
                      ? "border-[#535353]"
                      : "border-gray100"
                  } px-4 py-1 rounded-full`}
                >
                  <CustomText
                    className={`text-${textRiskColor} text-[16px] font-bold`}
                  >
                    {severity.split(" ").join("\n")}
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
          <Pressable
            onPress={() => {
              router.push(`/(therapist)/patients/${patientId}/notes`);
            }}
            className="p-1 w-14 h-14 items-center justify-center rounded-[20px] border-2 border-blue200"
          >
            <Edit width={ICON_SIZE} height={ICON_SIZE} fill="#256CD0" />
          </Pressable>
          <Pressable
            className="p-1 w-14 h-14 items-center justify-center rounded-[20px] border-2 border-blue200"
            onPress={() => {
              router.push(`/(therapist)/chat/${patientId}`);
            }}
          >
            <Message width={ICON_SIZE} height={ICON_SIZE} fill="#256CD0" />
          </Pressable>
          <Pressable
            onPress={() =>
              router.push(`/(therapist)/patients/${patientId}/data`)
            }
            className="flex-1 bg-blue200 items-center justify-center py-4 rounded-[20px]"
          >
            <View className="flex-row items-center gap-3">
              <Notes width={ICON_SIZE} height={ICON_SIZE} fill="#FFFFFF" />
              <CustomText className="text-white text-[16px] font-medium">
                Patient Data
              </CustomText>
            </View>
          </Pressable>
        </View>

        <View className="bg-white p-5 rounded-[20px] mb-10">
          <View className="flex-row items-center mt-1 mx-1 mb-4">
            <View className="flex-1">
              <CustomText className="text-[16px] text-gray300 mb-1">
                Date of Birth
              </CustomText>
              <CustomText className="text-[16px] text-black font-medium">
                {patient?.dob ? patient?.dob : "-"}
              </CustomText>
            </View>

            <View className="flex-1">
              <CustomText className="text-[16px] text-gray300 mb-1">
                Sex
              </CustomText>
              <CustomText className="text-[16px] text-black font-medium">
                {patient?.sex
                  ? patient.sex === "m"
                    ? "Male"
                    : patient.sex === "f"
                    ? "Female"
                    : patient.sex
                  : "-"}
              </CustomText>
            </View>
          </View>

          <View className="flex-row items-center mt-1 mx-1 mb-1">
            <View className="flex-1">
              <CustomText className="text-[16px] text-gray300 mb-1">
                Occupation
              </CustomText>
              <CustomText className="text-[16px] text-black font-medium">
                {patient?.occupation ? patient?.occupation : "-"}
              </CustomText>
            </View>
          </View>
        </View>

        <View className="mb-10">
          <View className="flex-row mb-[14px] ml-4">
            <CustomText className="text-[20px] font-semibold text-black">
              Depression Risk
            </CustomText>
            {/* <Info width={ICON_SIZE} height={ICON_SIZE} /> */}
          </View>
          <View className="bg-white pt-4  rounded-[20px] overflow-hidden pb-4">
            <View className=" px-4">
              <CustomText
                className={`text-${textRiskColor} font-bold text-[24px] mb-[14px]`}
              >
                {severity}
              </CustomText>
              <CustomText className="text-gray300 text-sm mb-2">
                {riskDescription}
              </CustomText>
              <CustomText className="text-sm text-gray100">
                The below chart shows the patient's depression risk level over
                the past week based on their journals.
              </CustomText>
              <View className="h-[1px] bg-gray50 my-4" />
            </View>
            <View className="">
              {risks && risks.datasets[0].data.length === 0 && (
                <CustomText className="text-gray300 text-[16px] text-center mb-4">
                  No data available for the past week.
                </CustomText>
              )}
              {risks && risks.datasets[0].data.length > 0 && (
                <DepressionGraph risks={risks} />
              )}
            </View>
            <View className="flex-row items-center justify-center">
              {/* if prob >= 0.8:
                risk = "Severe",
            elif prob >= 0.6:
                risk = "Moderately Severe",
            elif prob >= 0.4: 
                risk = "Moderate",
            elif prob >= 0.2:
                risk = "Mild"
            else:
                risk = "None" */}
              <RiskTable />
            </View>
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
              Assess patient's status
            </CustomText>
            <CustomText className="text-gray300 text-[16px]">
              Evaluate the patient's current mental health status by reviewing
              their consented data to monitor symptoms and track progress.
            </CustomText>
            <Pressable
              onPress={() =>
                router.push(`/(therapist)/patients/${patientId}/data`)
              }
              className="border border-blue200 rounded-full py-[18px] my-[16px] items-center"
            >
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
                {treatment}
              </CustomText>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};
const ValueLine: React.FC<{ value: number }> = ({ value }) => {
  return (
    <View style={styles.container}>
      {/* Line with circles at both ends */}
      <View style={styles.lineContainer}>
        <View style={styles.circle} />
        <View style={styles.line}>
          {/* Marker representing the value */}
          {/* <View
            style={[
              styles.marker,
              { left: `${value * 100}%` }, // Place marker based on value
            ]}
          /> */}
        </View>
        <View style={styles.circle} />
      </View>

      {/* Labels for the start and end */}
      <View style={styles.labelsContainer}>
        <CustomText style={styles.label}>0</CustomText>
        <CustomText style={styles.label}>1</CustomText>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    alignItems: "center",
  },
  lineContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  circle: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "orange",
  },
  line: {
    width: 200, // Adjust the width based on your design
    height: 2,
    backgroundColor: "black",
    position: "relative",
    marginHorizontal: 5,
  },
  marker: {
    position: "absolute",
    top: -5, // Adjust to center marker on the line
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "blue", // Marker color
  },
  labelsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: 220, // Adjust width based on line length
  },
  label: {
    color: "blue",
  },
});

export default PatientDetails;
