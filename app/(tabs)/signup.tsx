import React from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
} from "react-native";

const SignUpScreen = () => {
  return (
    <View className="flex-1" style={styles.container}>
      <Text style={styles.title}>Hello!</Text>
      <Text style={styles.subtitle}>Create an account.</Text>
      <Text style={styles.tagline}>Be a better you today.</Text>

      <TextInput
        style={styles.input}
        placeholder="Enter your email address"
        keyboardType="email-address"
      />

      <TextInput
        style={styles.input}
        placeholder="Enter your password"
        secureTextEntry
      />

      <View style={styles.termsContainer}>
        <TouchableOpacity style={styles.checkbox}>
          <View style={styles.checkboxEmpty}></View>
        </TouchableOpacity>
        <Text style={styles.termsText}>
          By signing up, you agree to our{" "}
          <Text style={styles.link}>Terms of Service</Text> and{" "}
          <Text style={styles.link}>Privacy Policy</Text>.
        </Text>
      </View>

      <TouchableOpacity style={styles.button}>
        <Text style={styles.buttonText}>Sign up</Text>
      </TouchableOpacity>

      <Text style={styles.orText}>OR</Text>

      <TouchableOpacity style={styles.googleButton}>
        <Image
          source={{
            uri: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/53/Google_%22G%22_Logo.svg/512px-Google_%22G%22_Logo.svg.png",
          }}
          style={styles.googleLogo}
        />
        <Text style={styles.googleButtonText}>Sign in with Google</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.appleButton}>
        <Image
          source={{
            uri: "https://upload.wikimedia.org/wikipedia/commons/f/fa/Apple_logo_black.svg",
          }}
          style={styles.appleLogo}
        />
        <Text style={styles.appleButtonText}>Sign in with Apple</Text>
      </TouchableOpacity>

      <Text style={styles.signInText}>
        Already have an account? <Text style={styles.link}>Sign in</Text>
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#F3F4F6",
    fontFamily: "PlusJakartaSans",
  },
  title: {
    fontSize: 36,
    fontWeight: "bold",
    color: "#000",
  },
  subtitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#000",
  },
  tagline: {
    fontSize: 16,
    color: "#666",
    marginVertical: 20,
  },
  input: {
    height: 50,
    backgroundColor: "#fff",
    borderRadius: 8,
    paddingHorizontal: 16,
    marginBottom: 16,
    borderColor: "#ddd",
    borderWidth: 1,
  },
  termsContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#666",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  checkboxEmpty: {
    width: 14,
    height: 14,
    backgroundColor: "#fff",
  },
  termsText: {
    fontSize: 12,
    color: "#666",
  },
  link: {
    color: "#0000EE",
    textDecorationLine: "underline",
  },
  button: {
    height: 50,
    backgroundColor: "#007BFF",
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  orText: {
    textAlign: "center",
    color: "#666",
    marginVertical: 16,
  },
  googleButton: {
    flexDirection: "row",
    alignItems: "center",
    height: 50,
    backgroundColor: "#fff",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ddd",
    marginBottom: 16,
    paddingHorizontal: 16,
  },
  googleLogo: {
    width: 20,
    height: 20,
    marginRight: 10,
  },
  googleButtonText: {
    color: "#000",
    fontSize: 16,
    fontWeight: "bold",
  },
  appleButton: {
    flexDirection: "row",
    alignItems: "center",
    height: 50,
    backgroundColor: "#000",
    borderRadius: 8,
    marginBottom: 16,
    paddingHorizontal: 16,
  },
  appleLogo: {
    width: 20,
    height: 20,
    marginRight: 10,
  },
  appleButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  signInText: {
    textAlign: "center",
    color: "#666",
    marginTop: 20,
  },
});

export default SignUpScreen;
