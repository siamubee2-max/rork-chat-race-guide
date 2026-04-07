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
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useSocial, type DirectMessage } from "@/context/social";
import { useAuth } from "@/context/auth";
import { Colors } from "@/constants/colors";

export default function ChatScreen() {
  const { conversationId } = useLocalSearchParams<{ conversationId: string }>();
  const { conversations, getConversationMessages, sendMessage } = useSocial();
  const { currentUser } = useAuth();
  const insets = useSafeAreaInsets();
  const [messageText, setMessageText] = useState("");
  const flatListRef = useRef<FlatList>(null);

  const conversation = conversations.find(c => c.id === conversationId);
  const messages = getConversationMessages(conversationId || "");
  
  const otherUserId = conversation?.participants.find(p => p !== currentUser?.id) || "";
  const otherUserName = conversation?.participantNames[otherUserId] || "Utilisateur";

  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages.length]);

  const handleSend = async () => {
    if (!messageText.trim() || !currentUser) return;

    const text = messageText.trim();
    setMessageText("");

    await sendMessage(otherUserId, otherUserName, text);

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

  const renderMessage = ({ item, index }: { item: DirectMessage; index: number }) => {
    const isMe = item.senderId === currentUser?.id;
    const prevMessage = index > 0 ? messages[index - 1] : null;
    const showTime = !prevMessage || 
      new Date(item.createdAt).getTime() - new Date(prevMessage.createdAt).getTime() > 5 * 60 * 1000;

    return (
      <View>
        {showTime && (
          <Text style={styles.timeLabel}>{formatTime(item.createdAt)}</Text>
        )}
        <View
          style={[
            styles.messageContainer,
            isMe ? styles.messageContainerMe : styles.messageContainerOther,
          ]}
        >
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
          </View>
        </View>
      </View>
    );
  };

  const EmptyChat = () => (
    <View style={styles.emptyContainer}>
      <View style={styles.emptyAvatar}>
        <Text style={styles.emptyAvatarText}>
          {otherUserName.charAt(0).toUpperCase()}
        </Text>
      </View>
      <Text style={styles.emptyTitle}>{otherUserName}</Text>
      <Text style={styles.emptyText}>
        Démarrez une conversation avec {otherUserName}
      </Text>
    </View>
  );

  return (
    <KeyboardAvoidingView
      style={styles.screen}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={100}
    >
      <View style={styles.header}>
        <View style={styles.headerAvatar}>
          <Text style={styles.headerAvatarText}>
            {otherUserName.charAt(0).toUpperCase()}
          </Text>
        </View>
        <Text style={styles.headerName}>{otherUserName}</Text>
      </View>

      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={renderMessage}
        contentContainerStyle={[
          styles.messagesContent,
          messages.length === 0 && styles.messagesContentEmpty,
        ]}
        ListEmptyComponent={EmptyChat}
        onContentSizeChange={() => {
          if (messages.length > 0) {
            flatListRef.current?.scrollToEnd({ animated: false });
          }
        }}
      />

      <View style={[styles.inputContainer, { paddingBottom: insets.bottom || 12 }]}>
        <TextInput
          style={styles.input}
          placeholder="Votre message..."
          placeholderTextColor={Colors.textMuted}
          value={messageText}
          onChangeText={setMessageText}
          multiline
          maxLength={500}
          accessibilityRole="text"
          accessibilityLabel="Votre message"
        />
        <Pressable
          style={[styles.sendBtn, !messageText.trim() && styles.sendBtnDisabled]}
          onPress={handleSend}
          disabled={!messageText.trim()}
          accessibilityRole="button"
          accessibilityLabel="Envoyer le message"
          accessibilityState={{ disabled: !messageText.trim() }}
        >
          <Send size={20} color="#fff" />
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    backgroundColor: Colors.backgroundCard,
  },
  headerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.primaryLight,
    alignItems: "center",
    justifyContent: "center",
  },
  headerAvatarText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#fff",
  },
  headerName: {
    fontSize: 17,
    fontWeight: "700",
    color: Colors.text,
  },
  messagesContent: {
    padding: 16,
    gap: 4,
  },
  messagesContentEmpty: {
    flex: 1,
    justifyContent: "center",
  },
  timeLabel: {
    fontSize: 12,
    color: Colors.textMuted,
    textAlign: "center",
    marginVertical: 12,
  },
  messageContainer: {
    maxWidth: "80%",
    marginVertical: 2,
  },
  messageContainerMe: {
    alignSelf: "flex-end",
  },
  messageContainerOther: {
    alignSelf: "flex-start",
  },
  messageBubble: {
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  messageBubbleMe: {
    backgroundColor: Colors.primary,
    borderBottomRightRadius: 4,
  },
  messageBubbleOther: {
    backgroundColor: Colors.backgroundCard,
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  messageText: {
    fontSize: 15,
    lineHeight: 20,
  },
  messageTextMe: {
    color: "#fff",
  },
  messageTextOther: {
    color: Colors.text,
  },
  emptyContainer: {
    alignItems: "center",
    padding: 32,
  },
  emptyAvatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.primaryLight,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  emptyAvatarText: {
    fontSize: 32,
    fontWeight: "700",
    color: "#fff",
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: Colors.text,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 15,
    color: Colors.textMuted,
    textAlign: "center",
  },
  inputContainer: {
    flexDirection: "row",
    padding: 12,
    gap: 10,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    backgroundColor: Colors.background,
    alignItems: "flex-end",
  },
  input: {
    flex: 1,
    backgroundColor: Colors.backgroundCard,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 15,
    color: Colors.text,
    maxHeight: 100,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  sendBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  sendBtnDisabled: {
    opacity: 0.5,
  },
});
