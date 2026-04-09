import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Animated,
} from 'react-native';
import { router , useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Check, Globe, Sparkles } from 'lucide-react-native';
import { Colors } from '@/constants/colors';
import { useLanguage } from '@/context/language';
import { languages } from '@/i18n/translations';

export default function LanguageSelectScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { currentLanguage, changeLanguage } = useLanguage();
  const [selectedLang, setSelectedLang] = useState<string>(currentLanguage);
  const [scaleAnim] = useState(new Animated.Value(1));

  const handleSelect = useCallback((code: string) => {
    console.log('[LanguageSelect] selected', code);
    setSelectedLang(code);
    
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
  }, [scaleAnim]);

  const handleConfirm = useCallback(async () => {
    console.log('[LanguageSelect] confirming', selectedLang);
    await changeLanguage(selectedLang, true);
    router.replace('/');
  }, [selectedLang, changeLanguage]);

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[Colors.primary, Colors.primaryMuted, Colors.background]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={styles.gradient}
      />
      
      <View style={[styles.safeArea, { paddingTop: insets.top }]}>
        <View style={styles.header}>
          <View style={styles.iconContainer}>
            <Globe color="#fff" size={32} />
          </View>
          <Text style={styles.title}>Choose your language</Text>
          <Text style={styles.subtitle}>Choisissez votre langue</Text>
        </View>

        <View style={styles.card}>
          <ScrollView 
            style={styles.scroll}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {languages.map((lang) => {
              const isSelected = selectedLang === lang.code;
              return (
                <Pressable
                  key={lang.code}
                  onPress={() => handleSelect(lang.code)}
                  style={({ pressed }) => [
                    styles.langItem,
                    isSelected && styles.langItemSelected,
                    pressed && styles.langItemPressed,
                  ]}
                  testID={`lang-${lang.code}`}
                >
                  <Text style={styles.flag}>{lang.flag}</Text>
                  <Text style={[
                    styles.langName,
                    isSelected && styles.langNameSelected,
                  ]}>
                    {lang.name}
                  </Text>
                  {isSelected && (
                    <View style={styles.checkContainer}>
                      <Check color="#fff" size={16} />
                    </View>
                  )}
                </Pressable>
              );
            })}
          </ScrollView>
        </View>

        <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 20) }]}>
          <Animated.View style={{ transform: [{ scale: scaleAnim }], width: '100%' }}>
            <Pressable
              onPress={handleConfirm}
              style={({ pressed }) => [
                styles.confirmButton,
                pressed && styles.confirmButtonPressed,
              ]}
              testID="confirm-language"
            >
              <Sparkles color="#fff" size={20} />
              <Text style={styles.confirmText}>
                {selectedLang === 'fr' ? 'Continuer' : 
                 selectedLang === 'es' ? 'Continuar' :
                 selectedLang === 'de' ? 'Weiter' :
                 selectedLang === 'it' ? 'Continua' :
                 selectedLang === 'pt' ? 'Continuar' :
                 selectedLang === 'ru' ? 'Продолжить' :
                 selectedLang === 'ar' ? 'متابعة' :
                 selectedLang === 'zh' ? '继续' :
                 selectedLang === 'ja' ? '続ける' :
                 'Continue'}
              </Text>
            </Pressable>
          </Animated.View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  gradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 300,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    alignItems: 'center',
    paddingTop: 20,
    paddingBottom: 24,
  },
  iconContainer: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  title: {
    fontSize: 28,
    fontWeight: '800' as const,
    color: '#fff',
    marginBottom: 6,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.85)',
    textAlign: 'center',
  },
  card: {
    flex: 1,
    backgroundColor: Colors.background,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    marginTop: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
    overflow: 'hidden',
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 100,
  },
  langItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 18,
    backgroundColor: Colors.backgroundCard,
    borderRadius: 16,
    marginBottom: 10,
    borderWidth: 2,
    borderColor: Colors.border,
  },
  langItemSelected: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primaryMuted,
  },
  langItemPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.98 }],
  },
  flag: {
    fontSize: 28,
    marginRight: 14,
  },
  langName: {
    flex: 1,
    fontSize: 17,
    fontWeight: '600' as const,
    color: Colors.text,
  },
  langNameSelected: {
    color: Colors.primary,
    fontWeight: '700' as const,
  },
  checkContainer: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
    paddingTop: 20,
    backgroundColor: Colors.background,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  confirmButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: Colors.primary,
    paddingVertical: 18,
    borderRadius: 20,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 6,
  },
  confirmButtonPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.98 }],
  },
  confirmText: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: '#fff',
  },
});
