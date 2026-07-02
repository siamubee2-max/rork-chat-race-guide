import SwiftUI

struct PrivacyView: View {
    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 16) {
                Text("Politique de confidentialité")
                    .font(.title2.weight(.bold))
                    .foregroundStyle(AppTheme.ivory)

                Text("Purrly respecte votre vie privée. Les profils de vos chats sont stockés localement sur votre appareil et ne sont pas transmis à nos serveurs sans votre consentement explicite.")
                    .foregroundStyle(AppTheme.textSecondary)

                Text("Données collectées")
                    .font(.headline)
                    .foregroundStyle(AppTheme.ivory)

                VStack(alignment: .leading, spacing: 8) {
                    Text("• Email et nom d'utilisateur (pour la création de compte)")
                    Text("• Photos de chats (transmises temporairement pour l'analyse de races, non conservées)")
                    Text("• Messages envoyés à l'assistant IA (traités en temps réel, non conservés)")
                }
                .font(.subheadline)
                .foregroundStyle(AppTheme.textSecondary)

                Text("Vos droits")
                    .font(.headline)
                    .foregroundStyle(AppTheme.ivory)

                Text("Vous pouvez supprimer votre compte et toutes les données associées depuis Réglages > Supprimer mon compte.")
                    .font(.subheadline)
                    .foregroundStyle(AppTheme.textSecondary)
            }
            .padding(24)
        }
        .navigationTitle("Confidentialité")
        .purrlyScreenBackground()
    }
}
