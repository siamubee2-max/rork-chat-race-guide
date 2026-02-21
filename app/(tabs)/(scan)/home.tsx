import { useCallback } from "react";
import { router } from "expo-router";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import * as Haptics from "expo-haptics";
import * as ImagePicker from "expo-image-picker";
import { Sparkles, Upload, Info, Crown, Video } from "lucide-react-native";
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
        Alert.alert(t('common.error'), t('scan.imageProcessingError'));
      }
    }
  }, [t, setImage]);



  const openLiveCamera = useCallback(async () => {
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
    router.push("/(tabs)/(scan)/camera" as any);
  }, [t]);

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
          cachePolicy="memory-disk"
          transition={300}
        />
        <LinearGradient
          colors={["transparent", "rgba(12,10,9,0.3)", "#0C0A09"]}
          style={styles.heroGradient}
        />

        <View style={[styles.heroTopRow, { top: insets.top + 16 }]}>
          <View style={styles.brandPill}>
            <Crown color={Colors.primary} size={16} />
            <Text style={styles.brandText}>{t("scan.luxeEdition")}</Text>
          </View>
          <Pressable
            onPress={onAbout}
            style={({ pressed }) => [
              styles.aboutBtn,
              pressed && { opacity: 0.7 },
            ]}
          >
            <Info color={Colors.ivory} size={20} />
          </Pressable>
        </View>

        <View style={styles.heroCopy}>
          <Text style={styles.preTitle}>{t("scan.aiTitle")}</Text>
          <Text style={styles.heroTitle}>{t("scan.heroTitle")}</Text>
        </View>
      </View>

      <View style={styles.content}>
        <View style={styles.mainActions}>
          <Pressable
            onPress={openLiveCamera}
            style={({ pressed }) => [
              styles.actionCard,
              styles.primaryAction,
              pressed && { transform: [{ scale: 0.98 }] },
            ]}
          >
            <View style={styles.actionIconCircle}>
              <Video color="#0C0A09" size={28} />
            </View>
            <Text style={styles.actionTitleLight}>{t("scan.liveCamera") || "Caméra en direct"}</Text>
            <Text style={styles.actionSubtitleLight}>{t("scan.liveCameraDesc") || "Scanner en temps réel"}</Text>
          </Pressable>

          <Pressable
            onPress={pickImage}
            style={({ pressed }) => [
              styles.actionCard,
              styles.secondaryAction,
              pressed && { transform: [{ scale: 0.98 }] },
            ]}
          >
            <View style={styles.actionIconCircleSecondary}>
              <Upload color={Colors.primary} size={24} />
            </View>
            <Text style={styles.actionTitle}>{t("scan.choosePhoto")}</Text>
            <Text style={styles.actionSubtitle}>{t("scan.gallery")}</Text>
          </Pressable>
        </View>

        <View style={styles.bentoSection}>
          <View style={styles.bentoLarge}>
            <View style={styles.bentoHeader}>
              <Sparkles color={Colors.primary} size={20} />
              <Text style={styles.bentoTitle}>{t("scan.recognitionTitle")}</Text>
            </View>
            <Text style={styles.bentoText}>{t("scan.recognitionText")}</Text>
          </View>

          <View style={styles.tipCard}>
            <Text style={styles.tipLabel}>{t("scan.tip")}</Text>
            <Text style={styles.tipContent}>{t("scan.tipText")}</Text>
          </View>
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
    width: "100%",
  },
  heroImage: {
    ...StyleSheet.absoluteFillObject,
  },
  heroGradient: {
    ...StyleSheet.absoluteFillObject,
  },
  heroTopRow: {
    position: "absolute",
    left: 24,
    right: 24,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  brandPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "rgba(12, 10, 9, 0.5)",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 100,
    borderWidth: 1,
    borderColor: "rgba(212, 160, 92, 0.3)",
  },
  brandText: {
    color: Colors.ivory,
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 1.5,
  },
  aboutBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(253, 249, 239, 0.1)",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(253, 249, 239, 0.2)",
  },
  heroCopy: {
    position: "absolute",
    bottom: 30,
    left: 24,
    right: 24,
  },
  preTitle: {
    color: Colors.primary,
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 2,
    marginBottom: 6,
  },
  heroTitle: {
    color: Colors.ivory,
    fontSize: 32,
    fontWeight: "900",
    lineHeight: 38,
    letterSpacing: -0.5,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 10,
    gap: 20,
  },
  mainActions: {
    flexDirection: "row",
    gap: 16,
    height: 180,
  },
  actionCard: {
    flex: 1,
    borderRadius: 30,
    padding: 20,
    justifyContent: "flex-end",
    gap: 4,
  },
  primaryAction: {
    backgroundColor: Colors.primary,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 8,
  },
  secondaryAction: {
    backgroundColor: Colors.backgroundSecondary,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  actionIconCircle: {
    position: "absolute",
    top: 20,
    right: 20,
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: "rgba(253, 249, 239, 0.25)",
    alignItems: "center",
    justifyContent: "center",
  },
  actionIconCircleSecondary: {
    position: "absolute",
    top: 20,
    right: 20,
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "rgba(212, 160, 92, 0.1)",
    alignItems: "center",
    justifyContent: "center",
  },
  actionTitleLight: {
    color: "#0C0A09",
    fontSize: 18,
    fontWeight: "800",
  },
  actionSubtitleLight: {
    color: "rgba(12, 10, 9, 0.6)",
    fontSize: 13,
    fontWeight: "600",
  },
  actionTitle: {
    color: Colors.ivory,
    fontSize: 18,
    fontWeight: "800",
  },
  actionSubtitle: {
    color: Colors.textMuted,
    fontSize: 13,
    fontWeight: "600",
  },
  bentoSection: {
    gap: 16,
  },
  bentoLarge: {
    backgroundColor: Colors.backgroundSecondary,
    borderRadius: 28,
    padding: 24,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 12,
  },
  bentoHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  bentoTitle: {
    color: Colors.ivory,
    fontSize: 18,
    fontWeight: "800",
  },
  bentoText: {
    color: Colors.textSecondary,
    fontSize: 14,
    lineHeight: 22,
  },
  tipCard: {
    backgroundColor: "rgba(212, 160, 92, 0.08)",
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: "rgba(212, 160, 92, 0.2)",
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  tipLabel: {
    backgroundColor: Colors.primary,
    color: "#0C0A09",
    fontSize: 10,
    fontWeight: "900",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    letterSpacing: 1,
  },
  tipContent: {
    flex: 1,
    color: Colors.primaryLight,
    fontSize: 13,
    fontWeight: "600",
    lineHeight: 18,
  },

});
