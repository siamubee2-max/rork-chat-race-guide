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
  useWindowDimensions,
} from "react-native";
import { router } from "expo-router";
import { KeyRound } from "lucide-react-native";
import { useAuth } from "@/context/auth";

export default function ForgotPasswordScreen() {
  const { resetPassword } = useAuth();
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { width } = useWindowDimensions();
  const isTablet = width >= 768;

  const handleRecoverPassword = async () => {
    if (!email.trim()) {
      Alert.alert("Erreur", "Veuillez entrer votre adresse email");
      return;
    }

    setIsLoading(true);
    const result = await resetPassword(email.trim());
    setIsLoading(false);

    if (result.success) {
      Alert.alert(
        "Email envoyé",
        "Si un compte est associé à cette adresse, vous recevrez un email pour réinitialiser votre mot de passe.",
        [
          {
            text: "Retour à la connexion",
            onPress: () => router.back(),
          },
        ]
      );
    } else {
      Alert.alert("Erreur", result.error || "Une erreur est survenue");
    }
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
            <KeyRound color="#FF6B6B" size={32} />
          </View>
          <Text style={styles.title}>Mot de passe oublié ?</Text>
          <Text style={styles.subtitle}>
            Entrez votre adresse email pour recevoir un lien de réinitialisation
          </Text>
        </View>

        <View style={styles.form}>
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
              accessibilityRole="none"
              accessibilityLabel="Adresse email"
              accessibilityHint="Entrez votre adresse email pour réinitialiser votre mot de passe"
            />
          </View>

          <Pressable
            onPress={handleRecoverPassword}
            disabled={isLoading}
            style={({ pressed }) => [
              styles.button,
              pressed && styles.buttonPressed,
              isLoading && styles.buttonDisabled,
            ]}
            accessibilityRole="button"
            accessibilityLabel={isLoading ? "Envoi en cours" : "Réinitialiser mon mot de passe"}
            accessibilityState={{ disabled: isLoading, busy: isLoading }}
          >
            <Text style={styles.buttonText}>
              {isLoading ? "Envoi..." : "Réinitialiser mon mot de passe"}
            </Text>
          </Pressable>

          <Pressable
            onPress={() => router.back()}
            disabled={isLoading}
            style={styles.backButton}
            accessibilityRole="button"
            accessibilityLabel="Retour à la connexion"
            accessibilityState={{ disabled: isLoading }}
          >
            <Text style={styles.backButtonText}>
              Retour à la connexion
            </Text>
          </Pressable>
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
    backgroundColor: "#FFF5F5",
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
    paddingHorizontal: 20,
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
  button: {
    backgroundColor: "#FF6B6B",
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: "center",
    marginTop: 8,
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
  backButton: {
    alignItems: "center",
    marginTop: 8,
  },
  backButtonText: {
    fontSize: 15,
    fontWeight: "600",
    color: "rgba(0,0,0,0.5)",
  },
});
