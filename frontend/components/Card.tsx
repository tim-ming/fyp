import { Href, Link } from "expo-router";
import { Pressable, View, StyleSheet } from "react-native";
import CustomText from "./CustomText";
import { shadows } from "@/frontend/constants/styles";
import { Colors } from "@/frontend/constants/Colors";
import { Image } from "expo-image";

export interface CardProps {
  title: string;
  subtitle?: string;
  href: Href<string | object>;
  justifyContent?:
    | "flex-start"
    | "center"
    | "flex-end"
    | "space-between"
    | "space-around"
    | "space-evenly";
  icon?: "book" | "dove" | "bookopen" | "bookandpen";
}

const Card: React.FC<CardProps> = ({
  title,
  subtitle,
  href,
  justifyContent = "flex-end",
  icon,
}) => {
  let imageSource;
  switch (icon) {
    case "book":
      imageSource = require("@/assets/images/book.png");
      break;
    case "dove":
      imageSource = require("@/assets/images/dove.png");
      break;
    case "bookopen":
      imageSource = require("@/assets/images/bookopen.png");
      break;
    case "bookandpen":
      imageSource = require("@/assets/images/bookandpen.png");
      break;
    default:
      imageSource = null;
  }

  return (
    <Link href={href} asChild>
      <Pressable>
        {({ pressed }) => (
          <View
            style={[
              styles.card,
              { transform: [{ scale: pressed ? 0.95 : 1 }] },
              { justifyContent },
            ]}
          >
            <View
              style={{
                marginBottom: 8,
                height: "100%",
                flex: 1,
                justifyContent: "flex-end",
              }}
            >
              <CustomText letterSpacing="tight" style={styles.title}>
                {title}
              </CustomText>
              {subtitle && (
                <CustomText style={styles.subtitle}>{subtitle}</CustomText>
              )}
            </View>
            <View style={{ justifyContent: "center" }}>
              {imageSource && (
                <Image source={imageSource} style={styles.image} />
              )}
            </View>
          </View>
        )}
      </Pressable>
    </Link>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: "white",
    borderRadius: 20, // rounded-2xl
    padding: 20, // p-5
    height: 148,
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-between",

    ...shadows.card,
  },
  title: {
    fontSize: 24, // text-[24px]
    fontWeight: "500", // font-semibold
  },
  subtitle: {
    fontSize: 14, // text-[14px]
    color: Colors.gray200,
    marginTop: 4,
  },
  image: {
    width: 100, // Adjust the size as needed
    height: 100, // Adjust the size as needed
    marginBottom: 8, // Add some margin below the image
    opacity: 0.8, // Adjust the opacity as needed
  },
});

export default Card;
