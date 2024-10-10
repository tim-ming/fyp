import React, { useRef, useState } from "react";
import { Pressable, ScrollView, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Card, { CardProps } from "@/components/Card";
import CustomText from "@/components/CustomText";
import TopNav from "@/components/TopNav";
import Search from "@/assets/icons/search.svg";

const ExploreScreen: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const searchInputRef = useRef<TextInput>(null);

  const cardsData: Array<
    Pick<CardProps, "title" | "subtitle" | "href" | "icon">
  > = [
    {
      title: "Journal",
      subtitle: "Write about your day.",
      href: {
        pathname: "/patient/journal/start",
        params: { source: "/(tabs)/explore" },
      },
      icon: "book",
    },
    {
      title: "Guided Writing",
      subtitle: "Discover your hidden thoughts.",
      href: "/patient/guided-journal/start",
      icon: "bookandpen",
    },
    {
      title: "Breathe",
      subtitle: "Unwind out your day.",
      href: "/patient/relax",
      icon: "dove",
    },
    {
      title: "Reading",
      subtitle: "Feed your mind and imagination.",
      href: "/patient/read",
      icon: "bookopen",
    },
  ];

  const filteredCards = cardsData.filter((card) =>
    card.title.toLowerCase().startsWith(searchTerm.toLowerCase())
  );

  return (
    <View className="flex-1 bg-blue100">
      <TopNav />

      <View className="px-4 border-b-[1px] border-gray50">
        <View>
          <CustomText
            letterSpacing="tight"
            className="text-[24px] font-medium text-center text-black200"
          >
            Explore
          </CustomText>
        </View>
        <Pressable
          className="my-3"
          tabIndex={-1}
          onPress={() => searchInputRef.current?.focus()}
        >
          <View className="relative">
            <TextInput
              className="h-12 bg-white text-base rounded-full pl-12 pr-4 font-[PlusJakartaSans] placeholder:text-gray100"
              placeholder="Search"
              ref={searchInputRef}
              placeholderTextColor="#8B8B8B"
              value={searchTerm}
              onChangeText={setSearchTerm}
            />
            <Search
              width={24}
              height={24}
              strokeWidth={1.5}
              pointerEvents="none"
              className="stroke-gray200 absolute left-4 top-0 h-full w-6 items-center justify-center"
            />
          </View>
        </Pressable>
      </View>
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
    </View>
  );
};

export default ExploreScreen;
