import { StyleSheet } from "react-native";
export const shadows = StyleSheet.create({
  card: {
    shadowColor: "rgba(0, 0, 0, 0.1)",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 20,
    elevation: 5, // For Android shadow
  },
  cardDarker: {
    shadowColor: "rgba(0, 0, 0, 0.2)",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 20,
    elevation: 5, // For Android shadow
  },
});
export const screenStyles = StyleSheet.create({
  padding: {
    paddingLeft: 16,
    paddingRight: 16,
    paddingTop: 12,
    paddingBottom: 12,
  },
  contentPadding: {
    paddingTop: 12,
    paddingBottom: 12,
  },
});
