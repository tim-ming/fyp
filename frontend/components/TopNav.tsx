import DoubleHeart from "@/assets/icons/doubleheart.svg";
import User from "@/assets/icons/user.svg";
import { screenStyles } from "@/frontend/constants/styles";
import { Link, usePathname } from "expo-router";
import React from "react";
import { Pressable, View } from "react-native";

const ICON_SIZE = 28;

const TopNav: React.FC = () => {
  const pathname = usePathname();
  const isIndexPage = pathname === "/";

  return (
    <View
      style={{
        flexDirection: "row",
        justifyContent: "space-between",
        ...screenStyles.padding,
      }}
    >
      {isIndexPage ? (
        <Pressable>
          <Link href="/patient/gamification">
            <DoubleHeart fill="#535353" width={ICON_SIZE} height={ICON_SIZE} />
          </Link>
        </Pressable>
      ) : (
        <View />
      )}
      <Pressable>
        <Link href="/patient/profile">
          <User fill="#535353" width={ICON_SIZE} height={ICON_SIZE} />
        </Link>
      </Pressable>
    </View>
  );
};

export default TopNav;
