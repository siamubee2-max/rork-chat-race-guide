import { useCallback, useRef, useState } from "react";
import { Platform, Pressable, StyleSheet, Text, View } from "react-native";
import { navigate, navigateWithParams, navigateReplace } from "@/utils/navigate";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import { X, Zap, ZapOff, SwitchCamera, Circle } from "lucide-react-native";
import { Colors } from "@/constants/colors";
import { useScanImage } from "@/context/scan-image";

let CameraView: any = null;
let useCameraPermissions: any = null;

if (Platform.OS !== "web") {
  try {
    const cameraModule = require("expo-camera");
    CameraView = cameraModule.CameraView;
    useCameraPermissions = cameraModule.useCameraPermissions;
  } catch (e) {
    console.log("expo-camera not available");
  }
}

function WebFallback() {
  return (
    <View style={styles.webFallback}>
      <Text style={styles.webFallbackTitle}>Caméra non disponible</Text>
      <Text style={styles.webFallbackText}>
        La caméra en direct n'est pas disponible sur le web. Utilisez "Prendre une photo" depuis l'écran d'accueil.
      </Text>
      <Pressable
        onPress={() => router.back()}
        style={({ pressed }) => [
          styles.webBackBtn,
          pressed && { opacity: 0.8 },
        ]}
      >
        <Text style={styles.webBackBtnText}>Retour</Text>
      </Pressable>
    </View>
  );
}

function PermissionRequest({ onRequest }: { onRequest: () => void }) {
  return (
    <View style={styles.permissionContainer}>
      <Text style={styles.permissionTitle}>Accès caméra requis</Text>
      <Text style={styles.permissionText}>
        Pour scanner votre chat en direct, nous avons besoin d'accéder à votre caméra.
      </Text>
      <Pressable
        onPress={onRequest}
        style={({ pressed }) => [
          styles.permissionBtn,
          pressed && { opacity: 0.8 },
        ]}
      >
        <Text style={styles.permissionBtnText}>Autoriser la caméra</Text>
      </Pressable>
      <Pressable
        onPress={() => router.back()}
        style={({ pressed }) => [
          styles.permissionBackBtn,
          pressed && { opacity: 0.7 },
        ]}
      >
        <Text style={styles.permissionBackBtnText}>Retour</Text>
      </Pressable>
    </View>
  );
}

