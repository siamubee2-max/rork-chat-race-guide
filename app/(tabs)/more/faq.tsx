import React, { useState, useCallback, useRef } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  View,
  Pressable,
  Animated,
} from "react-native";
import { Stack } from "expo-router";
import { useTranslation } from "react-i18next";
import { ChevronDown } from "lucide-react-native";
import * as Haptics from "expo-haptics";
import { Colors } from "@/constants/colors";

interface FaqItem {
  question: string;
  answer: string;
}

function FaqAccordion({ item, index }: { item: FaqItem; index: number }) {
  const [expanded, setExpanded] = useState<boolean>(false);
  const rotation = useRef(new Animated.Value(0)).current;

  const toggle = useCallback(() => {
    try { Haptics.selectionAsync(); } catch {}
    Animated.spring(rotation, {
      toValue: expanded ? 0 : 1,
      useNativeDriver: true,
      tension: 100,
      friction: 8,
    }).start();
    setExpanded((prev) => !prev);
  }, [expanded, rotation]);

  const rotate = rotation.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "180deg"],
  });

  return (
    <Pressable onPress={toggle} style={styles.faqItem}>
      <View style={styles.faqHeader}>
        <Text style={styles.faqQuestion}>{item.question}</Text>
        <Animated.View style={{ transform: [{ rotate }] }}>
          <ChevronDown color={Colors.primary} size={20} />
        </Animated.View>
      </View>
      {expanded && (
        <Text style={styles.faqAnswer}>{item.answer}</Text>
      )}
    </Pressable>
  );
}

export default function FaqScreen() {
  const { t } = useTranslation();

  const faqItems: FaqItem[] = [
    { question: t("legal.faq.q1"), answer: t("legal.faq.a1") },
    { question: t("legal.faq.q2"), answer: t("legal.faq.a2") },
    { question: t("legal.faq.q3"), answer: t("legal.faq.a3") },
    { question: t("legal.faq.q4"), answer: t("legal.faq.a4") },
    { question: t("legal.faq.q5"), answer: t("legal.faq.a5") },
    { question: t("legal.faq.q6"), answer: t("legal.faq.a6") },
    { question: t("legal.faq.q7"), answer: t("legal.faq.a7") },
    { question: t("legal.faq.q8"), answer: t("legal.faq.a8") },
  ];

  return (
    <View style={styles.screen}>
      <Stack.Screen options={{ title: t("legal.faqTitle") }} />
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.subtitle}>{t("legal.faq.subtitle")}</Text>
        {faqItems.map((item, index) => (
          <FaqAccordion key={index} item={item} index={index} />
        ))}
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
    paddingBottom: 60,
  },
  subtitle: {
    fontSize: 15,
    color: Colors.textMuted,
    marginBottom: 24,
    lineHeight: 22,
  },
  faqItem: {
    backgroundColor: Colors.backgroundSecondary,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 12,
    padding: 18,
  },
  faqHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
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
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
});
