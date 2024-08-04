import React, { ReactNode } from "react";
import { Text, StyleSheet, TextProps, TextStyle } from "react-native";

interface CustomTextProps extends TextProps {
  children: ReactNode;
  style?: TextStyle | TextStyle[];
}

const CustomText: React.FC<CustomTextProps> = ({
  children,
  style,
  ...props
}) => {
  return (
    <Text style={[styles.text, style]} {...props}>
      {children}
    </Text>
  );
};

const styles = StyleSheet.create({
  text: {
    fontFamily: "PlusJakartaSans",
  },
});

export default CustomText;
