import CustomText from "@/frontend/components/CustomText";
import TopNav from "@/frontend/components/TopNav";
import { getStatus } from "@/frontend/constants/globals";
import React from "react";
import { View, ScrollView, Pressable } from "react-native";
import { format, isToday, isYesterday } from "date-fns";
import { StyleSheet } from "react-native";
import { shadows } from "@/frontend/constants/styles";
import { Colors } from "@/frontend/constants/Colors";
import { useNavigation } from "expo-router";
import { GuidedJournalEntry, JournalEntry, MoodEntry } from "@/types/models";
import { useHydratedEffect } from "@/hooks/hooks";
import {
  getJournalEntries,
  getGuidedJournalEntries,
  getMoodEntries,
} from "@/frontend/api/api";
import { STEPS_TEXT } from "@/frontend/app/patient/guided-journal/constants";

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
  data: JournalEntry;
}

interface GuidedJournalProps {
  data: GuidedJournalEntry;
}
interface MoodProps {
  data: MoodEntry;
}

const JournalCard: React.FC<JournalProps> = ({ data }) => {
  const navigation = useNavigation<any>();

  const truncatedTitle =
    !data.title || data.title.trim().length === 0
      ? "Untitled"
      : data.title.length > 30
      ? `${data.title.substring(0, 30)}...`
      : data.title;

  const truncatedContent =
    !data.body || data.body.trim().length === 0
      ? "Empty Journal"
      : data.body.length > 100
      ? `${data.body.substring(0, 100)}...`
      : data.body;

  const route = () => {
    navigation.navigate("patient/vault/history/journal/[date]", {
      date: data.date,
    });
  };

  return (
    <Pressable onPress={route} style={styles.container}>
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
    </Pressable>
  );
};

const GuidedJournalCard: React.FC<GuidedJournalProps> = ({ data }) => {
  const navigation = useNavigation<any>();
  const route = () => {
    navigation.navigate("patient/vault/history/guided-journal/[date]", {
      date: data.date,
    });
  };
  return (
    <Pressable onPress={route} style={styles.container}>
      <CustomText
        letterSpacing="wide"
        className="text-sm font-semibold text-gray100 mb-4"
      >
        GUIDED WRITING
      </CustomText>
      <CustomText className="text-sm text-gray100">{STEPS_TEXT.ONE}</CustomText>
      <CustomText className="text-sm text-gray200">
        {data.body.step1_text}
      </CustomText>
    </Pressable>
  );
};

const MoodCard: React.FC<MoodProps> = ({ data }) => {
  const navigation = useNavigation<any>();
  const route = () => {
    navigation.navigate("patient/vault/history/mood/[date]", {
      date: data.date,
    });
  };
  return (
    <Pressable onPress={route} style={styles.container}>
      <CustomText
        letterSpacing="wide"
        className="text-sm uppercase font-semibold text-gray100"
      >
        Tracking
      </CustomText>
      <CustomText className="text-xl mb-5 font-medium">
        You felt {getStatus(data.mood)}
      </CustomText>
      <CustomText className="text-sm leading-4 text-gray200">
        You also{" "}
        <CustomText className="text-sm leading-4 text-black100">
          ate {getStatus(data.eat)}
        </CustomText>{" "}
        and{" "}
        <CustomText className="text-sm leading-4 text-black100">
          slept {getStatus(data.sleep)}
        </CustomText>{" "}
        last night.
      </CustomText>
    </Pressable>
  );
};

type CardType = "journal" | "guidedWriting" | "mood";

type DataItem = {
  type: CardType;
  data: JournalEntry | GuidedJournalEntry | MoodEntry;
  created: string;
};

type Section = {
  date: string;
  data: DataItem[];
};

export default function VaultScreen() {
  const [data, setData] = React.useState<Section[]>([]);
  useHydratedEffect(() => {
    const fetchData = async () => {
      const journalEntries = await getJournalEntries();
      const guidedJournalEntries = await getGuidedJournalEntries();
      const moodEntries = await getMoodEntries();

      const allEntries: DataItem[] = [
        ...journalEntries.map((entry) => ({
          type: "journal" as CardType,
          data: entry,
          created: entry.date,
        })),
        ...guidedJournalEntries.map((entry) => ({
          type: "guidedWriting" as CardType,
          data: entry,
          created: entry.date,
        })),
        ...moodEntries.map((entry) => ({
          type: "mood" as CardType,
          data: entry,
          created: entry.date,
        })),
      ];

      console.log(allEntries);

      const sortedEntries = allEntries.sort(
        (a, b) => new Date(b.created).getTime() - new Date(a.created).getTime()
      );

      const groupedEntries: Section[] = [];
      sortedEntries.forEach((entry) => {
        const date = new Date(entry.created).toDateString();
        const sectionIndex = groupedEntries.findIndex(
          (section) => section.date === date
        );

        if (sectionIndex === -1) {
          groupedEntries.push({
            date,
            data: [entry],
          });
        } else {
          groupedEntries[sectionIndex].data.push(entry);
        }
      });

      setData(groupedEntries);
    };

    fetchData();
  }, []);
  return (
    <ScrollView className="bg-blue100 flex-1">
      <TopNav />
      <View className="mb-8 px-4">
        {data.length == 0 ? (
          <CustomText className="text-base text-gray300">
            No activity yet.
          </CustomText>
        ) : (
          data.map((section, sectionIndex) => (
            <View key={sectionIndex}>
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
                          return (
                            <JournalCard data={item.data as JournalEntry} />
                          );
                        case "guidedWriting":
                          return (
                            <GuidedJournalCard
                              data={item.data as GuidedJournalEntry}
                            />
                          );
                        case "mood":
                          return <MoodCard data={item.data as MoodEntry} />;
                        default:
                          return null;
                      }
                    })()}
                  </View>
                );
              })}
              {/* Render horizontal bar if it's not the last section */}
              {sectionIndex < data.length - 1 && (
                <View className="h-[1px] bg-gray50 my-5" />
              )}
            </View>
          ))
        )}
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
