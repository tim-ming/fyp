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
    <View {...props}>
      <View
        style={{
          flexDirection: isHorizontal ? "column" : "row",
          justifyContent: "flex-end",
          alignItems: "flex-end",
          width: isHorizontal ? "100%" : undefined,
          height: isHorizontal ? undefined : "100%",
        }}
      >
        {bars.map((bar, index) => (
          <View
            key={index}
            style={{
              ...bar.barStyle,
              flex: 1,
              ...(isHorizontal
                ? {
                    width: `${bar.progress}%`,
                  }
                : {
                    height: `${bar.progress}%`,
                  }),
            }}
          />
        ))}
      </View>
    </View>
  );
};

export default GroupedProgressBar;
