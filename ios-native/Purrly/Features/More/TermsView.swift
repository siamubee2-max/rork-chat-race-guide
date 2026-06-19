import SwiftUI

struct TermsView: View {
    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 16) {
                Text("Conditions d'utilisation")
                    .font(.title2.weight(.bold))
                    .foregroundStyle(AppTheme.ivory)

                Text("En utilisant Purrly, vous acceptez les présentes conditions. L'application est fournie à titre informatif et ne remplace pas un avis vétérinaire professionnel. En cas d'urgence médicale réelle, contactez immédiatement un vétérinaire.")
                    .foregroundStyle(AppTheme.textSecondary)

                Text("Abonnements")
                    .font(.headline)
                    .foregroundStyle(AppTheme.ivory)

                Text("L'abonnement Premium est facturé mensuellement. Il se renouvelle automatiquement sauf résiliation 24h avant la date de renouvellement depuis les Réglages > Abonnements de votre iPhone.")
                    .font(.subheadline)
                    .foregroundStyle(AppTheme.textSecondary)
            }
            .padding(24)
        }
        .navigationTitle("Conditions")
        .purrlyScreenBackground()
    }
}
