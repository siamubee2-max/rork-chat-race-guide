import React from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { Stack } from "expo-router";
import { useTranslation } from "react-i18next";
import { Colors } from "@/constants/colors";

export default function PrivacyPolicyScreen() {
  const { t } = useTranslation();

  const sections = [
    { title: t("legal.privacy.dataCollection"), body: t("legal.privacy.dataCollectionText") },
    { title: t("legal.privacy.dataUsage"), body: t("legal.privacy.dataUsageText") },
    { title: t("legal.privacy.dataStorage"), body: t("legal.privacy.dataStorageText") },
    { title: t("legal.privacy.thirdParty"), body: t("legal.privacy.thirdPartyText") },
    { title: t("legal.privacy.cookies"), body: t("legal.privacy.cookiesText") },
    { title: t("legal.privacy.rights"), body: t("legal.privacy.rightsText") },
    { title: t("legal.privacy.children"), body: t("legal.privacy.childrenText") },
    { title: t("legal.privacy.changes"), body: t("legal.privacy.changesText") },
    { title: t("legal.privacy.contact"), body: t("legal.privacy.contactText") },
  ];

  return (
    <View style={styles.screen}>
      <Stack.Screen options={{ title: t("legal.privacyPolicy") }} />
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.lastUpdated}>{t("legal.lastUpdated")}: 2026-02-05</Text>
        <Text style={styles.intro}>{t("legal.privacy.intro")}</Text>

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
