import React, { useState, useEffect, useRef } from "react";
import { View, FlatList, Pressable, ActivityIndicator } from "react-native";
import { useRouter } from "expo-router";
import CustomText from "@/components/CustomText";
import { SafeAreaView } from "react-native-safe-area-context";
import { shadows } from "@/constants/styles";
import { useAuth, useHydration } from "@/state/state";
import Ionicons from "@expo/vector-icons/Ionicons";
import { getPatients } from "@/api/api";

interface Patient {
  id: number;
  name: string;
  risk: string;
}

const PAGE_SIZE = 6;

const severityOrder = [
  "Severe",
  "Moderately Severe",
  "Moderate",
  "Mild",
  "None",
  "Unknown",
];

const PatientsList: React.FC = () => {
  const router = useRouter();
  const auth = useAuth();

  const [allPatientsData, setAllPatientsData] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [showLess, setShowLess] = useState(false);
  const [sortConfig, setSortConfig] = useState<{
    key: keyof Patient;
    direction: "ascending" | "descending" | null;
  }>({
    key: "risk",
    direction: "ascending",
  });

  const sortedDataCache = useRef<{
    [key: string]: Patient[];
  }>({});

  const isHydrated = useHydration();

  useEffect(() => {
    if (!isHydrated) {
      return;
    }
    const fetchPatients = async () => {
      try {
        const patients = await getPatients();
        const filteredPatients = patients.map((patient) => ({
          id: patient.id,
          name: patient.name,
          risk: patient.patient_data?.severity || "Unknown",
        }));
        setAllPatientsData(filteredPatients);
      } catch (err) {
        setError("Failed to fetch patients");
      } finally {
        setLoading(false);
      }
    };

    fetchPatients();
  }, [isHydrated]);

  const getSortedData = (
    key: keyof Patient,
    direction: "ascending" | "descending"
  ) => {
    const cacheKey = `${key}-${direction}`;
    if (sortedDataCache.current[cacheKey]) {
      return sortedDataCache.current[cacheKey];
    }

    const sortedData = [...allPatientsData].sort((a, b) => {
      if (key === "risk") {
        const aIndex = severityOrder.indexOf(a.risk);
        const bIndex = severityOrder.indexOf(b.risk);
        return direction === "ascending" ? aIndex - bIndex : bIndex - aIndex;
      } else {
        if (a[key] < b[key]) {
          return direction === "ascending" ? -1 : 1;
        }
        if (a[key] > b[key]) {
          return direction === "ascending" ? 1 : -1;
        }
        return 0;
      }
    });

    sortedDataCache.current[cacheKey] = sortedData;
    return sortedData;
  };

  const [visiblePatients, setVisiblePatients] = useState<Patient[]>([]);

  useEffect(() => {
    if (allPatientsData.length > 0) {
      setVisiblePatients(
        getSortedData("risk", "ascending").slice(0, PAGE_SIZE)
      );
    }
  }, [allPatientsData]);

  const handleSort = (
    key: keyof Patient,
    direction: "ascending" | "descending"
  ) => {
    if (sortConfig.key === key && sortConfig.direction === direction) {
      return;
    }

    setSortConfig({ key, direction });

    const sortedData = getSortedData(key, direction);
    setVisiblePatients(sortedData.slice(0, visiblePatients.length));
  };

  const togglePatientsVisibility = () => {
    const currentLength = visiblePatients.length;
    const sortedData = getSortedData(
      sortConfig.key,
      sortConfig.direction || "ascending"
    );

    if (showLess) {
      setVisiblePatients(sortedData.slice(0, PAGE_SIZE));
      setShowLess(false);
    } else {
      const nextPatients = sortedData.slice(
        currentLength,
        currentLength + PAGE_SIZE
      );
      setVisiblePatients([...visiblePatients, ...nextPatients]);

      if (currentLength + PAGE_SIZE >= allPatientsData.length) {
        setShowLess(true);
      }
    }
  };

  const renderItem = ({ item, index }: { item: Patient; index: number }) => (
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

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-blue100">
        <ActivityIndicator size="large" color="#256CD0" />
      </View>
    );
  }

  return (
    <SafeAreaView className="flex-1 p-4 bg-blue100">
      <View className="mb-6 mt-16">
        <CustomText className="text-2xl font-medium text-gray300">
          Hi,
          <CustomText className="text-2xl font-medium text-black">
            {" "}
            {`Dr. ${auth.user?.name}`}.
          </CustomText>
        </CustomText>
        <View className="flex-row justify-between mt-4">
          <View
            className="flex-1 bg-white rounded-xl p-6 mx-2"
            style={shadows.card}
          >
            <CustomText className="text-[26px] font-semibold text-gray-800 mb-1">
              {allPatientsData.length}
            </CustomText>
            <CustomText className="text-[14px] text-black">Patients</CustomText>
          </View>
          <View
            className="flex-[3] bg-white rounded-xl p-6 mx-2"
            style={shadows.card}
          >
            <CustomText className="text-[26px] font-semibold text-red-600 mb-1">
              {allPatientsData.filter((p) => p.risk === "Severe").length}
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
        <Pressable
          onPress={() => handleSort("name", "ascending")}
          className="flex-1 flex-row items-center"
        >
          <CustomText className="text-black font-medium">Name</CustomText>
          <View className="ml-2">
            <Ionicons
              name="caret-up"
              size={16}
              color={
                sortConfig.key === "name" &&
                sortConfig.direction === "ascending"
                  ? "#535353"
                  : "#8B8B8B"
              }
              onPress={() => handleSort("name", "ascending")}
              style={{ marginBottom: -6 }}
            />
            <Ionicons
              name="caret-down"
              size={16}
              color={
                sortConfig.key === "name" &&
                sortConfig.direction === "descending"
                  ? "#535353"
                  : "#8B8B8B"
              }
              onPress={() => handleSort("name", "descending")}
            />
          </View>
        </Pressable>
        <Pressable
          onPress={() => handleSort("risk", "ascending")}
          className="flex-1 flex-row items-center"
        >
          <CustomText className="text-black font-medium">
            Depression Risk
          </CustomText>
          <View className="ml-2">
            <Ionicons
              name="caret-up"
              size={16}
              color={
                sortConfig.key === "risk" &&
                sortConfig.direction === "ascending"
                  ? "#535353"
                  : "#8B8B8B"
              }
              onPress={() => handleSort("risk", "ascending")}
              style={{ marginBottom: -6 }}
            />
            <Ionicons
              name="caret-down"
              size={16}
              color={
                sortConfig.key === "risk" &&
                sortConfig.direction === "descending"
                  ? "#535353"
                  : "#8B8B8B"
              }
              onPress={() => handleSort("risk", "descending")}
            />
          </View>
        </Pressable>
      </View>

      <FlatList
        data={visiblePatients}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderItem}
        className="mx-[-16px] mb-[-16px]"
        ListFooterComponent={() => (
          <Pressable
            className={`p-4 ${
              visiblePatients.length % 2 == 0 ? "bg-gray0" : "bg-white"
            } items-center rounded-b-xl`}
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
