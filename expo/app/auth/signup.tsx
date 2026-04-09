import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  Linking,
  useWindowDimensions,
} from "react-native";
import { router } from "expo-router";
import { navigateReplace } from "@/utils/navigate";
import { UserPlus } from "lucide-react-native";
import { useAuth } from "@/context/auth";

const PRIVACY_URL = "https://siamubee2-max.github.io/purrly-legal/privacy/";
const TERMS_URL = "https://siamubee2-max.github.io/purrly-legal/terms/";

export default function SignupScreen() {
  const { signup } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { width } = useWindowDimensions();
  const isTablet = width >= 768;

  const handleSignup = async () => {
    if (!email.trim() || !password.trim() || !name.trim()) {
      Alert.alert("Erreur", "Veuillez remplir tous les champs");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      Alert.alert("Erreur", "Veuillez entrer une adresse email valide");
      return;
    }

    if (password.length < 6) {
      Alert.alert("Erreur", "Le mot de passe doit contenir au moins 6 caractères");
      return;
    }

    setIsLoading(true);
    const result = await signup(email.trim(), password, name.trim());
    setIsLoading(false);

    if (result.success) {
      navigateReplace("/(tabs)/(scan)/home");
    } else {
      Alert.alert("Erreur", result.error || "Erreur lors de l'inscription");
    }
  };

  const goToLogin = () => {
    router.back();
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        contentContainerStyle={[styles.scrollContent, isTablet && styles.scrollContentTablet]}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <View style={styles.iconContainer}>
            <UserPlus color="#111" size={32} />
          </View>
          <Text style={styles.title}>Créer un compte</Text>
          <Text style={styles.subtitle}>
            Inscrivez-vous pour commencer à utiliser Purrly
          </Text>
        </View>

        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Nom complet</Text>
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
              placeholder="Entrez votre nom"
              autoCapitalize="words"
              autoCorrect={false}
              editable={!isLoading}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Adresse email</Text>
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              placeholder="Entrez votre adresse email"
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="email-address"
              editable={!isLoading}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Mot de passe</Text>
            <TextInput
              style={styles.input}
              value={password}
              onChangeText={setPassword}
              placeholder="Au moins 6 caractères"
              secureTextEntry
              autoCapitalize="none"
              autoCorrect={false}
              editable={!isLoading}
            />
          </View>

          {/* Privacy / Terms consent — required by Apple and Google */}
          <Text style={styles.consentText}>
            En créant un compte, vous acceptez nos{" "}
            <Text
              style={styles.consentLink}
              onPress={() => Linking.openURL(TERMS_URL)}
            >
              Conditions d'utilisation
            </Text>
            {" "}et notre{" "}
            <Text
              style={styles.consentLink}
              onPress={() => Linking.openURL(PRIVACY_URL)}
            >
              Politique de confidentialité
            </Text>
            .
          </Text>

          <Pressable
            onPress={handleSignup}
            disabled={isLoading}
            style={({ pressed }) => [
              styles.button,
              pressed && styles.buttonPressed,
              isLoading && styles.buttonDisabled,
            ]}
          >
            <Text style={styles.buttonText}>
              {isLoading ? "Inscription..." : "S'inscrire"}
            </Text>
          </Pressable>

          <View style={styles.footer}>
            <Text style={styles.footerText}>Déjà un compte ?</Text>
            <Pressable onPress={goToLogin} disabled={isLoading}>
              <Text style={styles.link}>Se connecter</Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  scrollContent: {
    flexGrow: 1,
    padding: 24,
    justifyContent: "center",
  },
  scrollContentTablet: {
    maxWidth: 480,
    alignSelf: "center" as const,
    width: "100%",
  },
  header: {
    alignItems: "center",
    marginBottom: 40,
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#F6F7FB",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: "900",
    color: "#111",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    color: "rgba(0,0,0,0.5)",
    textAlign: "center",
  },
  form: {
    gap: 20,
  },
  inputGroup: {
    gap: 8,
  },
  label: {
    fontSize: 15,
    fontWeight: "700",
    color: "#111",
  },
  input: {
    borderWidth: 1.5,
    borderColor: "rgba(0,0,0,0.1)",
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    backgroundColor: "#fff",
    color: "#111",
  },
  consentText: {
    fontSize: 12,
    color: "rgba(0,0,0,0.45)",
    textAlign: "center",
    lineHeight: 18,
  },
  consentLink: {
    color: "#111",
    fontWeight: "600",
    textDecorationLine: "underline",
  },
  button: {
    backgroundColor: "#111",
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: "center",
  },
  buttonPressed: {
    opacity: 0.85,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "900",
  },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  footerText: {
    fontSize: 15,
    color: "rgba(0,0,0,0.5)",
  },
  link: {
    fontSize: 15,
    fontWeight: "700",
    color: "#111",
    textDecorationLine: "underline",
  },
});
