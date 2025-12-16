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
} from "react-native";
import { Send, Mic, MicOff, Sparkles, Cat, Heart, Stethoscope, Utensils, HelpCircle } from "lucide-react-native";
import { useRorkAgent, createRorkTool } from "@rork-ai/toolkit-sdk";
import { Audio } from "expo-av";
import * as Haptics from "expo-haptics";
import { z } from "zod";
import { Colors } from "@/constants/colors";
import { useCats } from "@/context/cats";
import { useReminders } from "@/context/reminders";

const QUICK_PROMPTS = [
  { icon: Heart, label: "Comportement", prompt: "Pourquoi mon chat ronronne-t-il ?" },
  { icon: Stethoscope, label: "Santé", prompt: "Quels sont les signes d'un chat malade ?" },
  { icon: Utensils, label: "Alimentation", prompt: "Quelle quantité de nourriture pour mon chat ?" },
  { icon: HelpCircle, label: "Conseil", prompt: "Comment jouer avec mon chat ?" },
];

export default function AssistantScreen() {
  const [input, setInput] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);
  const pulseAnim = useRef(new Animated.Value(1)).current;

  const { cats } = useCats();
  const { addReminder } = useReminders();

  const catsContext = cats.length > 0
    ? `L'utilisateur a ${cats.length} chat(s): ${cats.map(c => {
        const age = c.birthDate ? calculateAge(c.birthDate) : "âge inconnu";
        return `${c.name} (${age})`;
      }).join(", ")}.`
    : "L'utilisateur n'a pas encore enregistré de chats.";

  const { messages, error, sendMessage, setMessages } = useRorkAgent({
    tools: {
      createReminder: createRorkTool({
        description: "Créer un rappel pour le chat (vaccin, médicament, toilettage, etc.)",
        zodSchema: z.object({
          title: z.string().describe("Titre du rappel"),
          description: z.string().describe("Description détaillée").optional(),
          date: z.string().describe("Date du rappel au format ISO 8601"),
          catId: z.string().describe("ID du chat concerné").optional(),
        }),
        execute: async (params) => {
          console.log("Creating reminder:", params);
          await addReminder({
            id: `reminder-${Date.now()}`,
            title: params.title,
            description: params.description,
            dueDate: params.date,
            type: "other",
            frequency: "once",
            completed: false,
            createdAt: new Date().toISOString(),
          });
          return `Rappel "${params.title}" créé avec succès`;
        },
      }),
      getCatInfo: createRorkTool({
        description: "Obtenir des informations sur les chats de l'utilisateur",
        zodSchema: z.object({
          catName: z.string().describe("Nom du chat (optionnel)").optional(),
        }),
        execute: (params) => {
          if (params.catName) {
            const cat = cats.find(c => c.name.toLowerCase() === params.catName?.toLowerCase());
            if (cat) {
              const catInfo = {
                name: cat.name,
                age: cat.birthDate ? calculateAge(cat.birthDate) : "inconnu",
                weight: cat.weight || "non renseigné",
                recentLogs: (cat.dailyLogs || []).slice(-3),
              };
              return JSON.stringify(catInfo);
            }
            return `Aucun chat nommé ${params.catName} trouvé`;
          }
          const allCats = cats.map(c => ({
            name: c.name,
            age: c.birthDate ? calculateAge(c.birthDate) : "inconnu",
          }));
          return JSON.stringify({ totalCats: cats.length, cats: allCats });
        },
      }),
    },
  });

  const [isFirstMessage, setIsFirstMessage] = useState(true);
  const prevMessagesLength = useRef(messages.length);

  useEffect(() => {
    if (messages.length > prevMessagesLength.current) {
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
    prevMessagesLength.current = messages.length;
  }, [messages.length]);

  useEffect(() => {
    if (isRecording) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.2,
            duration: 500,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      pulseAnim.setValue(1);
    }
  }, [isRecording, pulseAnim]);

  const handleSend = useCallback(async (customMessage?: string) => {
    const messageText = customMessage || input.trim();
    if (!messageText) return;

    if (!customMessage) setInput("");
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    const systemPrompt = isFirstMessage
      ? `Tu es Purrly, un assistant IA spécialisé dans les chats, chaleureux et expert. ${catsContext}
         
Tu peux:
- Répondre aux questions sur la santé, le comportement, l'alimentation des chats
- Créer des rappels pour les soins (utilise l'outil createReminder)
- Consulter les infos des chats de l'utilisateur (utilise l'outil getCatInfo)

Réponds de manière concise, amicale et en français. Utilise des emojis occasionnellement 🐱

Question: ${messageText}`
      : messageText;

    setIsFirstMessage(false);
    await sendMessage(systemPrompt);
  }, [input, isFirstMessage, catsContext, sendMessage]);

  const startRecording = useCallback(async () => {
    if (Platform.OS === "web") {
      return;
    }

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
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
      });

      const uri = recording.getURI();
      setRecording(null);

      if (uri) {
        setIsTranscribing(true);
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

        const uriParts = uri.split(".");
        const fileType = uriParts[uriParts.length - 1];

        const formData = new FormData();
        formData.append("audio", {
          uri,
          name: `recording.${fileType}`,
          type: `audio/${fileType}`,
        } as unknown as Blob);
        formData.append("language", "fr");

        try {
          const response = await fetch("https://toolkit.rork.com/stt/transcribe/", {
            method: "POST",
            body: formData,
          });

          const data = await response.json();
          if (data.text) {
            setInput(data.text);
          }
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
  }, [recording]);

  const handleQuickPrompt = useCallback((prompt: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    handleSend(prompt);
  }, [handleSend]);

  const clearChat = useCallback(() => {
    setMessages([]);
    setIsFirstMessage(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  }, [setMessages]);

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
    >
      <ScrollView
        ref={scrollViewRef}
        style={styles.messagesContainer}
        contentContainerStyle={styles.messagesContent}
        keyboardShouldPersistTaps="handled"
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
                  {cats.length} chat{cats.length > 1 ? "s" : ""} enregistré{cats.length > 1 ? "s" : ""}
                </Text>
              </View>
            )}

            <Text style={styles.quickPromptsTitle}>Suggestions rapides</Text>
            <View style={styles.quickPromptsGrid}>
              {QUICK_PROMPTS.map((item, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.quickPromptCard}
                  onPress={() => handleQuickPrompt(item.prompt)}
                  activeOpacity={0.7}
                >
                  <View style={styles.quickPromptIcon}>
                    <item.icon color={Colors.primary} size={20} />
                  </View>
                  <Text style={styles.quickPromptLabel}>{item.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {messages.map((message) => (
          <View key={message.id}>
            {message.parts.map((part, index) => {
              if (part.type === "text") {
                return (
                  <View
                    key={`${message.id}-${index}`}
                    style={[
                      styles.messageBubble,
                      message.role === "user"
                        ? styles.userBubble
                        : styles.assistantBubble,
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
                        message.role === "user"
                          ? styles.userText
                          : styles.assistantText,
                      ]}
                    >
                      {part.text}
                    </Text>
                  </View>
                );
              }
              if (part.type === "tool") {
                const toolName = part.toolName;
                if (part.state === "output-available") {
                  return (
                    <View key={`${message.id}-${index}`} style={styles.toolResultBubble}>
                      <Text style={styles.toolResultText}>
                        ✅ {toolName === "createReminder" ? "Rappel créé" : "Information récupérée"}
                      </Text>
                    </View>
                  );
                }
                if (part.state === "input-streaming" || part.state === "input-available") {
                  return (
                    <View key={`${message.id}-${index}`} style={styles.toolLoadingBubble}>
                      <ActivityIndicator size="small" color={Colors.primary} />
                      <Text style={styles.toolLoadingText}>
                        {toolName === "createReminder" ? "Création du rappel..." : "Consultation des données..."}
                      </Text>
                    </View>
                  );
                }
              }
              return null;
            })}
          </View>
        ))}

        {error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>Erreur: {error.message}</Text>
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
          placeholder={isRecording ? "Écoute en cours..." : "Posez votre question..."}
          placeholderTextColor={Colors.textMuted}
          multiline
          maxLength={500}
          onSubmitEditing={() => handleSend()}
          blurOnSubmit={false}
          editable={!isRecording}
        />
        
        <TouchableOpacity
          style={[
            styles.sendButton,
            !input.trim() && styles.sendButtonDisabled,
          ]}
          onPress={() => handleSend()}
          disabled={!input.trim()}
        >
          <Send
            color={input.trim() ? "#fff" : Colors.textMuted}
            size={20}
          />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

function calculateAge(birthDate: string): string {
  const birth = new Date(birthDate);
  const now = new Date();
  const months = (now.getFullYear() - birth.getFullYear()) * 12 + (now.getMonth() - birth.getMonth());
  
  if (months < 12) {
    return `${months} mois`;
  }
  const years = Math.floor(months / 12);
  return `${years} an${years > 1 ? "s" : ""}`;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    padding: 16,
    gap: 12,
  },
  emptyState: {
    alignItems: "center" as const,
    paddingHorizontal: 24,
    marginTop: 40,
  },
  logoContainer: {
    marginBottom: 16,
  },
  logoCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: Colors.primaryMuted,
    justifyContent: "center" as const,
    alignItems: "center" as const,
  },
  emptyTitle: {
    fontSize: 28,
    fontWeight: "700" as const,
    color: Colors.text,
    marginBottom: 4,
  },
  emptySubtitle: {
    fontSize: 15,
    color: Colors.textSecondary,
    marginBottom: 16,
  },
  catsInfoBadge: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    backgroundColor: Colors.primaryMuted,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 6,
    marginBottom: 24,
  },
  catsInfoText: {
    fontSize: 13,
    fontWeight: "500" as const,
    color: Colors.primary,
  },
  quickPromptsTitle: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: Colors.textSecondary,
    marginBottom: 12,
    alignSelf: "flex-start" as const,
  },
  quickPromptsGrid: {
    flexDirection: "row" as const,
    flexWrap: "wrap" as const,
    gap: 10,
    width: "100%",
  },
  quickPromptCard: {
    width: "47%",
    backgroundColor: Colors.backgroundCard,
    borderRadius: 16,
    padding: 16,
    alignItems: "center" as const,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  quickPromptIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.primaryMuted,
    justifyContent: "center" as const,
    alignItems: "center" as const,
    marginBottom: 8,
  },
  quickPromptLabel: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: Colors.text,
  },
  messageBubble: {
    maxWidth: "85%",
    padding: 14,
    borderRadius: 20,
    marginVertical: 4,
  },
  userBubble: {
    alignSelf: "flex-end" as const,
    backgroundColor: Colors.primary,
    borderBottomRightRadius: 6,
  },
  assistantBubble: {
    alignSelf: "flex-start" as const,
    backgroundColor: Colors.backgroundCard,
    borderBottomLeftRadius: 6,
    borderWidth: 1,
    borderColor: Colors.border,
    flexDirection: "row" as const,
    gap: 10,
  },
  assistantAvatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.primary,
    justifyContent: "center" as const,
    alignItems: "center" as const,
    marginTop: 2,
  },
  messageText: {
    fontSize: 15,
    lineHeight: 22,
    flex: 1,
  },
  userText: {
    color: "#fff",
  },
  assistantText: {
    color: Colors.text,
  },
  toolResultBubble: {
    alignSelf: "flex-start" as const,
    backgroundColor: Colors.success + "20",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    marginVertical: 4,
  },
  toolResultText: {
    fontSize: 13,
    color: Colors.success,
    fontWeight: "500" as const,
  },
  toolLoadingBubble: {
    alignSelf: "flex-start" as const,
    backgroundColor: Colors.backgroundSecondary,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    marginVertical: 4,
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 8,
  },
  toolLoadingText: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  errorContainer: {
    backgroundColor: Colors.error + "15",
    padding: 12,
    borderRadius: 12,
    marginTop: 8,
  },
  errorText: {
    color: Colors.error,
    fontSize: 14,
  },
  clearButton: {
    alignSelf: "center" as const,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginBottom: 8,
  },
  clearButtonText: {
    fontSize: 13,
    color: Colors.primary,
    fontWeight: "500" as const,
  },
  inputContainer: {
    flexDirection: "row" as const,
    alignItems: "flex-end" as const,
    padding: 12,
    backgroundColor: Colors.backgroundCard,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    gap: 8,
  },
  voiceButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.primaryMuted,
    justifyContent: "center" as const,
    alignItems: "center" as const,
  },
  voiceButtonActive: {
    backgroundColor: Colors.error,
  },
  voiceButtonTranscribing: {
    backgroundColor: Colors.primary,
  },
  input: {
    flex: 1,
    backgroundColor: Colors.background,
    borderRadius: 22,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 15,
    maxHeight: 100,
    color: Colors.text,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.primary,
    justifyContent: "center" as const,
    alignItems: "center" as const,
  },
  sendButtonDisabled: {
    backgroundColor: Colors.backgroundSecondary,
  },
});
