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
  const { getRegisteredEmails, getUserByEmail } = useAuth();
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
    const user = await getUserByEmail(email.trim());
    setIsLoading(false);

    if (user) {
      Alert.alert(
        "Informations du compte",
        `Nom: ${user.name}\nMot de passe: ${user.password}`,
        [
          {
            text: "Se connecter",
            onPress: () => router.back(),
          },
          {
            text: "OK",
            style: "cancel",
          },
        ]
      );
    } else {
      Alert.alert(
        "Email non trouvé",
        "Aucun compte n'est associé à cette adresse email"
      );
    }
  };

  const handleShowAllEmails = async () => {
    setIsLoading(true);
    const emails = await getRegisteredEmails();
    setIsLoading(false);

    if (emails.length === 0) {
      Alert.alert("Aucun compte", "Aucun compte n'est enregistré");
    } else {
      Alert.alert(
        "Emails enregistrés",
        emails.map((e, i) => `${i + 1}. ${e}`).join("\n"),
        [{ text: "OK" }]
      );
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
            Entrez votre adresse email pour récupérer vos informations de compte
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
              accessibilityHint="Entrez votre adresse email pour récupérer votre mot de passe"
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
            accessibilityLabel={isLoading ? "Recherche en cours" : "Récupérer mon mot de passe"}
            accessibilityState={{ disabled: isLoading, busy: isLoading }}
          >
            <Text style={styles.buttonText}>
              {isLoading ? "Recherche..." : "Récupérer mon mot de passe"}
            </Text>
          </Pressable>

          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>ou</Text>
            <View style={styles.dividerLine} />
          </View>

          <Pressable
            onPress={handleShowAllEmails}
            disabled={isLoading}
            style={({ pressed }) => [
              styles.secondaryButton,
              pressed && styles.buttonPressed,
            ]}
            accessibilityRole="button"
            accessibilityLabel="Voir tous les emails enregistrés"
            accessibilityState={{ disabled: isLoading }}
          >
            <Text style={styles.secondaryButtonText}>
              Voir tous les emails enregistrés
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
  divider: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginVertical: 8,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: "rgba(0,0,0,0.1)",
  },
  dividerText: {
    fontSize: 14,
    color: "rgba(0,0,0,0.4)",
    fontWeight: "600",
  },
  secondaryButton: {
    backgroundColor: "#F6F7FB",
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: "center",
  },
  secondaryButtonText: {
    color: "#111",
    fontSize: 16,
    fontWeight: "700",
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
