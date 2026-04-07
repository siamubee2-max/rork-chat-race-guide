import React, { useState, useRef, useEffect } from "react";
import { useLocalSearchParams } from "expo-router";
import { Send } from "lucide-react-native";
import {
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
  type ListRenderItem,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useDiscussions, type Message } from "@/context/discussions";

export default function DiscussionDetailScreen() {
  const { discussionId } = useLocalSearchParams<{ discussionId: string }>();
  const { discussions, getDiscussionMessages, addMessage, currentUser } =
    useDiscussions();
  const insets = useSafeAreaInsets();
  const [inputText, setInputText] = useState("");
  const flatListRef = useRef<FlatList>(null);

  const discussion = discussions.find((d) => d.id === discussionId);
  const messages = getDiscussionMessages(discussionId || "");

  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages.length]);

  const handleSend = async () => {
    if (!inputText.trim() || !discussionId) return;

    const text = inputText.trim();
    setInputText("");

    await addMessage(discussionId, text);

    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  const formatTime = (date: string) => {
    const d = new Date(date);
    return d.toLocaleTimeString("fr-FR", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const renderItem: ListRenderItem<Message> = ({ item, index }) => {
    const isMe = item.userId === currentUser?.id;
    const prevMessage = index > 0 ? messages[index - 1] : null;
    const showName = !prevMessage || prevMessage.userId !== item.userId;

    return (
      <View
        style={[
          styles.messageContainer,
          isMe ? styles.messageContainerMe : styles.messageContainerOther,
        ]}
      >
        {showName && !isMe && (
          <Text style={styles.userName}>{item.userName}</Text>
        )}
        <View
          style={[
            styles.messageBubble,
            isMe ? styles.messageBubbleMe : styles.messageBubbleOther,
          ]}
        >
          <Text
            style={[
              styles.messageText,
              isMe ? styles.messageTextMe : styles.messageTextOther,
            ]}
          >
            {item.text}
          </Text>
          <Text
            style={[
              styles.messageTime,
              isMe ? styles.messageTimeMe : styles.messageTimeOther,
            ]}
          >
            {formatTime(item.createdAt)}
          </Text>
        </View>
      </View>
    );
  };

  if (!discussion) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Discussion introuvable</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.screen}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={100}
    >
      <View style={styles.header}>
        <Text style={styles.headerTitle} numberOfLines={1}>
          {discussion.title}
        </Text>
        <Text style={styles.headerSubtitle}>
          {discussion.userName} · {messages.length}{" "}
          {messages.length > 1 ? "messages" : "message"}
        </Text>
      </View>

      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.messagesContent}
        onContentSizeChange={() => {
          flatListRef.current?.scrollToEnd({ animated: false });
        }}
      />

      <View style={[styles.inputContainer, { paddingBottom: insets.bottom || 10 }]}>
        <TextInput
          style={styles.input}
          placeholder="Votre message..."
          value={inputText}
          onChangeText={setInputText}
          multiline
          maxLength={500}
          accessibilityRole="text"
          accessibilityLabel="Votre message"
        />
        <Pressable
          onPress={handleSend}
          style={[
            styles.sendBtn,
            !inputText.trim() && styles.sendBtnDisabled,
          ]}
          disabled={!inputText.trim()}
          accessibilityRole="button"
          accessibilityLabel="Envoyer le message"
          accessibilityState={{ disabled: !inputText.trim() }}
        >
          <Send color="#fff" size={20} />
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0,0,0,0.08)",
    backgroundColor: "#F9F9FB",
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#111",
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 13,
    color: "#666",
  },
  messagesContent: {
    padding: 16,
    gap: 12,
  },
  messageContainer: {
    maxWidth: "80%",
  },
  messageContainerMe: {
    alignSelf: "flex-end",
  },
  messageContainerOther: {
    alignSelf: "flex-start",
  },
  userName: {
    fontSize: 12,
    color: "#666",
    fontWeight: "600",
    marginBottom: 4,
    marginLeft: 12,
  },
  messageBubble: {
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  messageBubbleMe: {
    backgroundColor: "#4A90E2",
    borderBottomRightRadius: 4,
  },
  messageBubbleOther: {
    backgroundColor: "#F0F0F3",
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontSize: 15,
    lineHeight: 20,
    marginBottom: 4,
  },
  messageTextMe: {
    color: "#fff",
  },
  messageTextOther: {
    color: "#111",
  },
  messageTime: {
    fontSize: 11,
  },
  messageTimeMe: {
    color: "rgba(255,255,255,0.7)",
    textAlign: "right",
  },
  messageTimeOther: {
    color: "#999",
  },
  inputContainer: {
    flexDirection: "row",
    padding: 12,
    paddingTop: 10,
    gap: 10,
    borderTopWidth: 1,
    borderTopColor: "rgba(0,0,0,0.08)",
    backgroundColor: "#fff",
    alignItems: "flex-end",
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.1)",
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 15,
    backgroundColor: "#F9F9FB",
    maxHeight: 100,
  },
  sendBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#4A90E2",
    alignItems: "center",
    justifyContent: "center",
  },
  sendBtnDisabled: {
    opacity: 0.5,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  errorText: {
    fontSize: 16,
    color: "#999",
  },
});
