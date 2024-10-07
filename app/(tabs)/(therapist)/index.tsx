import React, { useState, useEffect, useRef } from "react";
import {
  View,
  FlatList,
  StyleSheet,
  Image,
  Pressable,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import CustomText from "@/components/CustomText";
import { useAuth } from "@/state/auth";
import { useHydratedEffect } from "@/hooks/hooks";
import { getPatients, getMessages } from "@/api/api";
import { UserWithoutSensitiveData } from "@/types/models";
import { useRouter } from "expo-router";
import { format } from "date-fns";
import Ionicons from "@expo/vector-icons/Ionicons";
import { shadows } from "@/constants/styles";

interface PatientWithLastMessage extends UserWithoutSensitiveData {
  lastMessage?: {
    content: string;
    timestamp: string;
  };
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

const PatientListScreen = () => {
  const [patients, setPatients] = useState<PatientWithLastMessage[]>([]);
  const [visiblePatients, setVisiblePatients] = useState<
    PatientWithLastMessage[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [showLess, setShowLess] = useState(false);
  const auth = useAuth();
  const router = useRouter();

  const [sortConfig, setSortConfig] = useState<{
    key: keyof PatientWithLastMessage | "lastMessageTimestamp";
    direction: "ascending" | "descending";
  }>({
    key: "risk",
    direction: "ascending",
  });

  const sortedDataCache = useRef<{
    [key: string]: PatientWithLastMessage[];
  }>({});

  useHydratedEffect(async () => {
    try {
      const fetchedPatients = await getPatients();
      const patientsWithMessages = await Promise.all(
        fetchedPatients.map(async (patient) => {
          const messages = await getMessages(patient.id);
          const lastMessage = messages[0];
          return {
            ...patient,
            lastMessage: lastMessage
              ? {
                  content: lastMessage.content,
                  timestamp: lastMessage.timestamp,
                }
              : undefined,
            risk: patient.patient_data?.severity || "Unknown",
          };
        })
      );
      setPatients(patientsWithMessages);
      setVisiblePatients(patientsWithMessages.slice(0, PAGE_SIZE));
    } catch (error) {
      console.error("Error fetching patients:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  const getSortedData = (
    key: keyof PatientWithLastMessage | "lastMessageTimestamp",
    direction: "ascending" | "descending"
  ) => {
    const cacheKey = `${key}-${direction}`;
    if (sortedDataCache.current[cacheKey]) {
      return sortedDataCache.current[cacheKey];
    }

    const sortedData = [...patients].sort((a, b) => {
      if (key === "risk") {
        const aIndex = severityOrder.indexOf(a.risk);
        const bIndex = severityOrder.indexOf(b.risk);
        return direction === "ascending" ? aIndex - bIndex : bIndex - aIndex;
      } else if (key === "lastMessageTimestamp") {
        const aTimestamp = a.lastMessage?.timestamp ?? "";
        const bTimestamp = b.lastMessage?.timestamp ?? "";
        if (aTimestamp < bTimestamp) {
          return direction === "ascending" ? -1 : 1;
        }
        if (aTimestamp > bTimestamp) {
          return direction === "ascending" ? 1 : -1;
        }
        return 0;
      } else {
        if (a[key] == null || b[key] == null) {
          return 0;
        }
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

  const handleSort = (
    key: keyof PatientWithLastMessage | "lastMessageTimestamp",
    direction: "ascending" | "descending"
  ) => {
    setSortConfig({ key, direction });
    const sortedData = getSortedData(key, direction);
    setVisiblePatients(sortedData.slice(0, visiblePatients.length));
  };

  const togglePatientsVisibility = () => {
    const currentLength = visiblePatients.length;
    const sortedData = getSortedData(sortConfig.key, sortConfig.direction);

    if (showLess) {
      setVisiblePatients(sortedData.slice(0, PAGE_SIZE));
      setShowLess(false);
    } else {
      const nextPatients = sortedData.slice(
        currentLength,
        currentLength + PAGE_SIZE
      );
      setVisiblePatients([...visiblePatients, ...nextPatients]);

      if (currentLength + PAGE_SIZE >= patients.length) {
        setShowLess(true);
      }
    }
  };

  const renderPatientItem = ({ item }: { item: PatientWithLastMessage }) => (
    <Pressable
      style={styles.patientItem}
      onPress={() => router.push(`/therapist/chat/${item.id}`)}
    >
      <Image source={{ uri: item.image }} style={styles.avatar} />
      <View style={styles.riskTag}>
        <CustomText style={styles.riskText}>{item.risk}</CustomText>
      </View>
      <View style={styles.patientInfo}>
        <CustomText style={styles.patientName}>
          {item.sex?.toLowerCase() === "m" ? "Mr. " : "Ms. "}
          {item.name}
        </CustomText>
        {item.lastMessage ? (
          <>
            <CustomText style={styles.lastMessage} numberOfLines={1}>
              {item.lastMessage.content}
            </CustomText>
            <CustomText style={styles.timestamp}>
              {format(new Date(item.lastMessage.timestamp), "MMM d, h:mm a")}
            </CustomText>
          </>
        ) : (
          <CustomText style={styles.noMessage}>No messages yet</CustomText>
        )}
      </View>
    </Pressable>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <CustomText style={styles.loadingText}>Loading patients...</CustomText>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container} className="flex-1 p-4 bg-blue100">
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
              {patients.length}
            </CustomText>
            <CustomText className="text-[14px] text-black">Patients</CustomText>
          </View>
          <View
            className="flex-[3] bg-white rounded-xl p-6 mx-2"
            style={shadows.card}
          >
            <CustomText className="text-[26px] font-semibold text-red-600 mb-1">
              {patients.filter((p) => p.risk === "Severe").length}
            </CustomText>
            <CustomText className="text-[14px] text-black">
              Patients requiring immediate attention
            </CustomText>
          </View>
        </View>
      </View>
      <CustomText style={styles.title}>Patients</CustomText>
      <View style={styles.sortContainer}>
        <Pressable
          onPress={() => handleSort("name", "ascending")}
          style={styles.sortButton}
        >
          <CustomText style={styles.sortButtonText}>Name</CustomText>
          <Ionicons name="arrow-down" size={16} color="#256CD0" />
        </Pressable>
        <Pressable
          onPress={() => handleSort("risk", "ascending")}
          style={styles.sortButton}
        >
          <CustomText style={styles.sortButtonText}>Risk</CustomText>
          <Ionicons name="arrow-down" size={16} color="#256CD0" />
        </Pressable>
        <Pressable
          onPress={() => handleSort("lastMessageTimestamp", "descending")}
          style={styles.sortButton}
        >
          <CustomText style={styles.sortButtonText}>Latest Message</CustomText>
          <Ionicons name="arrow-down" size={16} color="#256CD0" />
        </Pressable>
      </View>
      <FlatList
        data={visiblePatients}
        renderItem={renderPatientItem}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContent}
        ListFooterComponent={() => (
          <Pressable
            style={styles.showMoreButton}
            onPress={togglePatientsVisibility}
          >
            <CustomText style={styles.showMoreButtonText}>
              {showLess ? "Show less" : "View more patients"}
            </CustomText>
          </Pressable>
        )}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F0F8FF",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F0F8FF",
  },
  loadingText: {
    fontSize: 18,
    color: "#333",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginVertical: 16,
    color: "#333",
  },
  sortContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 16,
  },
  sortButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#E6F0FF",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
  },
  sortButtonText: {
    color: "#256CD0",
    marginRight: 4,
  },
  listContent: {
    paddingTop: 16,
  },
  patientItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 12,
  },
  riskTag: {
    position: "absolute",
    top: 8,
    left: 8,
    backgroundColor: "#E6F0FF",
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  riskText: {
    fontSize: 10,
    color: "#256CD0",
  },
  patientInfo: {
    flex: 1,
  },
  patientName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 4,
  },
  lastMessage: {
    fontSize: 14,
    color: "#666",
    marginBottom: 2,
  },
  timestamp: {
    fontSize: 12,
    color: "#999",
  },
  noMessage: {
    fontSize: 14,
    color: "#999",
    fontStyle: "italic",
  },
  showMoreButton: {
    alignItems: "center",
    padding: 16,
    backgroundColor: "#E6F0FF",
    borderRadius: 12,
    marginTop: 8,
  },
  showMoreButtonText: {
    color: "#256CD0",
    fontWeight: "bold",
  },
});

export default PatientListScreen;
