import React from "react";
import { router , useRouter } from "expo-router";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Check, X } from "lucide-react-native";
import { useLanguage } from "@/context/language";
import { languages } from "@/i18n/translations";
import { Colors } from "@/constants/colors";

export default function LanguageSelectorModal() {
  const router = useRouter();
  const { currentLanguage, changeLanguage } = useLanguage();

  const handleLanguageSelect = async (langCode: string) => {
    await changeLanguage(langCode);
    router.back();
  };

  return (
    <View style={styles.screen}>
      <View style={styles.header}>
        <Text style={styles.title}>Langue</Text>
        <Pressable
          onPress={() => router.back()}
          style={styles.closeBtn}
        >
          <X color={Colors.textSecondary} size={18} />
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
                  color={Colors.primary} 
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
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  title: {
    fontSize: 22,
    fontWeight: "900" as const,
    letterSpacing: -0.3,
    color: Colors.text,
  },
  closeBtn: {
    width: 32,
    height: 32,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 16,
    backgroundColor: Colors.backgroundCard,
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
    backgroundColor: Colors.backgroundCard,
    borderWidth: 2,
    borderColor: "transparent",
  },
  langItemSelected: {
    backgroundColor: Colors.primaryMuted,
    borderColor: Colors.primary,
  },
  flag: {
    fontSize: 28,
  },
  langName: {
    flex: 1,
    fontSize: 16,
    fontWeight: "600" as const,
    color: Colors.textSecondary,
  },
  langNameSelected: {
    fontWeight: "800" as const,
    color: Colors.primary,
  },
});
