import React from "react";
import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";

const ExploreScreen: React.FC = () => {
  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Ionicons name="search-outline" size={24} style={styles.icon} />
        <Text style={styles.title}>Explore</Text>
        <Ionicons name="refresh-outline" size={24} style={styles.icon} />
      </View>

      {/* Search Bar */}
      <TextInput style={styles.searchBar} placeholder="Search stuff" />

      {/* Scrollable Content */}
      <ScrollView style={styles.scrollView}>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Journal</Text>
          <Text style={styles.cardSubtitle}>Write about your day.</Text>
        </View>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Guided Writing</Text>
          <Text style={styles.cardSubtitle}>
            Discover your hidden thoughts.
          </Text>
        </View>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Relax</Text>
          <Text style={styles.cardSubtitle}>Unwind out your day.</Text>
        </View>
      </ScrollView>

      {/* Footer Navigation */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.footerButton}>
          <Ionicons name="home-outline" size={24} color="#808080" />
          <Text style={styles.footerText}>Home</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.footerButton}>
          <Ionicons name="compass-outline" size={24} color="#0000FF" />
          <Text style={[styles.footerText, styles.activeFooterText]}>
            Explore
          </Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.addButton}>
          <Ionicons name="add" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.footerButton}>
          <Ionicons name="book-outline" size={24} color="#808080" />
          <Text style={styles.footerText}>Read</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.footerButton}>
          <Ionicons name="journal-outline" size={24} color="#808080" />
          <Text style={styles.footerText}>Journey</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F0F0F0",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#FFFFFF",
  },
  icon: {
    color: "#000000",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
  },
  searchBar: {
    backgroundColor: "#E0E0E0",
    borderRadius: 16,
    paddingHorizontal: 16,
    margin: 16,
    height: 40,
  },
  scrollView: {
    paddingHorizontal: 16,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "bold",
  },
  cardSubtitle: {
    color: "#808080",
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    paddingVertical: 16,
  },
  footerButton: {
    alignItems: "center",
  },
  footerText: {
    color: "#808080",
    fontSize: 12,
  },
  activeFooterText: {
    color: "#0000FF",
  },
  addButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#0000FF",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
});

export default ExploreScreen;
