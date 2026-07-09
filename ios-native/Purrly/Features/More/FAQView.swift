import SwiftUI

struct FAQView: View {
    private let items: [(String, String)] = [
        (String(localized: "Comment fonctionne le scan ?"),
         String(localized: "Prends une photo nette de ton chat. L'IA analyse les traits morphologiques et compare avec plus de 400 races connues.")),
        (String(localized: "Mes données sont-elles privées ?"),
         String(localized: "Les profils de chats sont stockés localement sur ton appareil. L'assistant IA envoie les messages au serveur pour traitement mais ne les conserve pas.")),
        (String(localized: "Puis-je annuler mon abonnement ?"),
         String(localized: "Oui, à tout moment depuis les Réglages > Abonnements de ton iPhone.")),
        (String(localized: "Le mode urgence fonctionne hors-ligne ?"),
         String(localized: "Les alertes d'urgence créées sont stockées localement. La carte vétérinaires nécessite une connexion.")),
    ]

    var body: some View {
        List(items, id: \.0) { item in
            DisclosureGroup(item.0) {
                Text(item.1)
                    .font(.subheadline)
                    .foregroundStyle(AppTheme.textSecondary)
                    .padding(.top, 4)
            }
            .foregroundStyle(AppTheme.ivory)
            .listRowBackground(AppTheme.backgroundCard)
        }
        .listStyle(.insetGrouped)
        .scrollContentBackground(.hidden)
        .navigationTitle("FAQ")
        .purrlyScreenBackground()
    }
}
