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
import { shadows } from "@/constants/styles";
import SendIcon from "@/assets/icons/send.svg";
import useWebSocketStore from '@/state/socket';
import { Message } from "@/types/models";
import useTherapistStore from "@/state/assignedTherapist";

const ChatScreen: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState("");
  const inputRef = useRef<TextInput>(null);
  const flatListRef = useRef<FlatList<Message>>(null);
  const auth = useAuth();
  const [loading, setLoading] = useState(true);
  const webSocketStore = useWebSocketStore();
  const { therapist, setTherapist } = useTherapistStore();

  const fetchMessages = useCallback(async (therapistId: number) => {
    try {
      const fetchedMessages = await getMessages(therapistId);
      setMessages(fetchedMessages.toReversed());
    } catch (error) {
      console.error("Error fetching messages:", error);
    }
  }, []);

  useHydratedEffect(async () => {
    setLoading(true);
    const token = auth.token?.access_token;

    try {
      if (!therapist) {
        const fetchedTherapist = await getTherapistInCharge();
        setTherapist(fetchedTherapist);
        if (fetchedTherapist && fetchedTherapist.id) {
          await fetchMessages(fetchedTherapist.id);
        }
      } else if (therapist.id) {
        await fetchMessages(therapist.id);
      }
    } catch (error) {
      console.error("Error fetching therapist or messages:", error);
    } finally {
      setLoading(false);
    }

    if (token && !webSocketStore.isConnected) {
      webSocketStore.connect(token);
    }

    const messageHandler = (message: Message) => {
      if (
        (message.sender_id === therapist?.id && message.recipient_id === auth.user?.id) ||
        (message.sender_id === auth.user?.id && message.recipient_id === therapist?.id)
      ) {
        setMessages((prevMessages) => [message, ...prevMessages]);
      }
    };

    webSocketStore.addMessageListener(messageHandler);

    return () => {
      webSocketStore.removeMessageListener(messageHandler);
    };
  }, [therapist, fetchMessages]);

  const scrollToBottom = useCallback(() => {
    if (flatListRef.current && messages.length > 0) {
      flatListRef.current.scrollToOffset({ offset: 0, animated: true });
    }
  }, [messages]);

  useEffect(() => {
    scrollToBottom();
  }, [scrollToBottom]);

  const handleSend = () => {
    if (inputText.trim() && therapist?.id) {
      const message = {
        content: inputText.trim(),
        recipient_id: therapist?.id,
        sender_id: auth.user?.id,
      };
      webSocketStore.sendMessage(message);
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
                source={{ uri: BACKEND_URL + therapist?.image }}
                className="w-8 h-8 rounded-full mr-2"
              />
            )}
            {isTherapist && !showTherapistImage && (
              <View className="w-8 mr-2" />
            )}
            <Pressable
              onPress={() => handleMessagePress(item.id)}
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
            </Pressable>
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
        <View className="px-4 py-2 border-b-[1px] border-gray50 flex items-center flex-row">
          <Image
            className="w-12 h-12 rounded-full mr-2"
            source={{ uri: BACKEND_URL + therapist?.image }}
          />
          <CustomText
            letterSpacing="tight"
            className="text-lg font-medium text-center text-black200"
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
              style={shadows.card}
              ref={inputRef}
              className="w-full bg-white text-base rounded-2xl h-14 pt-4 px-4 font-[PlusJakartaSans] placeholder:text-gray100"
              placeholder="Type a message..."
              value={inputText}
              onChangeText={setInputText}
              multiline
            />
            <Pressable
              onPress={handleSend}
              className="p-3 rounded-full bg-blue200  ml-2"
            >
              <SendIcon className="w-6 h-6 stroke-2 translate-x-[-1px] stroke-white" />
            </Pressable>
          </View>
        </KeyboardAvoidingView>
      </View>
    </SafeAreaView>
  );
};

export default ChatScreen;
