import { Link } from "expo-router";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

export default function NotFoundScreen() {
  return (
    <View style={styles.container} testID="notFoundScreen">
      <Text style={styles.title}>Page introuvable</Text>
      <Text style={styles.subtitle}>
        Le lien que vous avez ouvert ne correspond à aucune page.
      </Text>

      <Link href="/" style={styles.link} testID="notFoundGoHome">
        <Text style={styles.linkText}>Retour à l'accueil</Text>
      </Link>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 22,
    fontWeight: "800",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    color: "rgba(0,0,0,0.6)",
    textAlign: "center",
    lineHeight: 20,
    paddingHorizontal: 12,
  },
  link: {
    marginTop: 18,
    paddingVertical: 10,
    paddingHorizontal: 14,
  },
  linkText: {
    fontSize: 15,
    color: "#2f95dc",
    fontWeight: "700",
  },
});
