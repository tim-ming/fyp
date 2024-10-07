import React, { useRef, useState, useEffect, useCallback } from "react";
import {
  FlatList,
  Pressable,
  TextInput,
  View,
  KeyboardAvoidingView,
  Platform,
  ListRenderItemInfo,
  Image,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import CustomText from "@/components/CustomText";
import TopNav from "@/components/TopNav";
import { useAuth } from "@/state/auth";
import { useHydratedEffect } from "@/hooks/hooks";
import { getMessages, getTherapistInCharge } from "@/api/api";
import { UserWithoutSensitiveData } from "@/types/models";
import { Link } from "expo-router";
import { BACKEND_URL } from "@/constants/globals";
import { differenceInMinutes } from "date-fns";
import { format, toZonedTime } from "date-fns-tz";

interface Message {
  id: number;
  content: string;
  sender_id: number;
  timestamp: string;
}

const ChatScreen: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState("");
  const inputRef = useRef<TextInput>(null);
  const flatListRef = useRef<FlatList<Message>>(null);
  const websocketRef = useRef<WebSocket | null>(null);
  const auth = useAuth();
  const [loading, setLoading] = useState(true);

  const [therapist, setTherapist] = useState<UserWithoutSensitiveData | null>(
    null
  );

  useHydratedEffect(async () => {
    const token = auth.token?.access_token;
    try {
      const therapist = await getTherapistInCharge();
      setTherapist(therapist);

      if (therapist && therapist.id) {
        setMessages((await getMessages(therapist.id)).toReversed());
      }
    } catch (error) {
      setLoading(false);
      return;
    }

    connectWebSocket(token ? token : "");
    setLoading(false);

    return () => {
      if (websocketRef.current) {
        websocketRef.current.close();
      }
    };
  }, []);

  const scrollToBottom = useCallback(() => {
    if (flatListRef.current && messages.length > 0) {
      flatListRef.current.scrollToOffset({ offset: 0, animated: true });
    }
  }, [messages]);

  useEffect(() => {
    scrollToBottom();
  }, [scrollToBottom]);

  const connectWebSocket = async (token: string) => {
    const endpoint = BACKEND_URL;
    // backendurl contains either http or https, so adjust for ws or wss
    const url = endpoint.replace(/^https/, "wss").replace(/^http/, "ws");
    const ws = new WebSocket(`${url}/ws/chat?token=${token}`);

    ws.onopen = () => {
      console.log("WebSocket Connected");
    };

    ws.onmessage = (event) => {
      const message = JSON.parse(event.data);
      console.log(message);
      setMessages((prevMessages) => [message, ...prevMessages]);
      console.log(messages);
    };

    ws.onerror = (error) => {
      console.error("WebSocket Error:", error);
    };

    ws.onclose = () => {
      console.log("WebSocket Disconnected");
      // Attempt to reconnect after a delay
      setTimeout(() => {
        connectWebSocket(token);
      }, 5000);
    };

    websocketRef.current = ws;
  };

  const handleSend = () => {
    if (inputText.trim() && websocketRef.current) {
      const message = {
        content: inputText.trim(),
        recipient_id: therapist?.id,
      };
      websocketRef.current.send(JSON.stringify(message));
      setInputText("");
    }
  };

  const [clickedMessageId, setClickedMessageId] = useState<number | null>(null);

  const handleMessagePress = useCallback((messageId: number) => {
    setClickedMessageId((prevId) => (prevId === messageId ? null : messageId));
  }, []);

  const renderMessage = useCallback(
    ({ item, index }: ListRenderItemInfo<Message>) => {
      const isTherapist = item.sender_id == therapist!.id;
      const previousMessage =
        index < messages.length - 1 ? messages[index + 1] : null;
      const nextMessage = index > 0 ? messages[index - 1] : null;

      // Show timestamp for the first message or if there's a significant time gap
      const showTimestamp =
        index === messages.length - 1 ||
        !previousMessage ||
        differenceInMinutes(
          new Date(item.timestamp),
          new Date(previousMessage.timestamp)
        ) >= 45;

      // Show therapist image for the first message from therapist in a group or the very last message
      const showTherapistImage =
        isTherapist &&
        (index === 0 ||
          !nextMessage ||
          nextMessage.sender_id !== item.sender_id ||
          differenceInMinutes(
            new Date(nextMessage.timestamp),
            new Date(item.timestamp)
          ) >= 45);

      const adjustedDate = toZonedTime(new Date(item.timestamp), "UTC");

      const isMessageClicked = clickedMessageId === item.id;

      return (
        <View>
          {showTimestamp && (
            <View className="items-center my-2">
              <CustomText className="text-xs text-gray500">
                {format(adjustedDate, "MMM d, yyyy h:mm a")}
              </CustomText>
            </View>
          )}
          <View
            className={`flex-row mb-2 ${
              isTherapist ? "justify-start" : "justify-end"
            }`}
          >
            {isTherapist && showTherapistImage && (
              <Image
                source={{ uri: therapist?.image }}
                className="w-8 h-8 rounded-full mr-2"
              />
            )}
            {isTherapist && !showTherapistImage && (
              <View className="w-8 mr-2" />
            )}
            <TouchableOpacity
              onPress={() => handleMessagePress(item.id)}
              activeOpacity={0.7}
              className={`p-4 rounded-2xl max-w-[70%] bg-white border border-gray50 ${
                isMessageClicked ? "opacity-80" : ""
              }`}
            >
              <CustomText className={`text-base text-black200 w-full`}>
                {item.content}
              </CustomText>
              {isMessageClicked && (
                <CustomText className="text-xs text-gray500 mt-2">
                  {format(adjustedDate, "h:mm a")}
                </CustomText>
              )}
            </TouchableOpacity>
          </View>
        </View>
      );
    },
    [therapist, messages, clickedMessageId, handleMessagePress]
  );

  const keyExtractor = useCallback((item: Message) => item.id.toString(), []);

  if (loading) {
    return (
      <View className="flex-1 bg-blue100 items-center justify-center">
        <CustomText className="text-black text-[20px] font-semibold">
          Connecting...
        </CustomText>
      </View>
    );
  }

  if (!loading && !therapist) {
    return (
      <View className="flex-1 bg-blue100 items-center justify-center">
        <CustomText className="text-black text-[20px] text-center mb-5">
          You have not connected with a therapist yet.
        </CustomText>
        <Link href="/" className="text-blue-500 font-semibold">
          Find a Therapist now!
        </Link>
      </View>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-blue100">
      <TopNav />
      <View className="flex-1">
        <View className="px-4 py-2 border-b-[1px] border-gray50">
          <CustomText
            letterSpacing="tight"
            className="text-[24px] font-medium text-center text-black200"
          >
            Dr. {therapist?.name}
          </CustomText>
        </View>
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderMessage}
          keyExtractor={keyExtractor}
          contentContainerStyle={{
            flexGrow: 1,
            justifyContent: "flex-end",
            padding: 16,
          }}
          inverted
          onLayout={scrollToBottom}
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
              <CustomText className="text-blue500 font-semibold">
                Send
              </CustomText>
            </Pressable>
          </View>
        </KeyboardAvoidingView>
      </View>
    </SafeAreaView>
  );
};

export default ChatScreen;
