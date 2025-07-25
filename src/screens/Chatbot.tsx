import {
  getConversations as fetchConversations,
  sendMessage as sendChatMessage,
  clearHistory as clearChatHistory,
  logError,
  parseTextChatbot,
} from "@utils";
import React, {
  useRef,
  useMemo,
  useState,
  useEffect,
  useCallback,
} from "react";
import {
  View,
  FlatList,
  Platform,
  ScrollView,
  SafeAreaView,
  KeyboardAvoidingView,
} from "react-native";
import Button from "@components/common/Button";
import { useModal } from "@context/ModalContext";
import { useLanguage } from "@context/LanguageContext";
import HeaderComponent from "@components/common/Header";
import useStylesChatbot from "@/styles/screens/stylesChatbot";
import { useNavigation } from "@react-navigation/native";
import { useUserContext } from "@context/UserContext";
import { TextInput, Text } from "react-native-paper";
import { RootStackParamList } from "@navigation/navigationTypes";
import { Message, Conversation } from "@types";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";

type ChatbotScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  "Chatbot"
>;

const Chatbot: React.FC = () => {
  const { t, language } = useLanguage();
  const { styles } = useStylesChatbot();
  const { isLoggedIn, loading, userData } = useUserContext();
  const { openModal, closeModal } = useModal();
  const navigation = useNavigation<ChatbotScreenNavigationProp>();

  const initialMessage: Message = useMemo(
    () => ({
      id: "bot-0",
      text: t("initialBotMessage"),
      sender: "bot",
      timestamp: new Date(),
    }),
    [t],
  );

  const [input, setInput] = useState<string>("");
  const [messages, setMessages] = useState<Message[]>([initialMessage]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentConvId, setCurrentConvId] = useState<string | null>(null);
  const [isTyping, setIsTyping] = useState<boolean>(false);
  const [isNewConversation, setIsNewConversation] = useState<boolean>(false);
  const scrollViewRef = useRef<ScrollView>(null);

  const loadConversations = useCallback(async () => {
    if (!userData?.userId) return;

    try {
      const response = await fetchConversations(userData.userId);
      if (response.error) {
        logError("Error loading conversations:", response.error);
        return;
      }

      setConversations(response.conversations);

      if (response.conversations.length === 0) {
        setIsNewConversation(true);
        setMessages([initialMessage]);
      } else {
        const mostRecent = response.conversations[0];
        setCurrentConvId(mostRecent.id);
        setMessages(mostRecent.messages);
        setIsNewConversation(false);
      }
    } catch (error) {
      logError("Error loading conversations:", error);
    }
  }, [userData?.userId, initialMessage]);

  const handleNewConversation = useCallback(() => {
    if (isNewConversation && messages.length <= 1) return;

    setCurrentConvId(null);
    setMessages([initialMessage]);
    setIsNewConversation(true);
  }, [isNewConversation, messages.length, initialMessage]);

  const handleSelectConversation = (conv: Conversation) => {
    setCurrentConvId(conv.id);
    setMessages(conv.messages);
    setIsNewConversation(false);
  };

  const handleClearHistory = async () => {
    if (!userData?.userId) return;

    try {
      const response = await clearChatHistory(userData.userId);
      if (response.error) {
        logError("Error clearing history:", response.error);
        return;
      }

      if (!response.success) return;
      setConversations([]);
      setCurrentConvId(null);
      setMessages([initialMessage]);
      setIsNewConversation(true);
    } catch (error) {
      logError("Error clearing history:", error);
    }
  };

  const handleSend = async () => {
    if (!input.trim() || !userData?.userId) return;

    const userMessage = input.trim();
    setInput("");
    setIsTyping(true);

    const userMsg: Message = {
      id: `user-${Date.now()}`,
      text: userMessage,
      sender: "user",
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMsg]);

    try {
      const response = await sendChatMessage(
        userData.userId,
        userMessage,
        language,
        userData.name,
        currentConvId || undefined,
      );

      if (response.error) {
        logError("Error sending message:", response.error);
        setMessages((prev) => prev.slice(0, -1));
        return;
      }

      setCurrentConvId(response.conversation.id);
      setMessages(response.conversation.messages);
      setIsNewConversation(false);

      await loadConversations();
    } catch (error) {
      logError("Error sending message:", error);
      setMessages((prev) => prev.slice(0, -1));
    } finally {
      setIsTyping(false);
    }
  };

  const renderMessage = useCallback(
    (msg: Message) => (
      <View
        key={msg.id}
        style={[
          styles.message,
          msg.sender === "user" ? styles.user : styles.bot,
        ]}
      >
        <Text style={styles.messageText}>{parseTextChatbot(msg.text)}</Text>
      </View>
    ),
    [styles],
  );

  const renderConversation = ({ item }: { item: Conversation }) => (
    <Button
      handlePress={() => handleSelectConversation(item)}
      replaceStyles={{
        button: styles.sidebarItem,
        textButton: styles.convPreview,
      }}
      children={
        <>
          <Text style={styles.convDate}>{item.date}</Text>
          <Text style={styles.convPreview} numberOfLines={1}>
            {item.messages[item.messages.length - 1]?.text}
          </Text>
        </>
      }
    />
  );

  useEffect(() => {
    if (!currentConvId) return;
    setConversations((prev) =>
      prev.map((conv) =>
        conv.id === currentConvId ? { ...conv, messages } : conv,
      ),
    );
  }, [messages, currentConvId]);

  useEffect(() => {
    scrollViewRef.current?.scrollToEnd({ animated: true });
  }, [messages, isTyping]);

  useEffect(() => {
    if (loading || !isLoggedIn || !userData?.userId) return;
    loadConversations();
  }, [loading, isLoggedIn, userData?.userId, loadConversations]);

  useEffect(() => {
    if (loading) return;
    if (isLoggedIn) return;

    openModal(
      t("loginRequired"),
      t("loginRequiredMessage"),
      <Button
        label={t("login")}
        handlePress={() => {
          closeModal();
          navigation.replace("Login");
        }}
      />,
    );
  }, [loading, isLoggedIn, t, navigation, openModal, closeModal]);

  return (
    <>
      <HeaderComponent />
      <SafeAreaView style={styles.container}>
        {/* Sidebar */}
        <View style={styles.sidebar}>
          <Text style={styles.sidebarTitle}>{t("history")}</Text>
          <Button
            label={t("clearHistory")}
            handlePress={handleClearHistory}
            replaceStyles={{
              button: styles.sidebarButton,
              textButton: styles.sidebarButtonText,
            }}
          />
          <Button
            label={t("newConversation")}
            handlePress={handleNewConversation}
            replaceStyles={{
              button: styles.sidebarButton,
              textButton: styles.sidebarButtonText,
            }}
          />
          <FlatList
            data={conversations}
            renderItem={renderConversation}
            keyExtractor={(item) => item.id}
            style={styles.flex1}
          />
        </View>

        {/* Main Chat Area */}
        <View style={styles.main}>
          <View style={styles.header}>
            <Text style={styles.headerText}>{t("chatbotTitle")}</Text>
          </View>
          <ScrollView
            style={styles.chat}
            ref={scrollViewRef}
            contentContainerStyle={styles.paddingBottom12}
          >
            {messages.map(renderMessage)}
            {isTyping && (
              <View style={[styles.message, styles.bot]}>
                <Text style={[styles.messageText, styles.typing]}>
                  {t("typing")}
                </Text>
              </View>
            )}
          </ScrollView>
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : undefined}
            keyboardVerticalOffset={80}
          >
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                label={t("askYourQuestion")}
                value={input}
                onChangeText={setInput}
                onSubmitEditing={handleSend}
                returnKeyType="send"
              />
              <Button
                label={t("send")}
                handlePress={handleSend}
                replaceStyles={{
                  button: styles.sendButton,
                  textButton: styles.sendButtonText,
                }}
              />
            </View>
          </KeyboardAvoidingView>
        </View>
      </SafeAreaView>
    </>
  );
};

export default Chatbot;
