import React, { useEffect, useState } from "react";
import { View, FlatList, Pressable, Platform } from "react-native";
import { useRouter } from "expo-router";
import CustomText from "@/components/CustomText";
import { SafeAreaView } from "react-native-safe-area-context";
import { shadows } from "@/constants/styles";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as SecureStore from "expo-secure-store";
import { BACKEND_URL, getToken } from "@/constants/globals";

const allPatientsData = [
  { id: "00001", name: "Kok Tim Ming", risk: "Severe" },
  { id: "00002", name: "Thian Ren Ning", risk: "Moderately Severe" },
  { id: "00003", name: "Chai Wai Jin", risk: "Moderate" },
  { id: "00004", name: "Lim Yi Xuan", risk: "Mild" },
  { id: "00005", name: "Takumi Kotobuki", risk: "None" },
  { id: "00006", name: "Balqis", risk: "Unknown" },
  { id: "00007", name: "Nicole", risk: "Severe" },
  { id: "00008", name: "Adam", risk: "Moderately Severe" },
  { id: "00009", name: "Alan", risk: "Moderate" },
  { id: "00010", name: "Mike", risk: "Mild" },
  { id: "00011", name: "Patricia", risk: "Unknown" },
  { id: "00012", name: "Catriona", risk: "Severe" },
  { id: "00013", name: "Jeffrey", risk: "Moderately Severe" },
  { id: "00014", name: "Tony", risk: "Moderate" },
  { id: "00015", name: "Timothy", risk: "Mild" },
];

const PAGE_SIZE = 6;

const PatientsList = () => {
  const router = useRouter();

  const [username, setUsername] = useState("");
  const [visiblePatients, setVisiblePatients] = useState(
    allPatientsData.slice(0, PAGE_SIZE)
  );
  const [showLess, setShowLess] = useState(false);

  const getUsername = async (): Promise<string> => {
    const token = getToken();
    if (!token) {
      throw new Error("No token found");
    }
    const response = await fetch(`${BACKEND_URL}/users/me`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error(
        `Failed to fetch username: ${response.status} ${response.statusText}`
      );
    }

    const profile: { name: string } = await response.json();
    return profile.name;
  };

  useEffect(() => {
    const fetchData = async () => {
      const name = await getUsername();
      setUsername(name);
    };

    fetchData();
  }, []);

  const togglePatientsVisibility = () => {
    if (showLess) {
      setVisiblePatients(allPatientsData.slice(0, PAGE_SIZE));
      setShowLess(false);
    } else {
      const currentLength = visiblePatients.length;
      const nextPatients = allPatientsData.slice(
        currentLength,
        currentLength + PAGE_SIZE
      );
      setVisiblePatients([...visiblePatients, ...nextPatients]);

      if (currentLength + PAGE_SIZE >= allPatientsData.length) {
        setShowLess(true);
      }
    }
  };

  const renderItem = ({
    item,
    index,
  }: {
    item: (typeof allPatientsData)[0];
    index: number;
  }) => (
    <Pressable
      className={`flex-row justify-between p-4 ${
        index % 2 === 0 ? "bg-gray0" : "bg-white"
      }`}
      onPress={() => router.push(`/therapist/patients/${item.id}`)}
    >
      <CustomText className="flex-1 text-gray300">{item.name}</CustomText>
      <CustomText
        className={`flex-1 ${
          item.risk === "Severe"
            ? "text-red300 font-semibold"
            : item.risk === "Moderately Severe"
            ? "text-orange300"
            : item.risk === "Moderate"
            ? "text-clay300"
            : item.risk === "Mild"
            ? "text-limegreen300"
            : item.risk === "None"
            ? "text-gray300"
            : "text-gray100"
        }`}
      >
        {item.risk}
      </CustomText>
    </Pressable>
  );

  return (
    <SafeAreaView className="flex-1 p-4 bg-blue100">
      <View className="mb-6 mt-16">
        <CustomText className="text-2xl font-medium text-gray300">
          Hi,
          <CustomText className="text-2xl font-medium text-black">
            {" "}
            {`Dr. ${username}`}.
          </CustomText>
        </CustomText>
        <View className="flex-row justify-between mt-4">
          <View
            className="flex-1 bg-white rounded-xl p-6 mx-2"
            style={shadows.card}
          >
            <CustomText className="text-[26px] font-semibold text-gray-800 mb-1">
              21
            </CustomText>
            <CustomText className="text-[14px] text-black">Patients</CustomText>
          </View>
          <View
            className="flex-[3] bg-white rounded-xl p-6 mx-2"
            style={shadows.card}
          >
            <CustomText className="text-[26px] font-semibold text-red-600 mb-1">
              2
            </CustomText>
            <CustomText className="text-[14px] text-black">
              Patients requiring immediate attention
            </CustomText>
          </View>
        </View>
      </View>

      <CustomText className="text-[20px] font-semibold text-black mb-3">
        Patients
      </CustomText>

      <View className="flex-row justify-between p-4 bg-white rounded-t-xl mx-[-16px]">
        <CustomText className="flex-1 text-black font-medium">Name</CustomText>
        <CustomText className="flex-1 text-black font-medium">
          Depression Risk
        </CustomText>
      </View>

      <FlatList
        data={visiblePatients}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        className="mx-[-16px] mb-[-16px]"
        ListFooterComponent={() => (
          <Pressable
            className="p-3 bg-gray0 items-center rounded-b-xl"
            onPress={togglePatientsVisibility}
          >
            <CustomText className="text-blue200 font-medium underline">
              {showLess ? "Show less" : "View more patients"}
            </CustomText>
          </Pressable>
        )}
      />
    </SafeAreaView>
  );
};

export default PatientsList;
