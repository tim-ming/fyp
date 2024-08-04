import React from "react";
import { View, Text, Image, StyleSheet, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const HomeScreen = () => {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text className="font-bold">Good Morning, Ning.</Text>
        {/* <TouchableOpacity>
          <Image
            source={require("./assets/profile-icon.png")}
            style={styles.profileIcon}
          />
        </TouchableOpacity> */}
      </View>

      <View style={styles.dateContainer}>
        {/* <Image
          source={require("./assets/coffee.jpg")}
          style={styles.coffeeImage}
        /> */}
        <View style={styles.dateBox}>
          <Text style={styles.date}>2 May</Text>
          <Text style={styles.today}>TODAY</Text>
        </View>
      </View>

      <Text style={styles.suggestionsTitle}>Suggestions for you</Text>
      <Text style={styles.suggestionsSubtitle}>Based on your day</Text>

      <View style={styles.suggestionBox}>
        <Text style={styles.suggestionTitle}>Relax</Text>
        <Text style={styles.suggestionDescription}>Unwind out your day.</Text>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#E7F1FB",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
  },
  profileIcon: {
    width: 30,
    height: 30,
    borderRadius: 15,
  },
  dateContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 20,
  },
  coffeeImage: {
    width: 100,
    height: 100,
    borderRadius: 10,
  },
  dateBox: {
    backgroundColor: "white",
    padding: 20,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  date: {
    fontSize: 24,
    fontWeight: "bold",
  },
  today: {
    fontSize: 12,
    color: "gray",
  },
  suggestionsTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginLeft: 20,
    marginTop: 20,
  },
  suggestionsSubtitle: {
    fontSize: 14,
    color: "gray",
    marginLeft: 20,
    marginBottom: 10,
  },
  suggestionBox: {
    backgroundColor: "white",
    padding: 20,
    margin: 20,
    borderRadius: 10,
  },
  suggestionTitle: {
    fontSize: 18,
    fontWeight: "bold",
  },
  suggestionDescription: {
    fontSize: 14,
    color: "gray",
  },
  navbar: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    backgroundColor: "white",
    paddingVertical: 10,
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
  },
  navItem: {
    alignItems: "center",
  },
  navIcon: {
    width: 24,
    height: 24,
  },
  navText: {
    fontSize: 12,
  },
  addButton: {
    backgroundColor: "#007AFF",
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
  },
  addButtonText: {
    color: "white",
    fontSize: 24,
  },
});

export default HomeScreen;
