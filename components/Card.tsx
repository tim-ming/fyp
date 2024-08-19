import { Href, Link } from "expo-router";
import { Pressable, View, StyleSheet } from "react-native";
import CustomText from "./CustomText";
import { shadows } from "@/constants/styles";
import { Colors } from "@/constants/Colors";

interface CardProps {
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
}

const Card: React.FC<CardProps> = ({
  title,
  subtitle,
  href,
  justifyContent = "flex-end",
}) => (
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
          <CustomText style={styles.title}>{title}</CustomText>
          {subtitle && (
            <CustomText style={styles.subtitle}>{subtitle}</CustomText>
          )}
        </View>
      )}
    </Pressable>
  </Link>
);

const styles = StyleSheet.create({
  card: {
    backgroundColor: "white",
    borderRadius: 20, // rounded-2xl
    padding: 16, // p-4
    height: 160, // h-40
    ...shadows.card,
  },
  title: {
    fontSize: 24, // text-[24px]
    fontWeight: "600", // font-semibold
    marginLeft: 4, // ml-1
  },
  subtitle: {
    fontSize: 14, // text-[14px]
    color: Colors.gray100,
    marginLeft: 4, // ml-1
    marginTop: 4,
  },
});

export default Card;
