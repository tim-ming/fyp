import React from "react";
import { View, ViewStyle } from "react-native";

interface ProgressBarProps {
  progress: number; // Value between 0 and 1
  barStyle?: ViewStyle; // Optional style for the progress bar
  className?: string;
}

const ProgressBar: React.FC<ProgressBarProps> = ({
  progress,
  barStyle,
  ...props
}) => {
  return (
    <View {...props}>
      <View
        style={{ ...barStyle, width: `${progress * 100}%`, height: "100%" }}
      />
    </View>
  );
};

export default ProgressBar;
