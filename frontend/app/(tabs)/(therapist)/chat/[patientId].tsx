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
  StyleSheet,
} from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import CustomText from "@/frontend/components/CustomText";
import { useAuth } from "@/state/auth";
import { useHydratedEffect } from "@/hooks/hooks";
import { getMessages, getPatients } from "@/frontend/api/api";
import { Message, UserWithoutSensitiveData } from "@/types/models";
import { BACKEND_URL } from "@/frontend/constants/globals";
import { differenceInMinutes, set } from "date-fns";
import { format, toZonedTime } from "date-fns-tz";
import { useLocalSearchParams, useRouter } from "expo-router";
import { shadows } from "@/frontend/constants/styles";
import SendIcon from "@/assets/icons/send.svg";
import BackButtonWrapper from "@/frontend/components/Back";
import useWebSocketStore from "@/state/socket";

const ChatScreen = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState("");
  const inputRef = useRef<TextInput>(null);
  const flatListRef = useRef<FlatList<Message>>(null);
  const router = useRouter();
  const { patientId } = useLocalSearchParams();
  const intPatientId = parseInt(patientId as string);
  const webSocketStore = useWebSocketStore();
  const auth = useAuth();
  const [loading, setLoading] = useState(true);
  const [patient, setPatient] = useState<UserWithoutSensitiveData | null>(null);
  console.log(intPatientId);
  useHydratedEffect(async () => {
    setLoading(true);
    const token = auth.token?.access_token;
    try {
      const patient = (await getPatients()).find(
        (patient) => patient.id === intPatientId
      );
      if (!patient) {
        throw new Error("Patient not found");
      }
      setPatient(patient);
      if (patient && patient.id) {
        setMessages((await getMessages(patient.id)).toReversed());
      }
    } catch (error) {
      setLoading(false);
      return;
    }

    if (token && !webSocketStore.isConnected) {
      webSocketStore.connect(token);
    }

    const messageHandler = (message: Message) => {
      if (
        (message.sender_id === intPatientId &&
          message.recipient_id === auth.user?.id) ||
        (message.sender_id === auth.user?.id &&
          message.recipient_id === intPatientId)
      ) {
        setMessages((prevMessages) => [message, ...prevMessages]);
      }
    };

    webSocketStore.addMessageListener(intPatientId, messageHandler);
    setLoading(false);

    return () => {
      webSocketStore.removeMessageListener(intPatientId);
    };
  }, [patientId]);

  const scrollToBottom = useCallback(() => {
    if (flatListRef.current && messages.length > 0) {
      flatListRef.current.scrollToOffset({ offset: 0, animated: true });
    }
  }, [messages]);

  useEffect(() => {
    scrollToBottom();
  }, [scrollToBottom]);

  const handleSend = () => {
    if (inputText.trim() && patient?.id) {
      const message = {
        content: inputText.trim(),
        recipient_id: patient.id,
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
      const isPatient = item.sender_id == patient!.id;
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

      // Show patient image for the first message from patient in a group or the very last message
      const showPatientImage =
        isPatient &&
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
              isPatient ? "justify-start" : "justify-end"
            }`}
          >
            {isPatient && showPatientImage && (
              <Image
                source={{ uri: BACKEND_URL + patient?.image }}
                className="w-8 h-8 rounded-full mr-2"
              />
            )}
            {isPatient && !showPatientImage && <View className="w-8 mr-2" />}
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
    [patient, messages, clickedMessageId, handleMessagePress]
  );

  const insets = useSafeAreaInsets();

  const keyExtractor = useCallback((item: Message) => item.id.toString(), []);

  const navigateToPatientProfile = () => {
    router.push(`/(therapist)/patients/${patientId}`);
  };

  if (loading) {
    return (
      <View className="flex-1 bg-blue100 items-center justify-center">
        <CustomText className="text-black text-[20px] font-semibold">
          Connecting...
        </CustomText>
      </View>
    );
  }

  if (!loading && !patient) {
    return (
      <View className="flex-1 bg-blue100 items-center justify-center">
        <CustomText className="text-black text-[20px] text-center mb-5">
          The user has not given permission to chat with them.
        </CustomText>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-blue100">
      <View
        style={{
          paddingTop: insets.top,
        }}
        className="flex-1"
      >
        <View className="flex-row items-center">
          <BackButtonWrapper className="ml-4" />
          <Pressable onPress={navigateToPatientProfile}>
            <View className="px-4 py-2 flex items-center flex-row">
              <Image
                className="w-12 h-12 rounded-full mr-2"
                source={{ uri: BACKEND_URL + patient?.image }}
              />
              <CustomText
                letterSpacing="tight"
                className="text-lg font-medium text-center text-black200"
              >
                {patient?.sex?.toLowerCase() == "m" ? "Mr." : "Ms."}{" "}
                {patient?.name}
              </CustomText>
            </View>
          </Pressable>
        </View>
        <View className="h-[1px] w-full bg-gray50"></View>
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderMessage}
          keyExtractor={keyExtractor}
          contentContainerStyle={{
            flexGrow: 1,
            justifyContent: "flex-end",
            paddingLeft: 16,
            paddingRight: 16,
          }}
          inverted
          onLayout={scrollToBottom}
        />
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          // keyboardVerticalOffset={100}
        >
          <View className="flex-row items-center border-t border-gray50 px-4 py-2">
            <View className="flex-1 mr-2 h-20">
              <TextInput
                style={[shadows.card, { flex: 1 }]}
                ref={inputRef}
                className="bg-white text-base rounded-2xl p-2 font-[PlusJakartaSans] placeholder:text-gray100"
                placeholder="Type a message..."
                value={inputText}
                onChangeText={setInputText}
                multiline
              />
            </View>
            <Pressable
              onPress={handleSend}
              className="p-3 rounded-full bg-blue200"
            >
              <SendIcon style={styles.sendIcon} />
            </Pressable>
          </View>
        </KeyboardAvoidingView>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  sendIcon: {
    width: 24,
    height: 24,
    color: "white",
    transform: [{ translateX: -1 }],
  },
});

export default ChatScreen;
