import React, { useCallback, useRef } from "react";
import { Animated, Pressable, StyleSheet, Text, type ViewStyle, type TextStyle } from "react-native";
import * as Haptics from "expo-haptics";
import { Colors } from "@/constants/colors";

interface ButtonProps {
  onPress: () => void;
  title: string;
  variant?: "primary" | "secondary" | "outline" | "ghost";
  size?: "small" | "medium" | "large";
  icon?: React.ReactNode;
  iconPosition?: "left" | "right";
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export function Button({
  onPress,
  title,
  variant = "primary",
  size = "medium",
  icon,
  iconPosition = "left",
  disabled = false,
  loading = false,
  fullWidth = false,
  style,
  textStyle,
}: ButtonProps) {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const opacityAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = useCallback(() => {
    if (disabled || loading) return;
    
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {}

    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 0.96,
        useNativeDriver: true,
        speed: 50,
        bounciness: 4,
      }),
      Animated.timing(opacityAnim, {
        toValue: 0.8,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
  }, [disabled, loading, scaleAnim, opacityAnim]);

  const handlePressOut = useCallback(() => {
    if (disabled || loading) return;

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
  }, [disabled, loading, scaleAnim, opacityAnim]);

  const handlePress = useCallback(() => {
    if (disabled || loading) return;
    
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch {}
    
    onPress();
  }, [disabled, loading, onPress]);

  const getButtonStyle = (): ViewStyle => {
    const baseStyle: ViewStyle = {
      ...styles.button,
      ...(fullWidth && styles.fullWidth),
    };

    switch (variant) {
      case "primary":
        return { ...baseStyle, ...styles.primary };
      case "secondary":
        return { ...baseStyle, ...styles.secondary };
      case "outline":
        return { ...baseStyle, ...styles.outline };
      case "ghost":
        return { ...baseStyle, ...styles.ghost };
      default:
        return baseStyle;
    }
  };

  const getSizeStyle = (): ViewStyle => {
    switch (size) {
      case "small":
        return styles.small;
      case "large":
        return styles.large;
      default:
        return styles.medium;
    }
  };

  const getTextStyle = (): TextStyle => {
    const baseTextStyle: TextStyle = styles.text;
    
    switch (variant) {
      case "primary":
        return { ...baseTextStyle, ...styles.primaryText };
      case "secondary":
        return { ...baseTextStyle, ...styles.secondaryText };
      case "outline":
        return { ...baseTextStyle, ...styles.outlineText };
      case "ghost":
        return { ...baseTextStyle, ...styles.ghostText };
      default:
        return baseTextStyle;
    }
  };

  const getTextSizeStyle = (): TextStyle => {
    switch (size) {
      case "small":
        return styles.smallText;
      case "large":
        return styles.largeText;
      default:
        return styles.mediumText;
    }
  };

  return (
    <Pressable
      onPress={handlePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled || loading}
    >
      <Animated.View
        style={[
          getButtonStyle(),
          getSizeStyle(),
          disabled && styles.disabled,
          { transform: [{ scale: scaleAnim }], opacity: opacityAnim },
          style,
        ]}
      >
        {icon && iconPosition === "left" && icon}
        <Text style={[getTextStyle(), getTextSizeStyle(), textStyle]}>
          {loading ? "..." : title}
        </Text>
        {icon && iconPosition === "right" && icon}
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    borderRadius: 16,
  },
  fullWidth: {
    width: "100%",
  },
  primary: {
    backgroundColor: Colors.primary,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  secondary: {
    backgroundColor: Colors.backgroundCard,
    borderWidth: 1.5,
    borderColor: Colors.primaryMuted,
  },
  outline: {
    backgroundColor: "transparent",
    borderWidth: 1.5,
    borderColor: Colors.border,
  },
  ghost: {
    backgroundColor: "transparent",
  },
  disabled: {
    opacity: 0.5,
  },
  small: {
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  medium: {
    paddingVertical: 14,
    paddingHorizontal: 20,
  },
  large: {
    paddingVertical: 16,
    paddingHorizontal: 24,
  },
  text: {
    fontWeight: "700",
  },
  primaryText: {
    color: "#0C0A09",
    letterSpacing: 0.5,
  },
  secondaryText: {
    color: Colors.primary,
    letterSpacing: 0.5,
  },
  outlineText: {
    color: Colors.text,
    letterSpacing: 0.5,
  },
  ghostText: {
    color: Colors.primary,
    letterSpacing: 0.5,
  },
  smallText: {
    fontSize: 12,
    fontWeight: "800",
  },
  mediumText: {
    fontSize: 15,
    fontWeight: "800",
  },
  largeText: {
    fontSize: 17,
    fontWeight: "800",
  },
});
