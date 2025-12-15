import React, { useEffect, useRef } from "react";
import { Animated, StyleSheet, View, type ViewStyle } from "react-native";
import { Colors } from "@/constants/colors";

interface SkeletonProps {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  style?: ViewStyle;
}

export function Skeleton({
  width = "100%",
  height = 20,
  borderRadius = 8,
  style,
}: SkeletonProps) {
  const pulseAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    );
    pulse.start();

    return () => pulse.stop();
  }, [pulseAnim]);

  const opacity = pulseAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.7],
  });

  return (
    <Animated.View
      style={[
        styles.skeleton,
        style,
        {
          opacity,
        },
      ]}
    >
      <Animated.View
        style={{
          width,
          height,
          borderRadius,
          backgroundColor: Colors.backgroundSecondary,
          opacity,
        }}
      />
    </Animated.View>
  );
}

export function SkeletonCard() {
  return (
    <View style={styles.card}>
      <View style={styles.cardContent}>
        <Skeleton width={60} height={60} borderRadius={30} />
        <View style={styles.cardInfo}>
          <Skeleton width="60%" height={18} />
          <Skeleton width="40%" height={14} style={{ marginTop: 8 }} />
        </View>
      </View>
    </View>
  );
}

export function SkeletonList({ count = 3 }: { count?: number }) {
  return (
    <View style={styles.list}>
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  skeleton: {
    backgroundColor: Colors.backgroundSecondary,
  },
  card: {
    backgroundColor: Colors.backgroundCard,
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  cardContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  cardInfo: {
    flex: 1,
  },
  list: {
    gap: 14,
    padding: 18,
  },
});
