import SwiftUI

struct MoreMenuView: View {
    @Environment(AppEnvironment.self) private var environment
    @State private var showPaywall = false
    @State private var showDeleteConfirm = false
    @State private var isDeleting = false

    var body: some View {
        List {
            Section("Assistant") {
                NavigationLink(destination: AssistantChatView()) {
                    MoreRow(symbol: "sparkles", title: String(localized: "Assistant IA"),
                            subtitle: environment.limits.isPremium
                                ? String(localized: "Illimité")
                                : String(localized: "\(environment.limits.aiMessagesRemaining) messages restants"),
                            tint: .purple)
                }
                NavigationLink(destination: BehaviorView()) {
                    MoreRow(symbol: "brain.head.profile", title: String(localized: "Comportement"),
                            subtitle: String(localized: "Analyse comportementale IA"), tint: .purple)
                }
                NavigationLink(destination: InsightsView()) {
                    MoreRow(symbol: "lightbulb.fill", title: String(localized: "Insights IA"),
                            subtitle: String(localized: "Conseils santé personnalisés"), tint: .yellow)
                }
                NavigationLink(destination: PhotoAnalyzerView()) {
                    MoreRow(symbol: "camera.viewfinder", title: String(localized: "Analyser une photo"),
                            subtitle: String(localized: "Humeur & bien-être par IA"), tint: .cyan)
                }
            }
            .listRowBackground(AppTheme.backgroundCard)

            Section("Outils") {
                NavigationLink(destination: CatPhotoBoothView()) {
                    MoreRow(symbol: "camera.filters", title: String(localized: "Photo Booth"),
                            subtitle: String(localized: "Stickers & cadres pour tes chats"), tint: .pink)
                }
                NavigationLink(destination: CatAlbumView()) {
                    MoreRow(symbol: "photo.on.rectangle.angled", title: String(localized: "Mon album"),
                            subtitle: String(localized: "Photos de tes chats"), tint: .purple)
                }
                NavigationLink(destination: PracticalHomeView()) {
                    MoreRow(symbol: "creditcard", title: String(localized: "Pratique"),
                            subtitle: String(localized: "Dépenses & outils"), tint: AppTheme.primary)
                }
                NavigationLink(destination: GamificationView()) {
                    MoreRow(symbol: "trophy.fill", title: String(localized: "Progression"),
                            subtitle: String(localized: "Niveau \(environment.gamification.level) · \(environment.gamification.totalXP) XP"),
                            tint: .yellow)
                }
                NavigationLink(destination: DiscussionsListView()) {
                    MoreRow(symbol: "bubble.left.and.bubble.right.fill", title: String(localized: "Forum"),
                            subtitle: String(localized: "\(environment.discussions.threads.count) discussions"),
                            tint: .cyan)
                }
            }
            .listRowBackground(AppTheme.backgroundCard)

            Section("Compte") {
                if !environment.limits.isPremium {
                    Button { showPaywall = true } label: {
                        MoreRow(symbol: "crown.fill", title: String(localized: "Purrly Premium"),
                                subtitle: String(localized: "14,99 $/mois"), tint: AppTheme.primary)
                    }
                }
                NavigationLink(destination: AboutView()) {
                    MoreRow(symbol: "info.circle", title: String(localized: "À propos"),
                            subtitle: "Version 1.0.0", tint: AppTheme.textMuted)
                }
                NavigationLink(destination: FAQView()) {
                    MoreRow(symbol: "questionmark.circle", title: "FAQ",
                            subtitle: nil, tint: AppTheme.textMuted)
                }
                NavigationLink(destination: PrivacyView()) {
                    MoreRow(symbol: "hand.raised.fill", title: String(localized: "Confidentialité"),
                            subtitle: nil, tint: AppTheme.textMuted)
                }
                NavigationLink(destination: TermsView()) {
                    MoreRow(symbol: "doc.text", title: String(localized: "Conditions"),
                            subtitle: nil, tint: AppTheme.textMuted)
                }
            }
            .listRowBackground(AppTheme.backgroundCard)

            Section {
                Button(role: .destructive) {
                    Task {
                        await environment.auth.signOut()
                        await environment.signOutSubscriber()
                    }
                } label: {
                    MoreRow(symbol: "rectangle.portrait.and.arrow.right",
                            title: String(localized: "Se déconnecter"), subtitle: nil, tint: .red)
                }
                Button(role: .destructive) {
                    showDeleteConfirm = true
                } label: {
                    MoreRow(symbol: "trash",
                            title: isDeleting ? String(localized: "Suppression…") : String(localized: "Supprimer mon compte"),
                            subtitle: String(localized: "Efface définitivement votre compte et vos données"),
                            tint: .red)
                }
                .disabled(isDeleting)
            }
            .listRowBackground(AppTheme.backgroundCard)
        }
        .listStyle(.insetGrouped)
        .scrollContentBackground(.hidden)
        .navigationTitle("Plus")
        .alert("Supprimer le compte ?", isPresented: $showDeleteConfirm) {
            Button("Annuler", role: .cancel) {}
            Button("Supprimer", role: .destructive) {
                isDeleting = true
                Task {
                    let ok = await environment.auth.deleteAccount()
                    await environment.signOutSubscriber()
                    isDeleting = false
                    _ = ok
                }
            }
        } message: {
            Text("Cette action est définitive. Votre compte, vos chats et vos données seront supprimés et ne pourront pas être récupérés.")
        }
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
