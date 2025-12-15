import { useCallback } from "react";
import { router } from "expo-router";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import * as Haptics from "expo-haptics";
import * as ImagePicker from "expo-image-picker";
import { Camera, Sparkles, Upload, Info } from "lucide-react-native";
import {
  Alert,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTranslation } from "react-i18next";
import { Colors } from "@/constants/colors";
import { useScanImage } from "@/context/scan-image";

const heroImageUri =
  "https://images.unsplash.com/photo-1495360010541-f48722b34f7d?auto=format&fit=crop&w=1200&q=80";

export default function ScanHomeScreen() {
  const { t } = useTranslation();
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const heroH = Math.max(260, Math.min(360, Math.round(width * 0.75))) + insets.top;
  const { setImage } = useScanImage();

  const pickImage = useCallback(async () => {
    try {
      await Haptics.selectionAsync();
    } catch {}

    const permissionResult =
      await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permissionResult.granted) {
      Alert.alert(
        t('scan.permissionDenied'),
        t('scan.galleryPermissionText'),
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: "images" as const,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.4,
      base64: true,
      exif: false,
    });

    if (!result.canceled && result.assets[0]) {
      const asset = result.assets[0];
      if (asset.base64) {
        console.log('Setting image from gallery, base64 length:', asset.base64.length);
        setImage(asset.uri, asset.base64);
        router.push("/(tabs)/(scan)/result" as any);
      } else {
        Alert.alert(t('scan.error'), t('scan.imageProcessingError'));
      }
    }
  }, [t, setImage]);

  const takePhoto = useCallback(async () => {
    try {
      await Haptics.selectionAsync();
    } catch {}

    if (Platform.OS === "web") {
      Alert.alert(
        t('scan.notAvailableWeb'),
        t('scan.cameraNotAvailableWeb'),
      );
      return;
    }

    const permissionResult = await ImagePicker.requestCameraPermissionsAsync();

    if (!permissionResult.granted) {
      Alert.alert(
        t('scan.permissionDenied'),
        t('scan.cameraPermissionText'),
      );
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.4,
      base64: true,
      exif: false,
    });

    if (!result.canceled && result.assets[0]) {
      const asset = result.assets[0];
      if (asset.base64) {
        console.log('Setting image from camera, base64 length:', asset.base64.length);
        setImage(asset.uri, asset.base64);
        router.push("/(tabs)/(scan)/result" as any);
      } else {
        Alert.alert(t('scan.error'), t('scan.imageProcessingError'));
      }
    }
  }, [t, setImage]);

  const onAbout = useCallback(() => {
    router.push("/modal");
  }, []);

  return (
    <View style={styles.screen} testID="scanScreen">
      <View style={[styles.hero, { height: heroH }]} testID="scanHero">
        <Image
          source={{ uri: heroImageUri }}
          style={styles.heroImage}
          contentFit="cover"
          transition={120}
        />
        <LinearGradient
          colors={["rgba(61, 46, 36, 0.05)", "rgba(61, 46, 36, 0.8)"]}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 1 }}
          style={styles.heroGradient}
        />

        <View style={[styles.heroTopRow, { top: insets.top + 12 }]}>
          <View style={styles.brandPill}>
            <Sparkles color="#fff" size={14} />
            <Text style={styles.brandText}>CatID</Text>
          </View>
          <Pressable
            onPress={onAbout}
            style={({ pressed }) => [
              styles.aboutBtn,
              pressed ? { opacity: 0.8 } : null,
            ]}
            testID="scanAbout"
          >
            <Info color="#fff" size={16} />
            <Text style={styles.aboutBtnText}>{t('scan.about')}</Text>
          </Pressable>
        </View>

        <View style={styles.heroCopy}>
          <Text style={styles.heroTitle}>{t('scan.title')}</Text>
          <Text style={styles.heroSubtitle}>
            {t('scan.subtitle')}
          </Text>
        </View>
      </View>

      <View style={styles.content}>
        <View style={styles.card}>
          <View style={styles.cardIcon}>
            <Sparkles color={Colors.primary} size={18} />
          </View>
          <View style={styles.cardBody}>
            <Text style={styles.cardTitle}>{t('scan.recognitionTitle')}</Text>
            <Text style={styles.cardText}>
              {t('scan.recognitionText')}
            </Text>
          </View>
        </View>

        <Pressable
          onPress={takePhoto}
          style={({ pressed }) => [
            styles.primaryBtn,
            pressed ? { transform: [{ scale: 0.98 }], opacity: 0.9 } : null,
          ]}
          testID="scanTakePhoto"
        >
          <Camera color="#fff" size={20} />
          <Text style={styles.primaryBtnText}>{t('scan.takePhoto')}</Text>
        </Pressable>

        <Pressable
          onPress={pickImage}
          style={({ pressed }) => [
            styles.secondaryBtn,
            pressed ? { transform: [{ scale: 0.98 }] } : null,
          ]}
          testID="scanPickImage"
        >
          <Upload color={Colors.primary} size={20} />
          <Text style={styles.secondaryBtnText}>{t('scan.choosePhoto')}</Text>
        </Pressable>

        <View style={styles.tipRow}>
          <View style={styles.tipBadge}>
            <Text style={styles.tipLabel}>{t('scan.tip')}</Text>
          </View>
          <Text style={styles.tipText}>
            {t('scan.tipText')}
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  hero: {
    position: "relative",
    overflow: "hidden",
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
  },
  heroImage: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  heroGradient: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  heroTopRow: {
    position: "absolute",
    left: 16,
    right: 16,
    top: 16, // overridden by inline style
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  brandPill: {
    flexDirection: "row",
    gap: 6,
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: "rgba(212, 119, 92, 0.9)",
  },
  brandText: {
    color: "#fff",
    fontWeight: "800",
    fontSize: 13,
    letterSpacing: 0.3,
  },
  aboutBtn: {
    flexDirection: "row",
    gap: 6,
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.2)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.3)",
  },
  aboutBtnText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 13,
  },
  heroCopy: {
    position: "absolute",
    left: 18,
    right: 18,
    bottom: 20,
  },
  heroTitle: {
    color: "#fff",
    fontSize: 28,
    fontWeight: "900",
    letterSpacing: -0.4,
  },
  heroSubtitle: {
    marginTop: 8,
    color: "rgba(255,255,255,0.9)",
    fontSize: 15,
    lineHeight: 21,
    maxWidth: 520,
  },
  content: {
    flex: 1,
    padding: 18,
    gap: 14,
  },
  card: {
    flexDirection: "row",
    gap: 14,
    borderRadius: 18,
    padding: 16,
    backgroundColor: Colors.backgroundCard,
    borderWidth: 1,
    borderColor: Colors.border,
    shadowColor: Colors.text,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  cardIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: Colors.primaryMuted,
    alignItems: "center",
    justifyContent: "center",
  },
  cardBody: {
    flex: 1,
  },
  cardTitle: {
    fontWeight: "800",
    fontSize: 15,
    color: Colors.text,
  },
  cardText: {
    marginTop: 4,
    color: Colors.textSecondary,
    lineHeight: 19,
    fontSize: 14,
  },
  primaryBtn: {
    flexDirection: "row",
    gap: 10,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    borderRadius: 18,
    backgroundColor: Colors.primary,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  primaryBtnText: {
    color: "#fff",
    fontWeight: "800",
    fontSize: 16,
  },
  secondaryBtn: {
    flexDirection: "row",
    gap: 10,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    borderRadius: 18,
    backgroundColor: Colors.backgroundCard,
    borderWidth: 1.5,
    borderColor: Colors.primaryMuted,
  },
  secondaryBtnText: {
    color: Colors.primary,
    fontWeight: "800",
    fontSize: 16,
  },
  tipRow: {
    flexDirection: "row",
    gap: 12,
    alignItems: "flex-start",
    marginTop: 4,
    padding: 14,
    backgroundColor: Colors.accentMuted,
    borderRadius: 14,
  },
  tipBadge: {
    backgroundColor: Colors.accent,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  tipLabel: {
    fontSize: 12,
    fontWeight: "800",
    color: "#fff",
  },
  tipText: {
    flex: 1,
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 18,
  },
});
