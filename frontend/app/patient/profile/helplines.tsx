import CustomText from "@/components/CustomText";
import { ScrollView, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function App() {
  const insets = useSafeAreaInsets();

  const helplines = [
    {
      name: "Befrienders KL",
      contact: "03-76272929",
      website: "https://www.befrienders.org.my",
    },
    {
      name: "Malaysian Mental Health Association (MMHA)",
      contact: "03-2780 6803",
      website: "https://mmha.org.my",
    },
    {
      name: "MIASA Crisis Helpline",
      contact: "1-800-18-0066",
      website: "https://miasa.org.my",
    },
  ];

  return (
    <ScrollView
      style={{
        paddingTop: insets.top,
        paddingBottom: insets.bottom,
        paddingLeft: insets.left,
        paddingRight: insets.right,
      }}
      className="bg-blue100"
    >
      <View className="flex-1 bg-blue100 px-4 py-16 gap-y-7">
        <CustomText
          letterSpacing="tight"
          className="text-2xl font-semibold text-black200"
        >
          Helplines
        </CustomText>

        {helplines.map((helpline, index) => (
          <View key={index} className="mb-4">
            <CustomText className="text-lg font-medium text-black200">
              {helpline.name}
            </CustomText>
            <CustomText className="text-base text-gray100">
              {helpline.contact}
            </CustomText>
            <a href={helpline.website}>
              <CustomText className="text-base text-blue200">
                {helpline.website}
              </CustomText>
            </a>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}
