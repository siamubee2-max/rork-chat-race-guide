import { useCallback } from "react";
import { router } from "expo-router";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import * as Haptics from "expo-haptics";
import * as ImagePicker from "expo-image-picker";
import { Camera, Sparkles, Upload, Info, ScanLine, ChevronLeft } from "lucide-react-native";
import {
  Alert,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
  StatusBar
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTranslation } from "react-i18next";
import { Colors } from "@/constants/colors";
import { useScanImage } from "@/context/scan-image";

const heroImageUri = "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?q=80&w=2043&auto=format&fit=crop";

export default function ScanHomeScreen() {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
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
        setImage(asset.uri, asset.base64);
        router.push("/(tabs)/(scan)/result" as any);
      } else {
        Alert.alert(t('scan.error'), t('scan.imageProcessingError'));
      }
    }
  }, [t, setImage]);

  const onBack = useCallback(() => {
    router.back();
  }, []);

  return (
    <View style={styles.screen} testID="scanScreen">
      <StatusBar barStyle="light-content" />
      <View style={styles.bgContainer}>
         <Image
          source={{ uri: heroImageUri }}
          style={styles.bgImage}
          contentFit="cover"
          transition={1000}
        />
        <LinearGradient
          colors={["rgba(0,0,0,0.3)", "rgba(0,0,0,0.7)"]}
          style={styles.bgOverlay}
        />
      </View>

      <View style={[styles.content, { paddingTop: insets.top }]}>
        <View style={styles.header}>
           <Pressable onPress={onBack} style={styles.backButton}>
              <ChevronLeft color="#fff" size={24} />
           </Pressable>
           <View style={styles.headerBrand}>
             <ScanLine color="#fff" size={18} />
             <Text style={styles.headerTitle}>SCANNER IA</Text>
           </View>
           <View style={{ width: 40 }} />
        </View>

        <View style={styles.centerContent}>
          <View style={styles.scannerFrame}>
            <View style={styles.cornerTL} />
            <View style={styles.cornerTR} />
            <View style={styles.cornerBL} />
            <View style={styles.cornerBR} />
            
            <View style={styles.scannerIconContainer}>
              <Sparkles color="#fff" size={40} strokeWidth={1.5} />
            </View>
          </View>
          
          <Text style={styles.mainTitle}>{t('scan.title')}</Text>
          <Text style={styles.subTitle}>{t('scan.subtitle')}</Text>
        </View>

        <View style={[styles.bottomActions, { paddingBottom: insets.bottom + 20 }]}>
           <View style={styles.glassCard}>
              <View style={styles.tipRow}>
                <Info color="rgba(255,255,255,0.8)" size={16} />
                <Text style={styles.tipText}>{t('scan.tipText')}</Text>
              </View>
           </View>

           <Pressable
              onPress={takePhoto}
              style={({ pressed }) => [
                styles.primaryButton,
                pressed && styles.buttonPressed
              ]}
           >
             <LinearGradient
                colors={[Colors.primary, "#D06040"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.primaryGradient}
             >
                <Camera color="#fff" size={24} />
                <Text style={styles.primaryButtonText}>{t('scan.takePhoto')}</Text>
             </LinearGradient>
           </Pressable>

           <Pressable
              onPress={pickImage}
              style={({ pressed }) => [
                styles.secondaryButton,
                pressed && styles.buttonPressed
              ]}
           >
              <Upload color="#fff" size={20} />
              <Text style={styles.secondaryButtonText}>{t('scan.choosePhoto')}</Text>
           </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#000",
  },
  bgContainer: {
    ...StyleSheet.absoluteFillObject,
  },
  bgImage: {
    flex: 1,
    opacity: 0.8,
  },
  bgOverlay: {
    ...StyleSheet.absoluteFillObject,
  },
  content: {
    flex: 1,
    justifyContent: "space-between",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.1)",
    justifyContent: "center",
    alignItems: "center",
  },
  headerBrand: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "rgba(0,0,0,0.3)",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  headerTitle: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 2,
  },
  centerContent: {
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 30,
  },
  scannerFrame: {
    width: 200,
    height: 200,
    marginBottom: 40,
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  cornerTL: { position: "absolute", top: 0, left: 0, width: 40, height: 40, borderTopWidth: 4, borderLeftWidth: 4, borderColor: "#fff", borderTopLeftRadius: 20 },
  cornerTR: { position: "absolute", top: 0, right: 0, width: 40, height: 40, borderTopWidth: 4, borderRightWidth: 4, borderColor: "#fff", borderTopRightRadius: 20 },
  cornerBL: { position: "absolute", bottom: 0, left: 0, width: 40, height: 40, borderBottomWidth: 4, borderLeftWidth: 4, borderColor: "#fff", borderBottomLeftRadius: 20 },
  cornerBR: { position: "absolute", bottom: 0, right: 0, width: 40, height: 40, borderBottomWidth: 4, borderRightWidth: 4, borderColor: "#fff", borderBottomRightRadius: 20 },
  scannerIconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "rgba(255,255,255,0.1)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
  },
  mainTitle: {
    fontSize: 32,
    fontWeight: "300",
    color: "#fff",
    textAlign: "center",
    marginBottom: 12,
    fontFamily: Platform.select({ ios: "Georgia", android: "serif" }),
  },
  subTitle: {
    fontSize: 16,
    color: "rgba(255,255,255,0.8)",
    textAlign: "center",
    lineHeight: 24,
  },
  bottomActions: {
    paddingHorizontal: 24,
    gap: 16,
  },
  glassCard: {
    backgroundColor: "rgba(255,255,255,0.1)",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
    marginBottom: 10,
  },
  tipRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  tipText: {
    flex: 1,
    color: "rgba(255,255,255,0.9)",
    fontSize: 13,
    lineHeight: 18,
  },
  primaryButton: {
    borderRadius: 20,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 8,
  },
  primaryGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 18,
    borderRadius: 20,
    gap: 12,
  },
  primaryButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  secondaryButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 18,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.1)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
    gap: 12,
  },
  secondaryButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  buttonPressed: {
    transform: [{ scale: 0.98 }],
    opacity: 0.9,
  },
});
