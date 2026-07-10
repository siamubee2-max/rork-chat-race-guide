import SwiftUI

struct InsightsView: View {
    @Environment(AppEnvironment.self) private var environment
    @State private var insights: [InsightItem] = []
    @State private var isLoading = false
    @State private var errorText: String?

    struct InsightItem: Identifiable {
        let id = UUID()
        let icon: String
        let type: String
        let title: String
        let body: String
        let color: Color
    }

    var body: some View {
        ScrollView {
            VStack(spacing: 16) {
                VetDisclaimerBanner()
                if environment.cats.cats.isEmpty {
                    VStack(spacing: 12) {
                        Image(systemName: "lightbulb.slash")
                            .font(.system(size: 48))
                            .foregroundStyle(AppTheme.textMuted)
                        Text("Ajoutez un chat pour obtenir des insights personnalisés.")
                            .foregroundStyle(AppTheme.textSecondary)
                            .multilineTextAlignment(.center)
                    }.padding(32)
                } else {
                    Button {
                        Task { await loadInsights() }
                    } label: {
                        Label(
                            isLoading ? "Analyse…" : "Générer des insights",
                            systemImage: "sparkles"
                        )
                        .frame(maxWidth: .infinity, minHeight: AppTheme.minTouch)
                    }
                    .buttonStyle(GlassPrimaryButtonStyle())
                    .disabled(isLoading)

                    if isLoading {
                        ForEach(0 ..< 3, id: \.self) { _ in
                            RoundedRectangle(cornerRadius: 14)
                                .fill(AppTheme.backgroundCard)
                                .frame(height: 80)
                        }
                    } else if let error = errorText {
                        Text(error)
                            .font(.footnote)
                            .foregroundStyle(AppTheme.error)
                    } else {
                        ForEach(insights) { insight in
                            HStack(spacing: 14) {
                                Text(insight.icon)
                                    .font(.title2)
                                    .frame(width: 40)
                                VStack(alignment: .leading, spacing: 4) {
                                    HStack {
                                        Text(insight.type)
                                            .font(.caption.weight(.bold))
                                            .foregroundStyle(insight.color)
                                            .padding(.horizontal, 8)
                                            .padding(.vertical, 3)
                                            .background(insight.color.opacity(0.15), in: Capsule())
                                    }
                                    Text(insight.title)
                                        .font(.subheadline.weight(.semibold))
                                        .foregroundStyle(AppTheme.ivory)
                                    Text(insight.body)
                                        .font(.caption)
                                        .foregroundStyle(AppTheme.textSecondary)
                                        .lineLimit(3)
                                }
                            }
                            .padding(14)
                            .background(AppTheme.backgroundCard, in: RoundedRectangle(cornerRadius: 14))
                            .overlay(RoundedRectangle(cornerRadius: 14).stroke(AppTheme.border))
                        }
                    }
                }
            }
            .padding(16)
        }
        .navigationTitle("Insights IA")
        .navigationBarTitleDisplayMode(.inline)
        .purrlyScreenBackground()
        .task {
            if insights.isEmpty && !environment.cats.cats.isEmpty {
                await loadInsights()
            }
        }
    }

    private func loadInsights() async {
        isLoading = true
        errorText = nil
        let catsDesc = environment.cats.cats.map { c in
            var desc = c.name
            if let age = c.birthDate { desc += " (né le \(age))" }
            if let breed = c.breedId { desc += ", race: \(breed)" }
            return desc
        }.joined(separator: "; ")

        do {
            let reply = try await environment.aiChat.send(
                messages: [
                    ChatMessage(
                        id: UUID().uuidString,
                        role: .user,
                        content: "Generate 4 health/well-being insights for these cats: \(catsDesc). Return JSON: [{\"icon\":\"...\",\"type\":\"...\",\"title\":\"...\",\"body\":\"...\"}] where type is one of: Conseil, Alerte, Nutrition, Santé. Write title and body in \(LanguageManager.shared.aiReplyLanguage).",
                        createdAt: Date()
                    )
                ],
                systemPrompt: "You are an expert veterinarian. Respond ONLY with valid JSON, no markdown.",
                accessToken: KeychainStore.read(.accessToken)
            )
            let parsed = parseInsights(reply)
            insights = parsed
        } catch {
            insights = defaultInsights()
        }
        isLoading = false
    }

    private func parseInsights(_ json: String) -> [InsightItem] {
        struct Raw: Decodable {
            let icon: String
            let type: String
            let title: String
            let body: String
        }
        let clean = json.trimmingCharacters(in: .whitespaces)
        guard let data = clean.data(using: .utf8),
              let items = try? JSONDecoder().decode([Raw].self, from: data)
        else {
            return defaultInsights()
        }
        return items.map { r in
            let color: Color = r.type == "Alerte" ? AppTheme.error
                : r.type == "Nutrition" ? .orange
                : AppTheme.primary
            return InsightItem(icon: r.icon, type: r.type, title: r.title, body: r.body, color: color)
        }
    }

    private func defaultInsights() -> [InsightItem] {
        [
            InsightItem(
                icon: "💧", type: String(localized: "Conseil"), title: String(localized: "Hydratation"),
                body: String(localized: "Les chats boivent peu naturellement. Une fontaine à eau peut augmenter leur consommation de 30%."),
                color: .cyan
            ),
            InsightItem(
                icon: "🦷", type: String(localized: "Santé"), title: String(localized: "Hygiène dentaire"),
                body: String(localized: "80% des chats ont des problèmes dentaires à 3 ans. Brossage ou friandises dentaires recommandés."),
                color: AppTheme.primary
            ),
            InsightItem(
                icon: "🎮", type: String(localized: "Conseil"), title: String(localized: "Stimulation mentale"),
                body: String(localized: "15–20 min de jeu quotidien réduit le stress et prévient l'obésité."),
                color: .purple
            ),
            InsightItem(
                icon: "⚖️", type: String(localized: "Nutrition"), title: String(localized: "Contrôle du poids"),
                body: String(localized: "Pesez votre chat tous les mois. Une variation de 10% mérite une consultation vétérinaire."),
                color: .orange
            ),
        ]
    }
}
