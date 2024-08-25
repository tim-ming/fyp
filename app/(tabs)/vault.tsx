import CustomText from "@/components/CustomText";
import TopNav from "@/components/TopNav";
import { getStatus } from "@/constants/globals";
import React from "react";
import { View, ScrollView } from "react-native";
import { format, isToday, isYesterday } from "date-fns";
import { StyleSheet } from "react-native";
import { shadows } from "@/constants/styles";
import { Colors } from "@/constants/Colors";
import jsonData from "@/assets/data/vault.json";

const formatDateHeader = (date: string) => {
  const parsedDate = new Date(date);

  if (isToday(parsedDate)) {
    return `Today, ${format(parsedDate, "dd MMM")}`;
  } else if (isYesterday(parsedDate)) {
    return `Yesterday, ${format(parsedDate, "dd MMM")}`;
  } else {
    return format(parsedDate, "dd MMM");
  }
};
interface JournalProps {
  data: Journal;
}
interface Journal {
  title: string;
  content: string;
}
interface GuidedWritingProps {
  data: GuidedWriting;
}
interface GuidedWriting {
  content: string;
}
interface TrackingProps {
  data: Tracking;
}
interface Tracking {
  mood: number;
  sleep: number;
  diet: number;
}
const JournalCard: React.FC<JournalProps> = ({ data }: JournalProps) => {
  const truncatedTitle =
    !data.title || data.title.trim().length === 0
      ? "Untitled"
      : data.title.length > 30
      ? `${data.title.substring(0, 30)}...`
      : data.title;

  const truncatedContent =
    !data.content || data.content.trim().length === 0
      ? "Empty Journal"
      : data.content.length > 100
      ? `${data.content.substring(0, 100)}...`
      : data.content;
  return (
    <View style={styles.container}>
      <CustomText
        letterSpacing="wide"
        className="text-sm font-semibold text-gray100"
      >
        JOURNAL
      </CustomText>

      <CustomText className="text-xl mb-5 font-medium">
        {truncatedTitle}
      </CustomText>
      <CustomText className="text-sm text-gray200">
        {truncatedContent}
      </CustomText>
    </View>
  );
};

const GuidedWritingCard: React.FC<GuidedWritingProps> = ({ data }) => {
  return (
    <View style={styles.container}>
      <CustomText
        letterSpacing="wide"
        className="text-sm font-semibold text-gray100"
      >
        GUIDED WRITING
      </CustomText>
      <CustomText className="text-sm text-gray200">{data.content}</CustomText>
    </View>
  );
};

const TrackingCard: React.FC<TrackingProps> = ({ data }) => {
  return (
    <View style={styles.container}>
      <CustomText
        letterSpacing="wide"
        className="text-sm font-semibold text-gray100"
      >
        MOOD TRACKING
      </CustomText>
      <CustomText className="text-xl mb-5 font-medium">
        You felt {getStatus(data.mood)}
      </CustomText>
      <CustomText className="text-sm leading-4 text-gray200">
        You also{" "}
        <CustomText className="text-sm leading-4 text-black100">
          ate {getStatus(data.diet)}
        </CustomText>{" "}
        and{" "}
        <CustomText className="text-sm leading-4 text-black100">
          slept {getStatus(data.sleep)}
        </CustomText>{" "}
        in the previous night.
      </CustomText>
    </View>
  );
};
type DataItem = {
  type: "journal" | "guidedWriting" | "tracking";
  data: Journal | GuidedWriting | Tracking;
  created: string;
};

type Section = {
  date: string;
  data: DataItem[];
};
export default function VaultScreen() {
  const data = jsonData as Section[];
  return (
    <ScrollView className="bg-blue100 flex-1">
      <TopNav />
      <View className="mb-8 px-4">
        {data.map((section, sectionIndex) => (
          <>
            <View key={section.date}>
              {/* Date Section */}
              <CustomText className="text-lg font-semibold mb-4">
                {formatDateHeader(section.date)}
              </CustomText>

              {/* Render Cards */}
              {section.data.map((item, index) => {
                const isLastItem = index === section.data.length - 1;
                return (
                  <View key={index} className={isLastItem ? `mb-0` : `mb-1`}>
                    {(() => {
                      switch (item.type) {
                        case "journal":
                          return <JournalCard data={item.data as Journal} />;
                        case "guidedWriting":
                          return (
                            <GuidedWritingCard
                              data={item.data as GuidedWriting}
                            />
                          );
                        case "tracking":
                          return <TrackingCard data={item.data as Tracking} />;
                        default:
                          return null;
                      }
                    })()}
                  </View>
                );
              })}
            </View>
            {/* Render horizontal bar if it's not the last section */}
            {sectionIndex < data.length - 1 && (
              <View className="h-[1px] bg-gray50 my-5" />
            )}
          </>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "white",
    padding: 16, // 1rem is approximately 16 pixels
    borderRadius: 16, // Adjust as needed
    borderWidth: 1, // Adjust as needed
    borderColor: Colors.gray50, // Adjust as needed
    ...shadows.card,
  },
});
