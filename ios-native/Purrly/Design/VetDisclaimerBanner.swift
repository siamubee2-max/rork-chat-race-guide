import SwiftUI

/// Disclaimer vétérinaire visible, requis sur les écrans d'IA santé (App Store
/// Guideline 1.4.1). À placer dans l'assistant, les insights, l'analyse photo
/// et le comportement.
struct VetDisclaimerBanner: View {
    var body: some View {
        HStack(spacing: 6) {
            Image(systemName: "info.circle")
                .font(.caption2)
            Text("Informations générales — ne remplacent pas l'avis d'un vétérinaire. En cas d'urgence, consultez un vétérinaire.")
                .font(.caption2)
        }
        .foregroundStyle(AppTheme.textMuted)
        .multilineTextAlignment(.leading)
        .frame(maxWidth: .infinity, alignment: .leading)
        .padding(.horizontal, 16)
        .padding(.vertical, 8)
        .background(AppTheme.backgroundCard)
        .accessibilityElement(children: .combine)
    }
}
