import User from "@/assets/icons/user.svg";
import DoubleHeart from "@/assets/icons/doubleheart.svg";
import React from "react";
import { View, TouchableOpacity, Pressable } from "react-native";
import { screenStyles } from "@/constants/styles";
import { Link } from "expo-router";

const ICON_SIZE = 28;

const TopNav: React.FC = () => {
  return (
    <View
      style={{
        flexDirection: "row",
        justifyContent: "space-between",
        ...screenStyles.padding,
      }}
    >
      <Pressable>
        <Link href="/gamification">
          <DoubleHeart fill="#535353" width={ICON_SIZE} height={ICON_SIZE} />
        </Link>
      </Pressable>
      <Pressable>
        <Link href="/settings">
          <User fill="#535353" width={ICON_SIZE} height={ICON_SIZE} />
        </Link>
      </Pressable>
    </View>
  );
};

export default TopNav;
