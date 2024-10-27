// Therapist Home Screen
import React, { useState, useEffect, useRef, useCallback } from "react";
import { View, FlatList, StyleSheet, Image, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import CustomText from "@/components/CustomText";
import { useAuth } from "@/state/auth";
import { useHydratedEffect } from "@/hooks/hooks";
import { getPatients, getMessages } from "@/api/api";
import { Message, UserWithoutSensitiveData } from "@/types/models";
import { useRouter } from "expo-router";
import { format } from "date-fns";
import Ionicons from "@expo/vector-icons/Ionicons";
import { shadows } from "@/constants/styles";
import { BACKEND_URL } from "@/constants/globals";
import useWebSocketStore from "@/state/socket";
import { toZonedTime } from "date-fns-tz";

interface PatientWithLastMessage extends UserWithoutSensitiveData {
  lastMessage?: {
    content: string;
    timestamp: string;
    sender_id: number;
  };
  risk: string;
}

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
  const [loading, setLoading] = useState(true);
  const auth = useAuth();
  const router = useRouter();
  const webSocketStore = useWebSocketStore();

  const [sortConfig, setSortConfig] = useState<{
    key: keyof PatientWithLastMessage | "lastMessageTimestamp";
    direction: "ascending" | "descending";
  }>({
    key: "risk",
    direction: "descending",
  });

  /**
   * Updates the last message of a patient in the list
   */
  const updatePatientMessage = useCallback((message: Message) => {
    setPatients((currentPatients) => {
      return currentPatients.map((patient) => {
        if (
          patient.id === message.sender_id ||
          patient.id === message.recipient_id
        ) {
          return {
            ...patient,
            lastMessage: {
              content: message.content,
              timestamp: message.timestamp,
              sender_id: message.sender_id,
            },
          };
        }
        return patient;
      });
    });
  }, []);

  // Connect to the WebSocket server
  useEffect(() => {
    if (auth.token && !webSocketStore.isConnected) {
      webSocketStore.connect(auth.token.access_token);
    }

    const messageHandler = (message: Message) => {
      console.log("Message received:", message);
      updatePatientMessage(message);
    };

    webSocketStore.addMessageListener(-1, messageHandler);

    return () => {
      webSocketStore.removeMessageListener(-1);
    };
  }, [auth.token]);

  // Fetch patients and their last messages
  useHydratedEffect(async () => {
    try {
      const fetchedPatients = await getPatients();
      const patientsWithMessages = await Promise.all(
        fetchedPatients.map(async (patient) => {
          const messages = await getMessages(patient.id);
          const lastMessage = messages[messages.length - 1];
          return {
            ...patient,
            lastMessage: lastMessage
              ? {
                  content: lastMessage.content,
                  timestamp: lastMessage.timestamp,
                  sender_id: lastMessage.sender_id,
                }
              : undefined,
            risk: patient.patient_data?.severity || "Unknown",
          };
        })
      );
      const sortedPatients = patientsWithMessages.sort((a, b) => {
        const aIndex = severityOrder.indexOf(b.risk);
        const bIndex = severityOrder.indexOf(a.risk);
        return bIndex - aIndex;
      });
      setPatients(sortedPatients);
    } catch (error) {
      console.error("Error fetching patients:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   *  Sorts the list of patients by the given key and direction
   * @param p  The list of patients
   * @param key  The key to sort by
   * @param direction  The direction to sort in
   * @returns  The sorted list of patients
   */
  const getSortedData = (
    p: PatientWithLastMessage[],
    key: keyof PatientWithLastMessage | "lastMessageTimestamp",
    direction: "ascending" | "descending"
  ) => {
    const sortedData = [...p].sort((a, b) => {
      if (key === "risk") {
        const bIndex = severityOrder.indexOf(a.risk);
        const aIndex = severityOrder.indexOf(b.risk);
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
        if (a[key].toString().toLowerCase() < b[key].toString().toLowerCase()) {
          return direction === "ascending" ? -1 : 1;
        }
        if (a[key].toString().toLowerCase() > b[key].toString().toLowerCase()) {
          return direction === "ascending" ? 1 : -1;
        }
        return 0;
      }
    });

    return sortedData;
  };

  /**
   *  Handles sorting the list of patients by the given key
   * @param key The key to sort by
   */
  const handleSort = (
    key: keyof PatientWithLastMessage | "lastMessageTimestamp"
  ) => {
    setSortConfig((prevConfig) => ({
      key,
      direction:
        prevConfig.key === key && prevConfig.direction === "ascending"
          ? "descending"
          : "ascending",
    }));

    const direction =
      sortConfig.key === key && sortConfig.direction === "ascending"
        ? "descending"
        : "ascending";
    setPatients(getSortedData(patients, key, direction));
  };

  /**
   * Gets the style for the risk tag based on the risk level
   * @param risk  The risk level of the patient
   * @returns  The style for the risk tag
   */
  const getRiskTagStyle = (risk: string) => {
    switch (risk) {
      case "Severe":
        return { backgroundColor: "#FFCCCB", color: "#8B0000" };
      case "Moderately Severe":
        return { backgroundColor: "#FFE5B4", color: "#8B4513" };
      case "Moderate":
        return { backgroundColor: "#FFFACD", color: "#8B8000" };
      case "Mild":
        return { backgroundColor: "#E0FFFF", color: "#008B8B" };
      case "None":
        return { backgroundColor: "#E0FFF0", color: "#006400" };
      case "Unknown":
      default:
        return { backgroundColor: "#E0E0E0", color: "#696969" };
    }
  };

  /**
   *  Renders the sort icon based on the key
   * @param key  The key to render the icon for
   * @returns  The sort icon component
   */
  const renderSortIcon = (
    key: keyof PatientWithLastMessage | "lastMessageTimestamp"
  ) => {
    if (sortConfig.key !== key) {
      return (
        <Ionicons name="swap-vertical-outline" size={16} color="#256CD0" />
      );
    }
    return sortConfig.direction === "ascending" ? (
      <Ionicons name="arrow-up" size={16} color="#256CD0" />
    ) : (
      <Ionicons name="arrow-down" size={16} color="#256CD0" />
    );
  };

  // Renders a patient item
  const renderPatientItem = ({ item }: { item: PatientWithLastMessage }) => {
    const riskTagStyle = getRiskTagStyle(item.risk);

    return (
      <Pressable
        style={styles.patientItem}
        onPress={() => router.push(`/(therapist)/chat/${item.id}`)}
      >
        <Image
          source={{ uri: BACKEND_URL + item.image }}
          style={styles.avatar}
        />
        <View
          style={[
            styles.riskTag,
            { backgroundColor: riskTagStyle.backgroundColor },
          ]}
        >
          <CustomText style={[styles.riskText, { color: riskTagStyle.color }]}>
            {item.risk}
          </CustomText>
        </View>
        <View style={styles.patientInfo}>
          <CustomText style={styles.patientName}>
            {item.sex?.toLowerCase() === "m" ? "Mr. " : "Ms. "}
            {item.name}
          </CustomText>
          {item.lastMessage ? (
            <>
              <CustomText style={styles.lastMessage} numberOfLines={1}>
                {item.lastMessage.sender_id === auth.user?.id ? "You:" : ""}{" "}
                {item.lastMessage.content}
              </CustomText>
              <CustomText style={styles.timestamp}>
                {format(
                  toZonedTime(new Date(item.lastMessage.timestamp), "UTC"),
                  "MMM d, h:mm a"
                )}
              </CustomText>
            </>
          ) : (
            <CustomText style={styles.noMessage}>No messages yet</CustomText>
          )}
        </View>
      </Pressable>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <CustomText style={styles.loadingText}>Loading patients...</CustomText>
      </View>
    );
  }

  return (
    <View style={styles.container} className="flex-1 p-4 bg-blue100">
      <View className="my-14">
        <CustomText className="text-2xl font-medium text-gray300 my-6">
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
        <Pressable onPress={() => handleSort("name")} style={styles.sortButton}>
          <CustomText style={styles.sortButtonText}>Name</CustomText>
          {renderSortIcon("name")}
        </Pressable>
        <Pressable onPress={() => handleSort("risk")} style={styles.sortButton}>
          <CustomText style={styles.sortButtonText}>Risk</CustomText>
          {renderSortIcon("risk")}
        </Pressable>
        <Pressable
          onPress={() => handleSort("lastMessageTimestamp")}
          style={styles.sortButton}
        >
          <CustomText style={styles.sortButtonText}>Latest Message</CustomText>
          {renderSortIcon("lastMessageTimestamp")}
        </Pressable>
      </View>
      <FlatList
        data={patients}
        renderItem={renderPatientItem}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContent}
      />
    </View>
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
