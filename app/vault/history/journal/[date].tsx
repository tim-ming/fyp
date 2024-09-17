import { getJournalEntry } from "@/api/api";
import CustomText from "@/components/CustomText";
import { JournalEntry } from "@/types/models";
import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";

export default function JournalScreen({ route }) {
  const { date } = route.params;
  const [entry, setEntry] = useState<JournalEntry | null>(null);
  useEffect(() => {
    const fetchEntry = async () => {
      const data = await getJournalEntry(date);
      setEntry(data);
    };
    fetchEntry();
  });

  if (!entry) {
    return null;
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.date}>{`${entry.date}`}</Text>
      <Text style={styles.title}>{entry.title}</Text>

      <CustomText>{entry.body}</CustomText>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#000",
  },
  date: {
    color: "#ccc",
    fontSize: 14,
    marginBottom: 10,
  },
  title: {
    color: "#fff",
    fontSize: 32,
    fontWeight: "bold",
    marginBottom: 20,
  },
  contentContainer: {
    marginBottom: 30,
  },
  question: {
    color: "#fff",
    fontSize: 18,
    marginBottom: 10,
  },
  response: {
    color: "#ccc",
    fontSize: 16,
  },
});
