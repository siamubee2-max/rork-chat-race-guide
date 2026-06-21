import AppIntents

/// App Intent : « Dis Siri, scanne mon chat ». Disponible aussi dans Spotlight,
/// les Raccourcis, et le bouton Action.
struct ScanCatIntent: AppIntent {
    static let title: LocalizedStringResource = "Scanner mon chat"
    static let description = IntentDescription("Ouvre Purrly et lance le scanner de race IA.")

    /// Ouvre l'app au lancement de l'intent (le scan nécessite la caméra/UI).
    static let openAppWhenRun = true

    @MainActor
    func perform() async throws -> some IntentResult {
        AppRouter.shared.requestScan()
        return .result()
    }
}

/// Expose les raccourcis Siri/Spotlight sans configuration utilisateur.
struct PurrlyShortcuts: AppShortcutsProvider {
    static var appShortcuts: [AppShortcut] {
        AppShortcut(
            intent: ScanCatIntent(),
            phrases: [
                "Scanne mon chat avec \(.applicationName)",
                "\(.applicationName) identifie la race de mon chat",
                "Lance le scanner \(.applicationName)"
            ],
            shortTitle: "Scanner un chat",
            systemImageName: "camera.viewfinder"
        )
    }
}
