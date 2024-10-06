import React, { useRef, useState, useEffect } from "react";
import { FlatList, Pressable, TextInput, View, KeyboardAvoidingView, Platform } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import CustomText from "@/components/CustomText";
import TopNav from "@/components/TopNav";

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'other';
}

const ChatScreen: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState("");
  const inputRef = useRef<TextInput>(null);
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    // Scroll to the bottom when messages change
    flatListRef.current?.scrollToEnd({ animated: true });
  }, [messages]);

  const handleSend = () => {
    if (inputText.trim()) {
      const newMessage: Message = {
        id: Date.now().toString(),
        text: inputText.trim(),
        sender: 'user',
      };
      setMessages((prevMessages) => [...prevMessages, newMessage]);
      setInputText("");
    }
  };

  const renderMessage = ({ item }: { item: Message }) => (
    <View 
      className={`mb-2 p-3 rounded-2xl max-w-[80%] ${
        item.sender === 'user' ? 'bg-blue500 self-end' : 'bg-gray100 self-start'
      }`}
    >
      <CustomText 
        className={`text-base ${
          item.sender === 'user' ? 'text-white' : 'text-black200'
        }`}
      >
        {item.text}
      </CustomText>
    </View>
  );

  return (
    <SafeAreaView className="flex-1 bg-white">
      <TopNav />
      <View className="flex-1">
        <View className="px-4 py-2 border-b-[1px] border-gray50">
          <CustomText
            letterSpacing="tight"
            className="text-[24px] font-medium text-center text-black200"
          >
            Chat
          </CustomText>
        </View>
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderMessage}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: 16 }}
        />
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          keyboardVerticalOffset={100}
        >
          <View className="flex-row items-center border-t border-gray50 px-4 py-2">
            <TextInput
              ref={inputRef}
              className="flex-1 bg-gray50 text-base rounded-full px-4 py-2 mr-2 font-[PlusJakartaSans]"
              placeholder="Type a message..."
              value={inputText}
              onChangeText={setInputText}
              multiline
            />
            <Pressable onPress={handleSend}>
        
            </Pressable>
          </View>
        </KeyboardAvoidingView>
      </View>
    </SafeAreaView>
  );
};

export default ChatScreen;