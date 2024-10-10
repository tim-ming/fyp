import ChevronLeft from "@/assets/icons/chevron-left.svg";
import { router } from "expo-router";
import React from "react";
import { Pressable, PressableProps, View, ViewProps } from "react-native";

type BackButtonProps = ViewProps & {
  defaultRoute?: string; // Default route to link to
  children?: React.ReactNode;
};

const BackButtonWrapper: React.FC<BackButtonProps> = ({
  defaultRoute,
  children,
  ...props
}) => {
  const handlePress = () => {
    if (defaultRoute) {
      router.push(defaultRoute);
    } else if (router.canGoBack()) {
      router.back();
    } else {
      router.push("/");
    }
  };

  return (
    <>
      <View {...props}>
        <Pressable onPress={handlePress}>
          <ChevronLeft width={24} height={24} />
        </Pressable>
      </View>
      {children}
    </>
  );
};

export default BackButtonWrapper;
