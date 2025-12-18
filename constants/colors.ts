export const Colors = {
  // Backgrounds - Luxury Dark & Warm Light
  background: "#0C0A09", // Deep Obsidian
  backgroundSecondary: "#171412", // Rich Charcoal
  backgroundCard: "#1C1917", // Soft Ebony
  backgroundWarm: "#FDF8F3", // Cream Silk (for light mode or accents)
  
  // Primary accent - Golden Harvest / Rose Gold
  primary: "#D4A05C", // Warm Gold
  primaryDark: "#A87C43", // Deep Bronze
  primaryLight: "#F7D596", // Soft Gold
  primaryMuted: "rgba(212, 160, 92, 0.2)",
  
  // Luxury Palette
  gold: "#D4A05C",
  champagne: "#F7D596",
  ivory: "#FDF9EF",
  slate: "#44403C",
  stone: "#A8A29E",
  
  // Text colors - High Contrast for luxury
  text: "#FDF9EF", // Ivory text on dark
  textSecondary: "#D6D3D1", // Light Grey
  textMuted: "#78716C", // Muted Taupe
  textLight: "#44403C", // Dark for light backgrounds
  
  // UI elements
  border: "rgba(247, 213, 150, 0.15)",
  borderStrong: "rgba(247, 213, 150, 0.3)",
  shadow: "rgba(0, 0, 0, 0.5)",
  
  // Status colors
  success: "#10B981",
  error: "#EF4444",
  warning: "#F59E0B",
  info: "#3B82F6",
  
  // Special
  heart: "#EF4444",
  premium: "#D4A05C",
  
  // Accent colors
  accent: "#D4A05C",
  accentMuted: "rgba(212, 160, 92, 0.2)",
  
  // Tab bar
  tabActive: "#F7D596",
  tabInactive: "#78716C",
  tabBackground: "#0C0A09",
  
  // Gradients (Luxury Transitions)
  gradientHero: ["rgba(12, 10, 9, 0)", "rgba(12, 10, 9, 0.95)"],
  gradientGold: ["#D4A05C", "#F7D596"],
  gradientDark: ["#1C1917", "#0C0A09"],
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