export default function CameraScreen() {
  const insets = useSafeAreaInsets();
  const { setImage } = useScanImage();
  const cameraRef = useRef<any>(null);
  const [facing, setFacing] = useState<"front" | "back">("back");
  const [flash, setFlash] = useState(false);
  const [isTaking, setIsTaking] = useState(false);

  const permission = useCameraPermissions ? useCameraPermissions() : [null, () => {}, () => {}];
  const [permissionResponse, requestPermission] = permission;

  const toggleFacing = useCallback(() => {
    setFacing((prev) => (prev === "back" ? "front" : "back"));
    try { Haptics.selectionAsync(); } catch {}
  }, []);

  const toggleFlash = useCallback(() => {
    setFlash((prev) => !prev);
    try { Haptics.selectionAsync(); } catch {}
  }, []);

  const takePicture = useCallback(async () => {
    if (!cameraRef.current || isTaking) return;
    setIsTaking(true);
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch {}

    try {
      const photo = await cameraRef.current.takePictureAsync({
        base64: true,
        quality: 0.4,
        skipProcessing: false,
      });

      if (photo?.base64) {
        console.log("Camera: Photo taken, base64 length:", photo.base64.length);
        setImage(photo.uri, photo.base64);
        navigateReplace("/(tabs)/(scan)/result");
      } else {
        console.warn("Camera: No base64 in photo result");
      }
    } catch (err) {
      console.error("Camera: Error taking picture:", err);
    } finally {
      setIsTaking(false);
    }
  }, [isTaking, setImage]);

  if (Platform.OS === "web" || !CameraView) {
    return <WebFallback />;
  }

  if (!permissionResponse) {
    return <View style={styles.screen} />;
  }

  if (!permissionResponse.granted) {
    return <PermissionRequest onRequest={requestPermission} />;
  }

  return (
    <View style={styles.screen} testID="cameraScreen">
      <CameraView
        ref={cameraRef}
        style={styles.camera}
        facing={facing}
        enableTorch={flash}
        mode="picture"
      />

      <View style={[styles.topBar, { top: insets.top + 12 }]}>
        <Pressable
          onPress={() => router.back()}
          style={({ pressed }) => [
            styles.topBtn,
            pressed && { opacity: 0.7 },
          ]}
        >
          <X color="#fff" size={22} />
        </Pressable>

        <Pressable
          onPress={toggleFlash}
          style={({ pressed }) => [
            styles.topBtn,
            flash && styles.topBtnActive,
            pressed && { opacity: 0.7 },
          ]}
        >
          {flash ? (
            <Zap color={Colors.primary} size={20} />
          ) : (
            <ZapOff color="#fff" size={20} />
          )}
        </Pressable>
      </View>

      <View style={styles.scanFrame}>
        <View style={styles.cornerTL} />
        <View style={styles.cornerTR} />
        <View style={styles.cornerBL} />
        <View style={styles.cornerBR} />
      </View>

      <View style={[styles.hint, { top: insets.top + 70 }]}>
        <Text style={styles.hintText}>Cadrez votre chat dans le viseur</Text>
      </View>

      <View style={[styles.bottomBar, { paddingBottom: insets.bottom + 24 }]}>
        <View style={styles.bottomActions}>
          <View style={styles.spacer} />

          <Pressable
            onPress={takePicture}
            disabled={isTaking}
            style={({ pressed }) => [
              styles.shutterOuter,
              pressed && { transform: [{ scale: 0.95 }] },
            ]}
            testID="cameraShutter"
          >
            <View style={[
              styles.shutterInner,
              isTaking && { backgroundColor: Colors.primary },
            ]}>
              <Circle color="transparent" size={1} />
            </View>
          </Pressable>

          <Pressable
            onPress={toggleFacing}
            style={({ pressed }) => [
              styles.flipBtn,
              pressed && { opacity: 0.7 },
            ]}
          >
            <SwitchCamera color="#fff" size={24} />
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
  camera: {
    flex: 1,
  },
  topBar: {
    position: "absolute",
    left: 20,
    right: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    zIndex: 10,
  },
  topBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(0,0,0,0.45)",
    alignItems: "center",
    justifyContent: "center",
  },
  topBtnActive: {
    backgroundColor: "rgba(212,160,92,0.25)",
    borderWidth: 1,
    borderColor: "rgba(212,160,92,0.5)",
  },
  scanFrame: {
    position: "absolute",
    top: "25%",
    left: "15%",
    right: "15%",
    bottom: "30%",
    zIndex: 5,
  },
  cornerTL: {
    position: "absolute",
    top: 0,
    left: 0,
    width: 40,
    height: 40,
    borderTopWidth: 3,
    borderLeftWidth: 3,
    borderColor: Colors.primary,
    borderTopLeftRadius: 12,
  },
  cornerTR: {
    position: "absolute",
    top: 0,
    right: 0,
    width: 40,
    height: 40,
    borderTopWidth: 3,
    borderRightWidth: 3,
    borderColor: Colors.primary,
    borderTopRightRadius: 12,
  },
  cornerBL: {
    position: "absolute",
    bottom: 0,
    left: 0,
    width: 40,
    height: 40,
    borderBottomWidth: 3,
    borderLeftWidth: 3,
    borderColor: Colors.primary,
    borderBottomLeftRadius: 12,
  },
  cornerBR: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 40,
    height: 40,
    borderBottomWidth: 3,
    borderRightWidth: 3,
    borderColor: Colors.primary,
    borderBottomRightRadius: 12,
  },
  hint: {
    position: "absolute",
    alignSelf: "center",
    backgroundColor: "rgba(0,0,0,0.55)",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    zIndex: 10,
  },
  hintText: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "600",
  },
  bottomBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingTop: 20,
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  bottomActions: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 40,
  },
  spacer: {
    width: 50,
  },
  shutterOuter: {
    width: 76,
    height: 76,
    borderRadius: 38,
    borderWidth: 4,
    borderColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: 30,
  },
  shutterInner: {
    width: 62,
    height: 62,
    borderRadius: 31,
    backgroundColor: "#fff",
  },
  flipBtn: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "rgba(255,255,255,0.15)",
    alignItems: "center",
    justifyContent: "center",
  },
  webFallback: {
    flex: 1,
    backgroundColor: Colors.background,
    alignItems: "center",
    justifyContent: "center",
    padding: 32,
  },
  webFallbackTitle: {
    color: Colors.ivory,
    fontSize: 20,
    fontWeight: "800",
    marginBottom: 12,
  },
  webFallbackText: {
    color: Colors.textSecondary,
    fontSize: 15,
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 28,
  },
  webBackBtn: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 28,
    paddingVertical: 14,
    borderRadius: 14,
  },
  webBackBtnText: {
    color: "#0C0A09",
    fontWeight: "800",
    fontSize: 15,
  },
  permissionContainer: {
    flex: 1,
    backgroundColor: Colors.background,
    alignItems: "center",
    justifyContent: "center",
    padding: 32,
  },
  permissionTitle: {
    color: Colors.ivory,
    fontSize: 22,
    fontWeight: "900",
    marginBottom: 12,
  },
  permissionText: {
    color: Colors.textSecondary,
    fontSize: 15,
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 32,
  },
  permissionBtn: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 28,
    paddingVertical: 14,
    borderRadius: 14,
    marginBottom: 16,
  },
  permissionBtnText: {
    color: "#0C0A09",
    fontWeight: "800",
    fontSize: 15,
  },
  permissionBackBtn: {
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  permissionBackBtnText: {
    color: Colors.textMuted,
    fontWeight: "600",
    fontSize: 14,
  },
});
