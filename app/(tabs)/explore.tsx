import React, { useState } from "react";
import { ScrollView, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Card, { CardProps } from "@/components/Card";
import CustomText from "@/components/CustomText";
import TopNav from "@/components/TopNav";

const ExploreScreen: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");

  const cardsData: Array<
    Pick<CardProps, "title" | "subtitle" | "href" | "icon">
  > = [
    {
      title: "Journal",
      subtitle: "Write about your day.",
      href: "/journal/start",
      icon: "book",
    },
    {
      title: "Guided Writing",
      subtitle: "Discover your hidden thoughts.",
      href: "/guided-journal/start",
      icon: "bookandpen",
    },
    {
      title: "Relax",
      subtitle: "Unwind out your day.",
      href: "/relax",
      icon: "dove",
    },
    {
      title: "Reading",
      subtitle: "Feed your mind and imagination.",
      href: "/read",
      icon: "bookopen",
    },
  ];

  const filteredCards = cardsData.filter((card) =>
    card.title.toLowerCase().startsWith(searchTerm.toLowerCase())
  );

  return (
    <SafeAreaView className="flex-1 bg-blue100">
      <TopNav />

      <View>
        <CustomText
          letterSpacing="tight"
          className="text-[24px] font-medium text-center text-black200"
        >
          Explore
        </CustomText>
      </View>

      <TextInput
        className="bg-white rounded-full px-4 py-2 mx-4 my-4"
        placeholder="Search stuff"
        placeholderTextColor="#8B8B8B"
        value={searchTerm}
        onChangeText={setSearchTerm}
      />

      <ScrollView className="px-4 py-4">
        {filteredCards.map((card, index) => (
          <Card
            key={index}
            title={card.title}
            subtitle={card.subtitle}
            href={card.href}
            icon={card.icon}
          />
        ))}
      </ScrollView>
    </SafeAreaView>
  );
};

export default ExploreScreen;
