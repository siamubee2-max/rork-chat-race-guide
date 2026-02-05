import React from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { Stack } from "expo-router";
import { useTranslation } from "react-i18next";
import { Colors } from "@/constants/colors";

export default function TermsScreen() {
  const { t } = useTranslation();

  const sections = [
    { title: t("legal.terms.acceptance"), body: t("legal.terms.acceptanceText") },
    { title: t("legal.terms.description"), body: t("legal.terms.descriptionText") },
    { title: t("legal.terms.account"), body: t("legal.terms.accountText") },
    { title: t("legal.terms.usage"), body: t("legal.terms.usageText") },
    { title: t("legal.terms.content"), body: t("legal.terms.contentText") },
    { title: t("legal.terms.intellectual"), body: t("legal.terms.intellectualText") },
    { title: t("legal.terms.liability"), body: t("legal.terms.liabilityText") },
    { title: t("legal.terms.termination"), body: t("legal.terms.terminationText") },
    { title: t("legal.terms.governing"), body: t("legal.terms.governingText") },
  ];

  return (
    <View style={styles.screen}>
      <Stack.Screen options={{ title: t("legal.termsOfUse") }} />
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.lastUpdated}>{t("legal.lastUpdated")}: 2026-02-05</Text>
        <Text style={styles.intro}>{t("legal.terms.intro")}</Text>

        {sections.map((section, index) => (
          <View key={index} style={styles.section}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            <Text style={styles.sectionBody}>{section.body}</Text>
          </View>
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
  lastUpdated: {
    fontSize: 12,
    color: Colors.textMuted,
    marginBottom: 16,
  },
  intro: {
    fontSize: 15,
    color: Colors.textSecondary,
    lineHeight: 22,
    marginBottom: 28,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: "800" as const,
    color: Colors.ivory,
    marginBottom: 8,
  },
  sectionBody: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 22,
  },
});
