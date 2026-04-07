import React, { useRef, useCallback, useState } from "react";
import {
  Animated,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  type ViewStyle,
  Dimensions,
} from "react-native";
import { Colors } from "@/constants/colors";

interface TooltipProps {
  children: React.ReactNode;
  content: string;
  position?: "top" | "bottom" | "left" | "right";
  style?: ViewStyle;
}

export function Tooltip({
  children,
  content,
  position = "top",
  style,
}: TooltipProps) {
  const [visible, setVisible] = useState(false);
  const [layout, setLayout] = useState({ x: 0, y: 0, width: 0, height: 0 });
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;

  const showTooltip = useCallback(() => {
    setVisible(true);
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        useNativeDriver: true,
        speed: 50,
        bounciness: 8,
      }),
    ]).start();
  }, [fadeAnim, scaleAnim]);

  const hideTooltip = useCallback(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 0.8,
        useNativeDriver: true,
        speed: 50,
      }),
    ]).start(() => setVisible(false));
  }, [fadeAnim, scaleAnim]);

  const getTooltipPosition = (): ViewStyle => {
    const { width: screenWidth, height: screenHeight } = Dimensions.get("window");
    const tooltipWidth = 200;
    const tooltipHeight = 60;
    const offset = 8;

    let top = 0;
    let left = 0;

    switch (position) {
      case "top":
        top = layout.y - tooltipHeight - offset;
        left = layout.x + layout.width / 2 - tooltipWidth / 2;
        break;
      case "bottom":
        top = layout.y + layout.height + offset;
        left = layout.x + layout.width / 2 - tooltipWidth / 2;
        break;
      case "left":
        top = layout.y + layout.height / 2 - tooltipHeight / 2;
        left = layout.x - tooltipWidth - offset;
        break;
      case "right":
        top = layout.y + layout.height / 2 - tooltipHeight / 2;
        left = layout.x + layout.width + offset;
        break;
    }

    left = Math.max(16, Math.min(left, screenWidth - tooltipWidth - 16));
    top = Math.max(16, Math.min(top, screenHeight - tooltipHeight - 16));

    return { top, left, width: tooltipWidth };
  };

  return (
    <>
      <Pressable
        onPress={showTooltip}
        onLongPress={showTooltip}
        onLayout={(event) => {
          event.currentTarget.measure((_fx, _fy, w, h, px, py) => {
            setLayout({ x: px, y: py, width: w, height: h });
          });
        }}
        style={style}
        accessibilityRole="button"
        accessibilityLabel={content}
        accessibilityHint="Appuyez pour afficher l'info-bulle"
      >
        {children}
      </Pressable>

      {visible && (
        <Modal transparent visible={visible} onRequestClose={hideTooltip}>
          <Pressable style={styles.overlay} onPress={hideTooltip}>
            <Animated.View
              style={[
                styles.tooltip,
                getTooltipPosition(),
                {
                  opacity: fadeAnim,
                  transform: [{ scale: scaleAnim }],
                },
              ]}
            >
              <Text style={styles.tooltipText}>{content}</Text>
            </Animated.View>
          </Pressable>
        </Modal>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "transparent",
  },
  tooltip: {
    position: "absolute",
    backgroundColor: Colors.text,
    padding: 12,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  tooltipText: {
    color: "#fff",
    fontSize: 13,
    lineHeight: 18,
    fontWeight: "600",
  },
});
