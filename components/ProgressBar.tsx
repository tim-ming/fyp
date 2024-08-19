import React from "react";
import { View, ViewStyle } from "react-native";

interface ProgressBarProps {
  progress: number; // Value between 0 and 1
  barStyle?: ViewStyle; // Optional style for the progress bar
  className?: string;
  orientation?: "horizontal" | "vertical"; // New prop for orientation
}

const ProgressBar: React.FC<ProgressBarProps> = ({
  progress,
  barStyle,
  orientation = "horizontal", // Default to horizontal
  ...props
}) => {
  const isHorizontal = orientation === "horizontal";
  return (
    <View {...props}>
      <View
        style={{
          ...barStyle,
          width: isHorizontal ? `${progress * 100}%` : "100%",
          height: isHorizontal ? "100%" : `${progress * 100}%`,
        }}
      />
    </View>
  );
};

export default ProgressBar;
