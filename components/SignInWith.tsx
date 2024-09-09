import * as AppleAuthentication from "expo-apple-authentication";
import React from "react";
import { Platform, Pressable, StyleSheet } from "react-native";
import CustomText from "@/components/CustomText";
import Apple from "@/assets/icons/apple.svg";
import Google from "@/assets/icons/google.svg";

const google = async () => {
  console.log("Google Sign In");
};

const apple = async () => {
  if (Platform.OS == "ios") {
    try {
      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
      });
      // signed in
    } catch (e) {
      if (e.code === "ERR_REQUEST_CANCELED") {
        // handle that the user canceled the sign-in flow
      } else {
        // handle other errors
      }
    }
  }
};

export const SignInWithGoogle = () => (
  <Pressable onPress={google} style={styles.googleButton}>
    <Google width={24} height={24} style={styles.icon} />
    <CustomText style={styles.googleText}>Sign in with Google</CustomText>
  </Pressable>
);

export const SignInWithApple = () => (
  <Pressable onPress={apple} style={styles.appleButton}>
    <Apple width={24} height={24} style={styles.icon} />
    <CustomText style={styles.appleText}>Sign in with Apple</CustomText>
  </Pressable>
);

const styles = StyleSheet.create({
  googleButton: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    height: 56,
    backgroundColor: "white",
    borderColor: "gray",
    borderWidth: 1,
    paddingHorizontal: 16,
    borderRadius: 9999,
    marginBottom: 8,
  },
  appleButton: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    height: 56,
    backgroundColor: "black",
    paddingHorizontal: 16,
    borderRadius: 9999,
  },
  icon: {
    marginRight: 8,
  },
  googleText: {
    color: "black",
    fontSize: 16,
    fontWeight: "500",
  },
  appleText: {
    color: "white",
    fontSize: 16,
    fontWeight: "500",
  },
});
