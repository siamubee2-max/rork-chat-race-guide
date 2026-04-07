import React, { useCallback, useRef } from "react";
import { Animated, Pressable, StyleSheet, type ViewStyle } from "react-native";
import * as Haptics from "expo-haptics";
import { Colors } from "@/constants/colors";

interface CardProps {
  children: React.ReactNode;
  onPress?: () => void;
  style?: ViewStyle;
  pressable?: boolean;
  elevated?: boolean;
}

export function Card({
  children,
  onPress,
  style,
  pressable = true,
  elevated = true,
}: CardProps) {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const opacityAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = useCallback(() => {
    if (!onPress || !pressable) return;

    try {
      Haptics.selectionAsync();
    } catch {}

    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 0.98,
        useNativeDriver: true,
        speed: 50,
        bounciness: 4,
      }),
      Animated.timing(opacityAnim, {
        toValue: 0.9,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
  }, [onPress, pressable, scaleAnim, opacityAnim]);

  const handlePressOut = useCallback(() => {
    if (!onPress || !pressable) return;

    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1,
        useNativeDriver: true,
        speed: 50,
        bounciness: 4,
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
  }, [onPress, pressable, scaleAnim, opacityAnim]);

  const handlePress = useCallback(() => {
    if (!onPress) return;

    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {}

    onPress();
  }, [onPress]);

  const content = (
    <Animated.View
      style={[
        styles.card,
        elevated && styles.elevated,
        {
          transform: [{ scale: scaleAnim }],
          opacity: opacityAnim,
        },
        style,
      ]}
    >
      {children}
    </Animated.View>
  );

  if (onPress && pressable) {
    return (
      <Pressable
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        accessibilityRole="button"
      >
        {content}
      </Pressable>
    );
  }

  return content;
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.backgroundSecondary,
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  elevated: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 5,
  },
});
