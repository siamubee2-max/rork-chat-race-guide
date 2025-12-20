import React from "react";
import { router } from "expo-router";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Check } from "lucide-react-native";
import { useTranslation } from "react-i18next";
import { useLanguage } from "@/context/language";
import { languages } from "@/i18n/translations";

export default function LanguageSelectorModal() {
  const { t } = useTranslation();
  const { currentLanguage, changeLanguage } = useLanguage();

  const handleLanguageSelect = async (langCode: string) => {
    await changeLanguage(langCode);
    router.back();
  };

  return (
    <View style={styles.screen}>
      <View style={styles.header}>
        <Text style={styles.title}>{t("modal.chooseLanguage")}</Text>
        <Pressable
          onPress={() => router.back()}
          style={styles.closeBtn}
        >
          <Text style={styles.closeBtnText}>{t("common.close")}</Text>
        </Pressable>
      </View>

      <ScrollView 
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {languages.map((lang) => {
          const isSelected = currentLanguage === lang.code;
          return (
            <Pressable
              key={lang.code}
              onPress={() => handleLanguageSelect(lang.code)}
              style={({ pressed }) => [
                styles.langItem,
                isSelected && styles.langItemSelected,
                pressed && { opacity: 0.7 },
              ]}
            >
              <Text style={styles.flag}>{lang.flag}</Text>
              <Text style={[styles.langName, isSelected && styles.langNameSelected]}>
                {lang.name}
              </Text>
              {isSelected && (
                <Check 
                  color="#111" 
                  size={20} 
                  strokeWidth={3}
                />
              )}
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0,0,0,0.08)",
  },
  title: {
    fontSize: 22,
    fontWeight: "900",
    letterSpacing: -0.3,
    color: "rgba(0,0,0,0.95)",
  },
  closeBtn: {
    width: 32,
    height: 32,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 16,
    backgroundColor: "rgba(0,0,0,0.06)",
  },
  closeBtnText: {
    fontSize: 18,
    color: "rgba(0,0,0,0.7)",
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    gap: 8,
  },
  langItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 14,
    backgroundColor: "#F6F7FB",
    borderWidth: 2,
    borderColor: "transparent",
  },
  langItemSelected: {
    backgroundColor: "rgba(0,0,0,0.04)",
    borderColor: "#111",
  },
  flag: {
    fontSize: 28,
  },
  langName: {
    flex: 1,
    fontSize: 16,
    fontWeight: "600",
    color: "rgba(0,0,0,0.75)",
  },
  langNameSelected: {
    fontWeight: "800",
    color: "rgba(0,0,0,0.95)",
  },
});
