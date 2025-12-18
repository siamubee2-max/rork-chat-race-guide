import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

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
    // #region agent log
    const errorMsg = error instanceof Error ? error.message : String(error);
    const infoStr = typeof info === 'object' ? JSON.stringify(info) : String(info);
    fetch('http://127.0.0.1:7242/ingest/bd03eb35-54e1-47b5-a23a-c26416383972',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'ErrorBoundary.tsx:21',message:'ErrorBoundary caught error',data:{error:errorMsg,info:infoStr},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'F'})}).catch(()=>{});
    // #endregion
    console.log("[ErrorBoundary] error", error);
    console.log("[ErrorBoundary] info", info);
  }

  private onReset = () => {
    console.log("[ErrorBoundary] reset");
    this.setState({ hasError: false, message: "" });
  };

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <View style={styles.screen} testID="errorBoundary">
        <Text style={styles.title}>Oups…</Text>
        <Text style={styles.subtitle}>
          Un problème est survenu. Appuyez sur “Réessayer”.
        </Text>
        <View style={styles.card}>
          <Text style={styles.mono} numberOfLines={8}>
            {this.state.message || "Erreur inconnue"}
          </Text>
        </View>
        <Pressable
          onPress={this.onReset}
          style={({ pressed }: { pressed: boolean }) => [styles.btn, pressed ? { opacity: 0.9 } : null]}
          testID="errorBoundaryRetry"
        >
          <Text style={styles.btnText}>Réessayer</Text>
        </Pressable>
      </View>
    );
  }
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
