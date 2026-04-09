import React, { useState } from "react";
import { router , useRouter } from "expo-router";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTranslation } from "react-i18next";

import { useDiscussions } from "@/context/discussions";

export default function NewDiscussionScreen() {
  const router = useRouter();
  const { createDiscussion } = useDiscussions();
  const insets = useSafeAreaInsets();
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [category, setCategory] = useState("general");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { t } = useTranslation();

  const CATEGORIES = [
    { id: "general", label: t("discussions.categories.general"), color: "#4A90E2" },
    { id: "health", label: t("discussions.categories.health"), color: "#E85D75" },
    { id: "behavior", label: t("discussions.categories.behavior"), color: "#9B59B6" },
    { id: "nutrition", label: t("discussions.categories.nutrition"), color: "#F39C12" },
    { id: "advice", label: t("discussions.categories.advice"), color: "#1ABC9C" },
  ];

  const handleSubmit = async () => {
    if (!title.trim() || !message.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await createDiscussion(title.trim(), category, message.trim());
      router.back();
    } catch (error) {
      console.error("Error creating discussion:", error);
      setIsSubmitting(false);
    }
  };

  const canSubmit = title.trim() && message.trim() && !isSubmitting;

  return (
    <KeyboardAvoidingView
      style={styles.screen}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={100}
    >
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <View style={styles.section}>
          <Text style={styles.label}>{t("discussions.category")}</Text>
          <View style={styles.categories}>
            {CATEGORIES.map((cat) => (
              <Pressable
                key={cat.id}
                onPress={() => setCategory(cat.id)}
                style={[
                  styles.categoryOption,
                  category === cat.id && {
                    backgroundColor: cat.color,
                    borderColor: cat.color,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.categoryOptionText,
                    category === cat.id && styles.categoryOptionTextActive,
                  ]}
                >
                  {cat.label}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>{t("discussions.titleLabel")}</Text>
          <TextInput
            style={styles.input}
            placeholder={t("discussions.titlePlaceholder")}
            value={title}
            onChangeText={setTitle}
            maxLength={100}
            autoFocus
          />
          <Text style={styles.hint}>{title.length}/100</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>{t("discussions.messageLabel")}</Text>
          <TextInput
            style={[styles.input, styles.inputMultiline]}
            placeholder={t("discussions.messagePlaceholder")}
            value={message}
            onChangeText={setMessage}
            multiline
            numberOfLines={6}
            textAlignVertical="top"
            maxLength={1000}
          />
          <Text style={styles.hint}>{message.length}/1000</Text>
        </View>
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: insets.bottom || 20 }]}>
        <Pressable
          onPress={handleSubmit}
          style={[styles.submitBtn, !canSubmit && styles.submitBtnDisabled]}
          disabled={!canSubmit}
        >
          <Text style={styles.submitBtnText}>
            {isSubmitting ? t("discussions.publishing") : t("discussions.publish")}
          </Text>
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
  container: {
    flex: 1,
  },
  content: {
    padding: 20,
  },
  section: {
    marginBottom: 24,
  },
  label: {
    fontSize: 15,
    fontWeight: "700",
    color: "#111",
    marginBottom: 12,
  },
  categories: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  categoryOption: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: "#F5F5F5",
    borderWidth: 2,
    borderColor: "transparent",
  },
  categoryOptionText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#666",
  },
  categoryOptionTextActive: {
    color: "#fff",
  },
  input: {
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.1)",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: "#F9F9FB",
  },
  inputMultiline: {
    minHeight: 120,
    paddingTop: 12,
  },
  hint: {
    fontSize: 12,
    color: "#999",
    marginTop: 8,
    textAlign: "right",
  },
  footer: {
    padding: 20,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "rgba(0,0,0,0.08)",
    backgroundColor: "#fff",
  },
  submitBtn: {
    backgroundColor: "#4A90E2",
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
  },
  submitBtnDisabled: {
    opacity: 0.5,
  },
  submitBtnText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
});
