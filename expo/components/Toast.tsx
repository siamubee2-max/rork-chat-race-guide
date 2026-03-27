import React, { useEffect, useRef } from "react";
import { Animated, StyleSheet, Text } from "react-native";
import { CheckCircle, AlertCircle, Info, XCircle } from "lucide-react-native";
import { Colors } from "@/constants/colors";

type ToastType = "success" | "error" | "info" | "warning";

interface ToastProps {
  message: string;
  type?: ToastType;
  duration?: number;
  onHide?: () => void;
}

export function Toast({
  message,
  type = "info",
  duration = 3000,
  onHide,
}: ToastProps) {
  const translateY = useRef(new Animated.Value(-100)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(translateY, {
        toValue: 0,
        useNativeDriver: true,
        speed: 20,
        bounciness: 8,
      }),
      Animated.timing(opacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();

    const timer = setTimeout(() => {
      Animated.parallel([
        Animated.timing(translateY, {
          toValue: -100,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start(() => {
        onHide?.();
      });
    }, duration);

    return () => clearTimeout(timer);
  }, [translateY, opacity, duration, onHide]);

  const getIcon = () => {
    switch (type) {
      case "success":
        return <CheckCircle color="#10b981" size={20} />;
      case "error":
        return <XCircle color="#ef4444" size={20} />;
      case "warning":
        return <AlertCircle color="#f59e0b" size={20} />;
      default:
        return <Info color="#3b82f6" size={20} />;
    }
  };

  const getBackgroundColor = () => {
    switch (type) {
      case "success":
        return "rgba(16, 185, 129, 0.1)";
      case "error":
        return "rgba(239, 68, 68, 0.1)";
      case "warning":
        return "rgba(245, 158, 11, 0.1)";
      default:
        return "rgba(59, 130, 246, 0.1)";
    }
  };

  return (
    <Animated.View
      style={[
        styles.toast,
        {
          backgroundColor: getBackgroundColor(),
          transform: [{ translateY }],
          opacity,
        },
      ]}
    >
      {getIcon()}
      <Text style={styles.message}>{message}</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  toast: {
    position: "absolute",
    top: 60,
    left: 20,
    right: 20,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 16,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
    zIndex: 9999,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  message: {
    flex: 1,
    fontSize: 14,
    fontWeight: "600",
    color: Colors.text,
    lineHeight: 20,
  },
});
