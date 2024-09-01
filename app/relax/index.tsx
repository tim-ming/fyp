import CustomText from "@/components/CustomText";
import { Href, Link } from "expo-router";
import { Pressable, SafeAreaView, ScrollView, View } from "react-native";
import { Image } from "expo-image";
import { shadows } from "@/constants/styles";
import { Colors } from "@/constants/Colors";
import { StyleSheet } from "react-native";
import TopNav from "@/components/TopNav";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface CardProps {
  title: string;
  href: Href<string | object>;
  icon?: "book" | "dove" | "bookopen" | "bookandpen" | "breathe";
}

const SuggestedCard: React.FC<CardProps> = ({ title, href, icon }) => {
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
    case "breathe":
      imageSource = require("@/assets/images/breathe.png");
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
            ]}
          >
            {imageSource && <Image source={imageSource} style={styles.image} />}
            <CustomText letterSpacing="tight" style={styles.title}>
              {title}
            </CustomText>
          </View>
        )}
      </Pressable>
    </Link>
  );
};

const RelaxScreen = () => {
  const insets = useSafeAreaInsets();
  return (
    <ScrollView
      style={{
        paddingTop: insets.top,
        paddingBottom: insets.bottom,
        paddingLeft: insets.left,
        paddingRight: insets.right,
      }}
      className=" bg-blue100"
    >
      <View className="py-16 px-4">
        <CustomText
          letterSpacing="tight"
          className="mb-6 text-2xl font-medium text-center text-black200"
        >
          Relax
        </CustomText>
        {/* <SuggestedCard title="Meditation" href="/meditation" icon="dove" /> */}

        <View className="flex-row">
          <View className="w-1/2">
            <SuggestedCard
              title="Breathe"
              href="/relax/breathe"
              icon="breathe"
            />
          </View>
          {/* <View className="w-1/2">
            <SuggestedCard title="Meditate" href="/meditate" icon="meditate" />
          </View> */}
        </View>
      </View>
    </ScrollView>
  );
};

export default RelaxScreen;

const styles = StyleSheet.create({
  card: {
    backgroundColor: "white",
    borderRadius: 20, // rounded-2xl
    padding: 20, // p-5
    width: "100%",
    justifyContent: "center",
    alignItems: "center",

    ...shadows.card,
  },
  title: {
    fontSize: 20, // text-[24px]
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
    opacity: 0.6, // Adjust the opacity as needed
  },
});
