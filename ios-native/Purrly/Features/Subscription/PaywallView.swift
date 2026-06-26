import SwiftUI
import RevenueCat

enum PurrlyFeature {
    case extraCat
    case aiMessage
    case communityPost

    var title: String {
        switch self {
        case .extraCat:       String(localized: "paywall.extraCat.title")
        case .aiMessage:      String(localized: "paywall.aiMessage.title")
        case .communityPost:  String(localized: "paywall.communityPost.title")
        }
    }

    var body: String {
        switch self {
        case .extraCat:       String(localized: "paywall.extraCat.body")
        case .aiMessage:      String(localized: "paywall.aiMessage.body")
        case .communityPost:  String(localized: "paywall.communityPost.body")
        }
    }

    var icon: String {
        switch self {
        case .extraCat:       "heart.fill"
        case .aiMessage:      "sparkles"
        case .communityPost:  "person.3.fill"
        }
    }
}

struct PaywallView: View {
    let feature: PurrlyFeature
    @Environment(\.dismiss) private var dismiss
    @Environment(AppEnvironment.self) private var env
    @State private var showTerms = false
    @State private var showPrivacy = false

    private var subscriptions: SubscriptionService { env.subscriptions }

    var body: some View {
        ScrollView {
            VStack(spacing: 24) {
                RoundedRectangle(cornerRadius: 3)
                    .fill(AppTheme.textMuted)
                    .frame(width: 36, height: 4)
                    .padding(.top, 12)

                Image(systemName: feature.icon)
                    .font(.system(size: 44))
                    .foregroundStyle(AppTheme.primary)

                VStack(spacing: 8) {
                    Text(feature.title)
                        .font(.title2.weight(.bold))
                        .foregroundStyle(AppTheme.ivory)
                        .multilineTextAlignment(.center)

                    Text(feature.body)
                        .font(.subheadline)
                        .foregroundStyle(AppTheme.textSecondary)
                        .multilineTextAlignment(.center)
                }

                packagesSection

                // Divulgation requise (Guideline 3.1.2) : renouvellement auto + durée.
                Text("Abonnement à renouvellement automatique. Le paiement est débité sur votre compte Apple à la confirmation. L'abonnement se renouvelle automatiquement sauf annulation au moins 24 h avant la fin de la période en cours. Gérez ou résiliez à tout moment dans les réglages de l'App Store.")
                    .font(.caption2)
                    .foregroundStyle(AppTheme.textMuted)
                    .multilineTextAlignment(.center)
                    .padding(.horizontal, 4)

                if let message = subscriptions.lastErrorMessage {
                    Text(message)
                        .font(.footnote)
                        .foregroundStyle(.red)
                        .multilineTextAlignment(.center)
                }

                Button {
                    Task {
                        if await subscriptions.restore() { dismiss() }
                    }
                } label: {
                    Text(String(localized: "paywall.restore", defaultValue: "Restaurer mes achats"))
                }
                .font(.subheadline)
                .foregroundStyle(AppTheme.textSecondary)
                .disabled(subscriptions.purchaseInProgress)

                Button(String(localized: "paywall.notNow")) { dismiss() }
                    .font(.subheadline)
                    .foregroundStyle(AppTheme.textMuted)

                // Liens légaux requis sur l'écran d'achat (Guideline 3.1.2).
                HStack(spacing: 16) {
                    Button("Conditions d'utilisation") { showTerms = true }
                    Text("·").foregroundStyle(AppTheme.textMuted)
                    Button("Politique de confidentialité") { showPrivacy = true }
                }
                .font(.caption)
                .foregroundStyle(AppTheme.textSecondary)

                Spacer(minLength: 8)
            }
            .padding(.horizontal, 28)
        }
        .sheet(isPresented: $showTerms) { NavigationStack { TermsView() } }
        .sheet(isPresented: $showPrivacy) { NavigationStack { PrivacyView() } }
        .background(AppTheme.backgroundSecondary)
        .presentationDetents([.large])
        .presentationDragIndicator(.hidden)
        .task {
            await subscriptions.loadOfferings()
        }
        .onChange(of: subscriptions.isPremium) { _, isPremium in
            if isPremium { dismiss() }
        }
    }

    @ViewBuilder
    private var packagesSection: some View {
        if !subscriptions.isReady {
            Text(String(localized: "paywall.unavailable",
                        defaultValue: "Abonnement bientôt disponible."))
                .font(.footnote)
                .foregroundStyle(AppTheme.textMuted)
                .padding(.vertical, 8)
        } else if subscriptions.isLoadingOfferings && subscriptions.packages.isEmpty {
            ProgressView()
                .padding(.vertical, 24)
        } else {
            VStack(spacing: 12) {
                ForEach(subscriptions.packages, id: \.identifier) { package in
                    Button {
                        Task {
                            if await subscriptions.purchase(package) { dismiss() }
                        }
                    } label: {
                        HStack {
                            Text(package.storeProduct.localizedTitle)
                                .fontWeight(.semibold)
                            Spacer()
                            Text(package.storeProduct.localizedPriceString)
                                .fontWeight(.bold)
                        }
                        .frame(maxWidth: .infinity, minHeight: AppTheme.minTouch)
                    }
                    .buttonStyle(GlassPrimaryButtonStyle())
                    .disabled(subscriptions.purchaseInProgress)
                }

                if subscriptions.purchaseInProgress {
                    ProgressView()
                        .padding(.top, 4)
                }
            }
        }
    }
}
