import SwiftUI

// MARK: - Écran de règles communautaires (EULA) — Guideline 1.2

/// Présenté avant tout accès aux espaces communautaires de l'app. L'utilisateur
/// doit accepter les règles, qui affichent explicitement la tolérance zéro pour
/// les contenus offensants.
struct CommunityRulesGate: View {
    @Environment(AppEnvironment.self) private var environment
    @State private var showTerms = false
    @State private var showPrivacy = false

    private var moderation: ModerationStore { environment.moderation }

    private let rules: [(symbol: String, text: String)] = [
        ("hand.raised.fill", "Tolérance zéro pour les contenus offensants, haineux ou illégaux, et pour les comportements abusifs."),
        ("flag.fill", "Vous pouvez signaler tout contenu inapproprié. Il est masqué immédiatement et traité sous 24 h."),
        ("person.fill.xmark", "Vous pouvez bloquer tout utilisateur : son contenu disparaît instantanément de votre fil."),
        ("checkmark.seal.fill", "Les comptes publiant du contenu offensant sont retirés de la communauté.")
    ]

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 22) {
                VStack(alignment: .leading, spacing: 8) {
                    Image(systemName: "person.3.fill")
                        .font(.system(size: 44))
                        .foregroundStyle(AppTheme.primary)
                    Text("Règles de la communauté Purrly")
                        .font(.title2.weight(.bold))
                        .foregroundStyle(AppTheme.ivory)
                    Text("Avant de continuer, merci d'accepter nos règles. Elles protègent tous les membres.")
                        .font(.subheadline)
                        .foregroundStyle(AppTheme.textSecondary)
                }
                .padding(.top, 24)

                VStack(alignment: .leading, spacing: 16) {
                    ForEach(rules, id: \.symbol) { rule in
                        HStack(alignment: .top, spacing: 12) {
                            Image(systemName: rule.symbol)
                                .font(.system(size: 18))
                                .foregroundStyle(AppTheme.primary)
                                .frame(width: 26)
                            Text(rule.text)
                                .font(.subheadline)
                                .foregroundStyle(AppTheme.ivory)
                            Spacer(minLength: 0)
                        }
                    }
                }

                HStack(spacing: 16) {
                    Button("Conditions d'utilisation") { showTerms = true }
                    Button("Confidentialité") { showPrivacy = true }
                }
                .font(.caption.weight(.semibold))
                .tint(AppTheme.primary)

                Button {
                    moderation.acceptTerms()
                } label: {
                    Text("J'accepte les règles")
                }
                .buttonStyle(GlassPrimaryButtonStyle())
                .accessibilityIdentifier("moderation.acceptTerms")

                Text("En continuant, vous acceptez les Conditions d'utilisation (EULA) et confirmez n'avoir aucune tolérance pour les contenus offensants.")
                    .font(.caption2)
                    .foregroundStyle(AppTheme.textSecondary)
                    .multilineTextAlignment(.center)
                    .frame(maxWidth: .infinity)
            }
            .padding(24)
        }
        .purrlyScreenBackground()
        .interactiveDismissDisabled(true)
        .sheet(isPresented: $showTerms) { NavigationStack { TermsView() } }
        .sheet(isPresented: $showPrivacy) { NavigationStack { PrivacyView() } }
    }
}

// MARK: - Menu réutilisable Signaler / Bloquer — Guideline 1.2

/// À placer dans un `.contextMenu { … }` ou un `Menu { … }`. N'affiche rien pour
/// le contenu de l'utilisateur courant (comparaison sur le nom d'auteur réel).
struct ModerationMenuItems: View {
    let author: String
    let itemId: String
    /// Nom de l'utilisateur courant (issu de l'auth réelle). Le menu est masqué
    /// quand `author == currentUserName` pour empêcher l'auto-signalement.
    let currentUserName: String
    @Environment(AppEnvironment.self) private var environment

    var body: some View {
        if author != currentUserName {
            Button(role: .destructive) {
                environment.moderation.report(id: itemId, author: author, reason: "Contenu inapproprié")
            } label: {
                Label("Signaler ce contenu", systemImage: "flag")
            }
            Button(role: .destructive) {
                environment.moderation.block(author: author)
            } label: {
                Label("Bloquer \(author)", systemImage: "person.fill.xmark")
            }
        }
    }
}

extension View {
    /// Attache un menu contextuel Signaler/Bloquer — uniquement pour le contenu
    /// d'un autre utilisateur (rien pour soi-même, évite un menu vide).
    @ViewBuilder
    func moderationContextMenu(author: String, itemId: String, currentUserName: String) -> some View {
        if author != currentUserName {
            self.contextMenu {
                ModerationMenuItems(author: author, itemId: itemId, currentUserName: currentUserName)
            }
        } else {
            self
        }
    }
}

/// Bouton « … » prêt à l'emploi pour une barre d'outils.
struct ModerationToolbarMenu: View {
    let author: String
    let itemId: String
    let currentUserName: String

    var body: some View {
        Menu {
            ModerationMenuItems(author: author, itemId: itemId, currentUserName: currentUserName)
        } label: {
            Image(systemName: "ellipsis.circle")
                .foregroundStyle(AppTheme.primary)
        }
        .accessibilityLabel("Signaler ou bloquer")
    }
}
