import * as AppleAuthentication from "expo-apple-authentication";
import React, { useEffect } from "react";
import { Platform, Pressable, StyleSheet } from "react-native";
import CustomText from "@/components/CustomText";
import Apple from "@/assets/icons/apple.svg";
import Google from "@/assets/icons/google.svg";
import * as WebBrowser from "expo-web-browser";
import * as GoogleSignIn from "expo-auth-session/providers/google";
import { useAuth } from "@/state/auth";
import { getPatientData, getUser, postSigninGoogle } from "@/api/api";
import { router } from "expo-router";

const webClientId =
  "893591947282-mpd7sb0pi9av53a3sv4j8j72u5m9hp3o.apps.googleusercontent.com";
const androidClientId =
  "893591947282-7ljujgqafd1pqvc9dikc81j3rvgo3qts.apps.googleusercontent.com";
const iosClientId =
  "893591947282-fnj463sa6ptndn09t8081bna6qkv7a64.apps.googleusercontent.com";

WebBrowser.maybeCompleteAuthSession();

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

export const SignInWithGoogle = () => {
  const auth = useAuth();
  const config = {
    webClientId,
    androidClientId,
    iosClientId,
  };

  const [request, response, promptAsync] = GoogleSignIn.useAuthRequest(config);

  const getUserProfile = async (token: any) => {
    if (!token) return;
    try {
      const response = await postSigninGoogle(token);
      const userToken = await response.json();

      auth.setToken(userToken);
      const user = await getUser();
      auth.setUser(user);

      const isTherapist = user.role === "therapist";

      if (isTherapist) {
        router.push("/");
      } else {
        if (!user.dob || !user.sex || !user.occupation) {
          router.push("/user-details");
        } else {
          const patient = await getPatientData(user.id);
          router.push("/");
          // if (patient.patient_data?.has_onboarded) {
          //   router.push("/");
          // } else {
          //   router.push("/understand");
          // }
        }
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleToken = () => {
    if (response?.type === "success") {
      const { authentication } = response;
      const token = authentication?.accessToken;

      if (!token) {
        throw new Error("Token is undefined");
      }

      getUserProfile(token);
    }
  };

  useEffect(() => {
    handleToken();
  }, [response]);

  return (
    <Pressable
      onPress={() => {
        if (request) {
          promptAsync();
        } else {
          console.log("Google auth request is not ready yet.");
        }
      }}
      style={styles.googleButton}
    >
      <Google width={24} height={24} style={styles.icon} />
      <CustomText style={styles.googleText}>Sign in with Google</CustomText>
    </Pressable>
  );
};

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
