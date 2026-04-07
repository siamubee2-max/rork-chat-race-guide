import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useTranslation } from "react-i18next";

type Props = {
  children: React.ReactNode;
};

type State = {
  hasError: boolean;
  message: string;
};

export class ErrorBoundary extends React.PureComponent<Props, State> {
  state: State = { hasError: false, message: "" };

  static getDerivedStateFromError(error: unknown): State {
    const msg = error instanceof Error ? error.message : String(error);
    return { hasError: true, message: msg };
  }

  componentDidCatch(error: unknown, info: unknown) {
    if (__DEV__) {
      console.log("[ErrorBoundary] error", error);
      console.log("[ErrorBoundary] info", info);
    }
    // TODO: En production, envoyer les erreurs à un service de logging (Sentry, etc.)
  }

  private onReset = () => {
    if (__DEV__) {
      console.log("[ErrorBoundary] reset");
    }
    this.setState({ hasError: false, message: "" });
  };

  render() {
    if (!this.state.hasError) return this.props.children;

    return <ErrorBoundaryContent message={this.state.message} onReset={this.onReset} />;
  }
}

function ErrorBoundaryContent({ message, onReset }: { message: string; onReset: () => void }) {
  const { t } = useTranslation();

  return (
    <View style={styles.screen} testID="errorBoundary">
      <Text style={styles.title}>{t("errorBoundary.title")}</Text>
      <Text style={styles.subtitle}>
        {t("errorBoundary.message")}
      </Text>
      <View style={styles.card}>
        <Text style={styles.mono} numberOfLines={8}>
          {message || t("common.unknownError")}
        </Text>
      </View>
      <Pressable
        onPress={onReset}
        style={({ pressed }: { pressed: boolean }) => [styles.btn, pressed ? { opacity: 0.9 } : null]}
        testID="errorBoundaryRetry"
        accessibilityRole="button"
        accessibilityLabel={t("errorBoundary.retry")}
      >
        <Text style={styles.btnText}>{t("errorBoundary.retry")}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 18,
    justifyContent: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "900",
    letterSpacing: -0.2,
    color: "rgba(0,0,0,0.95)",
  },
  subtitle: {
    marginTop: 8,
    color: "rgba(0,0,0,0.6)",
    lineHeight: 19,
  },
  card: {
    marginTop: 14,
    backgroundColor: "#F6F7FB",
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.06)",
    borderRadius: 16,
    padding: 12,
  },
  mono: {
    color: "rgba(0,0,0,0.8)",
    fontSize: 12,
  },
  btn: {
    marginTop: 14,
    backgroundColor: "#111",
    paddingVertical: 12,
    borderRadius: 14,
    alignItems: "center",
  },
  btnText: {
    color: "#fff",
    fontWeight: "900",
  },
});
