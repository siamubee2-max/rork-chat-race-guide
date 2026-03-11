import React, { useState, useCallback, useRef, useMemo } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  View,
  Pressable,
  Animated,
  TextInput,
  Linking,
} from "react-native";
import { Stack } from "expo-router";
import { useTranslation } from "react-i18next";
import { ChevronDown, Search, MessageCircle, Mail } from "lucide-react-native";
import * as Haptics from "expo-haptics";
import { Colors } from "@/constants/colors";

interface FaqItem {
  question: string;
  answer: string;
}

function FaqAccordion({ item }: { item: FaqItem }) {
  const [expanded, setExpanded] = useState<boolean>(false);
  const rotation = useRef(new Animated.Value(0)).current;
  const heightAnim = useRef(new Animated.Value(0)).current;

  const toggle = useCallback(() => {
    try {
      void Haptics.selectionAsync();
    } catch {}
    const nextExpanded = !expanded;
    Animated.parallel([
      Animated.spring(rotation, {
        toValue: nextExpanded ? 1 : 0,
        useNativeDriver: true,
        tension: 100,
        friction: 8,
      }),
      Animated.timing(heightAnim, {
        toValue: nextExpanded ? 1 : 0,
        duration: 250,
        useNativeDriver: false,
      }),
    ]).start();
    setExpanded(nextExpanded);
  }, [expanded, rotation, heightAnim]);

  const rotate = rotation.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "180deg"],
  });

  return (
    <Pressable
      onPress={toggle}
      style={[styles.faqItem, expanded && styles.faqItemExpanded]}
    >
      <View style={styles.faqHeader}>
        <View style={styles.faqNumberBadge}>
          <MessageCircle color={Colors.primary} size={14} />
        </View>
        <Text style={styles.faqQuestion}>{item.question}</Text>
        <Animated.View style={{ transform: [{ rotate }] }}>
          <ChevronDown color={Colors.primary} size={20} />
        </Animated.View>
      </View>
      {expanded && <Text style={styles.faqAnswer}>{item.answer}</Text>}
    </Pressable>
  );
}

export default function FaqScreen() {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState<string>("");

  const faqItems: FaqItem[] = useMemo(
    () => [
      { question: t("legal.faq.q1"), answer: t("legal.faq.a1") },
      { question: t("legal.faq.q2"), answer: t("legal.faq.a2") },
      { question: t("legal.faq.q3"), answer: t("legal.faq.a3") },
      { question: t("legal.faq.q4"), answer: t("legal.faq.a4") },
      { question: t("legal.faq.q5"), answer: t("legal.faq.a5") },
      { question: t("legal.faq.q6"), answer: t("legal.faq.a6") },
      { question: t("legal.faq.q7"), answer: t("legal.faq.a7") },
      { question: t("legal.faq.q8"), answer: t("legal.faq.a8") },
    ],
    [t]
  );

  const filteredItems = useMemo(() => {
    if (!searchQuery.trim()) return faqItems;
    const query = searchQuery.toLowerCase();
    return faqItems.filter(
      (item) =>
        item.question.toLowerCase().includes(query) ||
        item.answer.toLowerCase().includes(query)
    );
  }, [faqItems, searchQuery]);

  const handleContactSupport = useCallback(async () => {
    try {
      await Haptics.selectionAsync();
    } catch {}
    void Linking.openURL("mailto:support@barkly.app");
  }, []);

  return (
    <View style={styles.screen}>
      <Stack.Screen options={{ title: t("legal.faqTitle") }} />
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.subtitle}>{t("legal.faq.subtitle")}</Text>

        <View style={styles.searchContainer}>
          <Search color={Colors.textMuted} size={18} />
          <TextInput
            style={styles.searchInput}
            placeholder={t("common.search")}
            placeholderTextColor={Colors.textMuted}
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoCorrect={false}
          />
        </View>

        {filteredItems.length === 0 ? (
          <View style={styles.emptyState}>
            <Search color={Colors.textMuted} size={32} />
            <Text style={styles.emptyText}>
              {t("common.notFound")}
            </Text>
          </View>
        ) : (
          filteredItems.map((item, index) => (
            <FaqAccordion key={index} item={item} />
          ))
        )}

        <View style={styles.contactSection}>
          <Text style={styles.contactTitle}>
            {t("legal.faq.q8")}
          </Text>
          <Pressable
            onPress={handleContactSupport}
            style={({ pressed }) => [
              styles.contactButton,
              pressed && { opacity: 0.8, transform: [{ scale: 0.98 }] },
            ]}
          >
            <Mail color="#fff" size={18} />
            <Text style={styles.contactButtonText}>
              support@barkly.app
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scroll: {
    flex: 1,
  },
  content: {
    padding: 24,
    paddingBottom: 80,
  },
  subtitle: {
    fontSize: 15,
    color: Colors.textSecondary,
    marginBottom: 20,
    lineHeight: 22,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.backgroundSecondary,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 24,
    gap: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: Colors.ivory,
    padding: 0,
  },
  faqItem: {
    backgroundColor: Colors.backgroundSecondary,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 12,
    padding: 18,
  },
  faqItemExpanded: {
    borderColor: "rgba(212, 160, 92, 0.3)",
  },
  faqHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  faqNumberBadge: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: Colors.primaryMuted,
    alignItems: "center",
    justifyContent: "center",
  },
  faqQuestion: {
    flex: 1,
    fontSize: 15,
    fontWeight: "700" as const,
    color: Colors.ivory,
    lineHeight: 22,
  },
  faqAnswer: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 22,
    marginTop: 14,
    paddingTop: 14,
    marginLeft: 44,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 48,
    gap: 12,
  },
  emptyText: {
    fontSize: 15,
    color: Colors.textMuted,
    fontWeight: "600" as const,
  },
  contactSection: {
    marginTop: 20,
    backgroundColor: Colors.backgroundSecondary,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 24,
    alignItems: "center",
    gap: 16,
  },
  contactTitle: {
    fontSize: 16,
    fontWeight: "700" as const,
    color: Colors.ivory,
    textAlign: "center",
  },
  contactButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 14,
    gap: 10,
  },
  contactButtonText: {
    fontSize: 15,
    fontWeight: "700" as const,
    color: "#0C0A09",
  },
});
