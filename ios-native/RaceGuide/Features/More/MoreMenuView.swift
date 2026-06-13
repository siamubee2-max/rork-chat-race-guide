import SwiftUI

struct MoreMenuView: View {
    @Environment(AppEnvironment.self) private var environment
    @State private var showPaywall = false

    var body: some View {
        List {
            Section("Assistant") {
                NavigationLink(destination: AssistantChatView()) {
                    MoreRow(symbol: "sparkles", title: "Assistant IA",
                            subtitle: environment.limits.isPremium
                                ? "Illimité"
                                : "\(environment.limits.aiMessagesRemaining) messages restants",
                            tint: .purple)
                }
                NavigationLink(destination: BehaviorView()) {
                    MoreRow(symbol: "brain.head.profile", title: "Comportement",
                            subtitle: "Analyse comportementale IA", tint: .purple)
                }
                NavigationLink(destination: InsightsView()) {
                    MoreRow(symbol: "lightbulb.fill", title: "Insights IA",
                            subtitle: "Conseils santé personnalisés", tint: .yellow)
                }
                NavigationLink(destination: PhotoAnalyzerView()) {
                    MoreRow(symbol: "camera.viewfinder", title: "Analyser une photo",
                            subtitle: "Humeur & bien-être par IA", tint: .cyan)
                }
            }
            .listRowBackground(AppTheme.backgroundCard)

            Section("Outils") {
                NavigationLink(destination: CatPhotoBoothView()) {
                    MoreRow(symbol: "camera.filters", title: "Photo Booth",
                            subtitle: "Stickers & cadres pour tes chats", tint: .pink)
                }
                NavigationLink(destination: CatAlbumView()) {
                    MoreRow(symbol: "photo.on.rectangle.angled", title: "Mon album",
                            subtitle: "Photos de tes chats", tint: .purple)
                }
                NavigationLink(destination: PracticalHomeView()) {
                    MoreRow(symbol: "creditcard", title: "Pratique",
                            subtitle: "Dépenses & outils", tint: AppTheme.primary)
                }
                NavigationLink(destination: GamificationView()) {
                    MoreRow(symbol: "trophy.fill", title: "Progression",
                            subtitle: "Niveau \(environment.gamification.level) · \(environment.gamification.totalXP) XP",
                            tint: .yellow)
                }
                NavigationLink(destination: DiscussionsListView()) {
                    MoreRow(symbol: "bubble.left.and.bubble.right.fill", title: "Forum",
                            subtitle: "\(environment.discussions.threads.count) discussions",
                            tint: .cyan)
                }
            }
            .listRowBackground(AppTheme.backgroundCard)

            Section("Compte") {
                if !environment.limits.isPremium {
                    Button { showPaywall = true } label: {
                        MoreRow(symbol: "crown.fill", title: "Purrly Premium",
                                subtitle: "14,99 $/mois", tint: AppTheme.primary)
                    }
                }
                NavigationLink(destination: AboutView()) {
                    MoreRow(symbol: "info.circle", title: "À propos",
                            subtitle: "Version 1.0.0", tint: AppTheme.textMuted)
                }
                NavigationLink(destination: FAQView()) {
                    MoreRow(symbol: "questionmark.circle", title: "FAQ",
                            subtitle: nil, tint: AppTheme.textMuted)
                }
                NavigationLink(destination: PrivacyView()) {
                    MoreRow(symbol: "hand.raised.fill", title: "Confidentialité",
                            subtitle: nil, tint: AppTheme.textMuted)
                }
                NavigationLink(destination: TermsView()) {
                    MoreRow(symbol: "doc.text", title: "Conditions",
                            subtitle: nil, tint: AppTheme.textMuted)
                }
            }
            .listRowBackground(AppTheme.backgroundCard)

            Section {
                Button(role: .destructive) {
                    Task { await environment.auth.signOut() }
                } label: {
                    MoreRow(symbol: "rectangle.portrait.and.arrow.right",
                            title: "Se déconnecter", subtitle: nil, tint: .red)
                }
            }
            .listRowBackground(AppTheme.backgroundCard)
        }
        .listStyle(.insetGrouped)
        .scrollContentBackground(.hidden)
        .navigationTitle("Plus")
        .sheet(isPresented: $showPaywall) {
            PaywallView(feature: .extraCat)
        }
        .purrlyScreenBackground()
    }
}

private struct MoreRow: View {
    let symbol: String
    let title: String
    let subtitle: String?
    let tint: Color

    var body: some View {
        HStack(spacing: 14) {
            Image(systemName: symbol)
                .font(.system(size: 18))
                .foregroundStyle(tint)
                .frame(width: 32)
            VStack(alignment: .leading, spacing: 2) {
                Text(title).foregroundStyle(AppTheme.ivory).font(.body)
                if let sub = subtitle {
                    Text(sub).foregroundStyle(AppTheme.textMuted).font(.caption)
                }
            }
        }
        .padding(.vertical, 2)
    }
}
