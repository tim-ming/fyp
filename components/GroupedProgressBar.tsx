import React from "react";
import { View, ViewStyle } from "react-native";
import ProgressBar from "./ProgressBar"; // Assuming ProgressBar is in the same directory

interface GroupedProgressBarProps {
  bars: { progress: number; barStyle?: ViewStyle }[]; // Array of progress values and styles
  className?: string;
  orientation?: "horizontal" | "vertical"; // New prop for orientation
}

const GroupedProgressBar: React.FC<GroupedProgressBarProps> = ({
  bars,
  orientation = "horizontal", // Default to horizontal
  ...props
}) => {
  const isHorizontal = orientation === "horizontal";
  return (
    <View
      {...props}
      style={{
        flexDirection: isHorizontal ? "row" : "column",
        width: isHorizontal ? "100%" : undefined,
        height: isHorizontal ? undefined : "100%",
      }}
    >
      {bars.map((bar, index) => (
        <ProgressBar
          key={index}
          progress={bar.progress}
          barStyle={bar.barStyle}
          orientation={orientation}
          style={{
            flex: 1,
            marginRight: isHorizontal && index < bars.length - 1 ? 2 : 0,
            marginBottom: !isHorizontal && index < bars.length - 1 ? 2 : 0,
          }}
        />
      ))}
    </View>
  );
};

export default GroupedProgressBar;
