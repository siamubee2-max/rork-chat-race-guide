export const Colors = {
  // Backgrounds
  background: "#FDF8F3",
  backgroundSecondary: "#F5EDE4",
  backgroundCard: "#FFFBF7",
  backgroundWarm: "#F9F1E8",
  
  // Primary accent - Terracotta/Coral
  primary: "#D4775C",
  primaryDark: "#B85A42",
  primaryLight: "#E8A08C",
  primaryMuted: "#E8C4B8",
  
  // Secondary accent - Warm Amber
  accent: "#E8A849",
  accentLight: "#F5D28B",
  accentMuted: "#F5E6C8",
  
  // Text colors
  text: "#3D2E24",
  textSecondary: "#6B5749",
  textMuted: "#9A8678",
  textLight: "#B8A89A",
  
  // UI elements
  border: "rgba(139, 109, 89, 0.15)",
  borderStrong: "rgba(139, 109, 89, 0.25)",
  shadow: "rgba(61, 46, 36, 0.08)",
  
  // Status colors
  success: "#7BA05B",
  error: "#D45B5B",
  warning: "#E8A849",
  info: "#6B9AC4",
  
  // Special
  heart: "#D45B5B",
  premium: "#D4A05C",
  
  // Tab bar
  tabActive: "#D4775C",
  tabInactive: "#9A8678",
  tabBackground: "#FDF8F3",
  
  // Gradients (for LinearGradient)
  gradientHero: ["rgba(61, 46, 36, 0.1)", "rgba(61, 46, 36, 0.75)"],
  gradientCard: ["rgba(253, 248, 243, 0)", "rgba(253, 248, 243, 1)"],
};

export default {
  light: {
    text: Colors.text,
    background: Colors.background,
    tint: Colors.primary,
    tabIconDefault: Colors.tabInactive,
    tabIconSelected: Colors.tabActive,
  },
};
