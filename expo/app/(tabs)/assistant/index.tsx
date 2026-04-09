import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Animated,
  useWindowDimensions,
} from "react-native";
import { Send, Mic, MicOff, Sparkles, Cat } from "lucide-react-native";
import { Audio } from "expo-av";
import * as Haptics from "expo-haptics";
import * as FileSystem from "expo-file-system";
import { useTranslation } from "react-i18next";
import { Colors } from "@/constants/colors";
import { useCats } from "@/context/cats";
import { PremiumGate } from "@/components/PremiumGate";
import { useReminders } from "@/context/reminders";
import { trpc } from "@/lib/trpc";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
};

// ---------------------------------------------------------------------------
// Screen
// ---------------------------------------------------------------------------
export default function AssistantScreen() {
  const { t } = useTranslation();
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const { width } = useWindowDimensions();
  const isTablet = width >= 768;

  const { cats } = useCats();
  const { addReminder } = useReminders();

  // tRPC mutations
  const chatMutation = trpc.ai.chat.useMutation();
  const transcribeMutation = trpc.ai.transcribe.useMutation();

  const QUICK_PROMPTS = [
    t("assistant.quickPrompts.whyPurr"),
    t("assistant.quickPrompts.sickSigns"),
    t("assistant.quickPrompts.foodAmount"),
    t("assistant.quickPrompts.playWithCat"),
    t("assistant.quickPrompts.catNotEating"),
    t("assistant.quickPrompts.educateKitten"),
    t("assistant.quickPrompts.whenSterilize"),
    t("assistant.quickPrompts.scratching"),
  ];

  const systemPrompt = [
    "Tu es Purrly, un assistant IA expert en santé et bien-être félin. Réponds de manière concise, précise et amicale en français.",
    cats.length > 0
      ? `L'utilisateur a ${cats.length} chat(s): ${cats
          .map((c) => {
            const age = c.birthDate ? calculateAge(c.birthDate) : "âge inconnu";
            return `${c.name} (${age})`;
          })
          .join(", ")}.`
      : "L'utilisateur n'a pas encore de chats enregistrés.",
  ].join(" ");

  useEffect(() => {
    scrollViewRef.current?.scrollToEnd({ animated: true });
  }, [messages]);

  useEffect(() => {
    if (isRecording) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.2, duration: 500, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
        ])
      ).start();
    } else {
      pulseAnim.setValue(1);
    }
  }, [isRecording, pulseAnim]);

  const handleSend = useCallback(
    async (customMessage?: string) => {
      const text = (customMessage ?? input).trim();
      if (!text || isLoading) return;

      if (!customMessage) setInput("");
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

      const userMsg: Message = {
        id: `user-${Date.now()}`,
        role: "user",
        content: text,
      };
      const updated = [...messages, userMsg];
      setMessages(updated);
      setIsLoading(true);

      try {
        const result = await chatMutation.mutateAsync({
          messages: updated.map((m) => ({ role: m.role, content: m.content })),
          systemPrompt,
          model: "gpt-4o-mini",
        });

        setMessages((prev) => [
          ...prev,
          {
            id: `assistant-${Date.now()}`,
            role: "assistant",
            content: result.content,
          },
        ]);
      } catch (err) {
        console.error("Chat error:", err);
        setMessages((prev) => [
          ...prev,
          {
            id: `error-${Date.now()}`,
            role: "assistant",
            content: "Désolé, une erreur est survenue. Veuillez réessayer.",
          },
        ]);
      } finally {
        setIsLoading(false);
      }
    },
    [input, messages, isLoading, chatMutation, systemPrompt]
  );

  const startRecording = useCallback(async () => {
    if (Platform.OS === "web") return;
    try {
      await Audio.requestPermissionsAsync();
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });
      const { recording: newRecording } = await Audio.Recording.createAsync({
        android: {
          extension: ".m4a",
          outputFormat: Audio.AndroidOutputFormat.MPEG_4,
          audioEncoder: Audio.AndroidAudioEncoder.AAC,
          sampleRate: 44100,
          numberOfChannels: 1,
          bitRate: 128000,
        },
        ios: {
          extension: ".wav",
          outputFormat: Audio.IOSOutputFormat.LINEARPCM,
          audioQuality: Audio.IOSAudioQuality.HIGH,
          sampleRate: 44100,
          numberOfChannels: 1,
          bitRate: 128000,
          linearPCMBitDepth: 16,
          linearPCMIsBigEndian: false,
          linearPCMIsFloat: false,
        },
        web: {},
      });
      setRecording(newRecording);
      setIsRecording(true);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch (err) {
      console.error("Failed to start recording", err);
    }
  }, []);

  const stopRecording = useCallback(async () => {
    if (!recording) return;
    try {
      setIsRecording(false);
      await recording.stopAndUnloadAsync();
      await Audio.setAudioModeAsync({ allowsRecordingIOS: false });
      const uri = recording.getURI();
      setRecording(null);

      if (uri) {
        setIsTranscribing(true);
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        try {
          // Read file as base64 and send to tRPC Whisper endpoint
          const base64 = await FileSystem.readAsStringAsync(uri, {
            encoding: FileSystem.EncodingType.Base64,
          });
          const ext = uri.split(".").pop() ?? "m4a";
          const result = await transcribeMutation.mutateAsync({
            audioBase64: base64,
            mimeType: `audio/${ext}`,
            language: "fr",
          });
          if (result.text) setInput(result.text);
        } catch (err) {
          console.error("Transcription failed", err);
        } finally {
          setIsTranscribing(false);
        }
      }
    } catch (err) {
      console.error("Failed to stop recording", err);
      setIsRecording(false);
      setIsTranscribing(false);
    }
  }, [recording, transcribeMutation]);

  const clearChat = useCallback(() => {
    setMessages([]);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  }, []);

  return (
    <PremiumGate>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
      >
        <ScrollView
          ref={scrollViewRef}
          style={styles.messagesContainer}
          contentContainerStyle={styles.messagesContent}
          onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
          showsVerticalScrollIndicator={true}
        >
          {messages.length === 0 && (
            <View style={styles.emptyState}>
              <View style={styles.logoContainer}>
                <View style={styles.logoCircle}>
                  <Sparkles color={Colors.primary} size={32} />
                </View>
              </View>
              <Text style={styles.emptyTitle}>Purrly AI</Text>
              <Text style={styles.emptySubtitle}>Votre assistant félin intelligent</Text>

              {cats.length > 0 && (
                <View style={styles.catsInfoBadge}>
                  <Cat color={Colors.primary} size={16} />
                  <Text style={styles.catsInfoText}>
                    {cats.length} chat{cats.length > 1 ? "s" : ""} enregistré
                    {cats.length > 1 ? "s" : ""}
                  </Text>
                </View>
              )}

              <Text style={styles.quickPromptsTitle}>Questions courantes</Text>
              <View style={styles.quickPromptsList}>
                {QUICK_PROMPTS.map((question, index) => (
                  <TouchableOpacity
                    key={index}
                    style={styles.quickPromptItem}
                    onPress={() => handleSend(question)}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.quickPromptText}>{question}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          {messages.map((message) => (
            <View
              key={message.id}
              style={[
                styles.messageBubble,
                message.role === "user" ? styles.userBubble : styles.assistantBubble,
                !isTablet && styles.messageBubbleMobile,
              ]}
            >
              {message.role === "assistant" && (
                <View style={styles.assistantAvatar}>
                  <Sparkles color="#fff" size={12} />
                </View>
              )}
              <Text
                style={[
                  styles.messageText,
                  message.role === "user" ? styles.userText : styles.assistantText,
                ]}
              >
                {message.content}
              </Text>
            </View>
          ))}

          {isLoading && (
            <View style={[styles.messageBubble, styles.assistantBubble]}>
              <View style={styles.assistantAvatar}>
                <Sparkles color="#fff" size={12} />
              </View>
              <ActivityIndicator size="small" color={Colors.primary} />
            </View>
          )}
        </ScrollView>

        {messages.length > 0 && (
          <TouchableOpacity style={styles.clearButton} onPress={clearChat}>
            <Text style={styles.clearButtonText}>Nouvelle conversation</Text>
          </TouchableOpacity>
        )}

        <View style={styles.inputContainer}>
          {Platform.OS !== "web" && (
            <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
              <TouchableOpacity
                style={[
                  styles.voiceButton,
                  isRecording && styles.voiceButtonActive,
                  isTranscribing && styles.voiceButtonTranscribing,
                ]}
                onPress={isRecording ? stopRecording : startRecording}
                disabled={isTranscribing}
              >
                {isTranscribing ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : isRecording ? (
                  <MicOff color="#fff" size={20} />
                ) : (
                  <Mic color={Colors.primary} size={20} />
                )}
              </TouchableOpacity>
            </Animated.View>
          )}

          <TextInput
            style={styles.input}
            value={input}
            onChangeText={setInput}
            placeholder={isRecording ? "Écoute en cours..." : "Écrivez votre question..."}
            placeholderTextColor="#999999"
            multiline
            maxLength={500}
            editable={!isRecording && !isLoading}
          />

          <TouchableOpacity
            style={[styles.sendButton, (!input.trim() || isLoading) && styles.sendButtonDisabled]}
            onPress={() => handleSend()}
            disabled={!input.trim() || isLoading}
          >
            <Send color={input.trim() && !isLoading ? "#fff" : Colors.textMuted} size={20} />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </PremiumGate>
  );
}

function calculateAge(birthDate: string): string {
  const birth = new Date(birthDate);
  const now = new Date();
  const months =
    (now.getFullYear() - birth.getFullYear()) * 12 + (now.getMonth() - birth.getMonth());
  if (months < 12) return `${months} mois`;
  const years = Math.floor(months / 12);
  return `${years} an${years > 1 ? "s" : ""}`;
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  messagesContainer: { flex: 1 },
  messagesContent: { padding: 16, gap: 12, flexGrow: 1, paddingBottom: 24 },
  emptyState: { alignItems: "center" as const, paddingHorizontal: 24, marginTop: 40 },
  logoContainer: { marginBottom: 16 },
  logoCircle: {
    width: 72, height: 72, borderRadius: 36,
    backgroundColor: Colors.primaryMuted,
    justifyContent: "center" as const, alignItems: "center" as const,
  },
  emptyTitle: { fontSize: 28, fontWeight: "700" as const, color: Colors.text, marginBottom: 4 },
  emptySubtitle: { fontSize: 15, color: Colors.textSecondary, marginBottom: 16 },
  catsInfoBadge: {
    flexDirection: "row" as const, alignItems: "center" as const,
    backgroundColor: Colors.primaryMuted, paddingHorizontal: 12,
    paddingVertical: 6, borderRadius: 16, gap: 6, marginBottom: 24,
  },
  catsInfoText: { fontSize: 13, fontWeight: "500" as const, color: Colors.primary },
  quickPromptsTitle: {
    fontSize: 14, fontWeight: "600" as const, color: Colors.textSecondary,
    marginBottom: 12, alignSelf: "flex-start" as const,
  },
  quickPromptsList: { width: "100%", gap: 8 },
  quickPromptItem: {
    backgroundColor: Colors.backgroundCard, borderRadius: 12, padding: 14,
    borderWidth: 1, borderColor: Colors.border, alignItems: "flex-start" as const,
  },
  quickPromptText: { fontSize: 14, color: Colors.text, lineHeight: 20 },
  messageBubble: {
    maxWidth: "85%", padding: 14, borderRadius: 20,
    marginVertical: 4, flexShrink: 1,
  },
  messageBubbleMobile: { flexShrink: 1 },
  userBubble: {
    alignSelf: "flex-end" as const,
    backgroundColor: Colors.primary, borderBottomRightRadius: 6,
  },
  assistantBubble: {
    alignSelf: "flex-start" as const, backgroundColor: "#2C2826",
    borderBottomLeftRadius: 6, borderWidth: 2, borderColor: Colors.primary,
    flexDirection: "row" as const, alignItems: "flex-start" as const,
    gap: 10, flexShrink: 1,
  },
  assistantAvatar: {
    width: 24, height: 24, borderRadius: 12, backgroundColor: Colors.primary,
    justifyContent: "center" as const, alignItems: "center" as const, marginTop: 2,
  },
  messageText: { fontSize: 16, lineHeight: 24, flexShrink: 1, fontWeight: "500" as const },
  userText: { color: "#000000", fontWeight: "700" as const },
  assistantText: { color: "#FFFFFF", fontWeight: "600" as const },
  clearButton: { alignSelf: "center" as const, paddingHorizontal: 16, paddingVertical: 8, marginBottom: 8 },
  clearButtonText: { fontSize: 13, color: Colors.primary, fontWeight: "500" as const },
  inputContainer: {
    flexDirection: "row" as const, alignItems: "flex-end" as const,
    padding: 12, backgroundColor: Colors.backgroundCard,
    borderTopWidth: 1, borderTopColor: Colors.border, gap: 8,
  },
  voiceButton: {
    width: 44, height: 44, borderRadius: 22, backgroundColor: Colors.primaryMuted,
    justifyContent: "center" as const, alignItems: "center" as const,
  },
  voiceButtonActive: { backgroundColor: Colors.error },
  voiceButtonTranscribing: { backgroundColor: Colors.primary },
  input: {
    flex: 1, backgroundColor: "#FFFFFF", borderRadius: 22,
    paddingHorizontal: 16, paddingVertical: 12, fontSize: 16,
    maxHeight: 100, color: "#000000", borderWidth: 2,
    borderColor: Colors.primary, fontWeight: "500" as const,
  },
  sendButton: {
    width: 44, height: 44, borderRadius: 22, backgroundColor: Colors.primary,
    justifyContent: "center" as const, alignItems: "center" as const,
  },
  sendButtonDisabled: { backgroundColor: Colors.backgroundSecondary },
});
