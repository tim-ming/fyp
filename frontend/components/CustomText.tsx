import React, { ReactNode } from "react";
import { Text, StyleSheet, TextProps, TextStyle } from "react-native";

interface CustomTextProps extends TextProps {
  children: ReactNode;
  style?: TextStyle | TextStyle[];
  letterSpacing?: "tighter" | "tight" | "normal" | "wide";
}

const CustomText: React.FC<CustomTextProps> = ({
  children,
  style,
  letterSpacing = "normal",
  ...props
}) => {
  const letterSpacingStyle = styles[letterSpacing];

  return (
    <Text style={[styles.text, letterSpacingStyle, style]} {...props}>
      {children}
    </Text>
  );
};

const styles = StyleSheet.create({
  text: {
    fontFamily: "PlusJakartaSans",
  },
  tighter: {
    letterSpacing: -0.75,
  },
  tight: {
    letterSpacing: -0.5,
  },
  normal: {
    letterSpacing: -0.25,
  },
  wide: {
    letterSpacing: 0.5,
  },
});

export default CustomText;
