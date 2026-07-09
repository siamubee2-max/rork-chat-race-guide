import SwiftUI

private struct AidSection: Identifiable {
    let id: String
    let symbol: String
    let color: Color
    let title: String
    let items: [String]
}

private let sections: [AidSection] = [
    AidSection(
        id: "urgency",
        symbol: "exclamationmark.triangle.fill",
        color: Color(hex: 0xDC2626),
        title: String(localized: "Signes d'urgence"),
        items: [
            String(localized: "Vomissements répétés (plus de 3 en 24h)"),
            String(localized: "Difficultés respiratoires ou halètement intense"),
            String(localized: "Perte de conscience ou convulsions"),
            String(localized: "Sang dans les vomissements ou les selles"),
            String(localized: "Gencives bleues, blanches ou très pâles"),
            String(localized: "Traumatisme ou chute importante"),
        ]
    ),
    AidSection(
        id: "poisons",
        symbol: "cross.vial.fill",
        color: Color(hex: 0x9333EA),
        title: String(localized: "Poisons communs"),
        items: [
            String(localized: "Raisins et raisins secs — toxiques pour les reins"),
            String(localized: "Chocolat — contient de la théobromine"),
            String(localized: "Oignons et ail — détruisent les globules rouges"),
            String(localized: "Muguet — toutes parties sont toxiques"),
            String(localized: "Lilas — feuilles et fleurs dangereuses"),
            String(localized: "Paracétamol et ibuprofène — mortels pour les chats"),
            String(localized: "Antifreezes (éthylène glycol) — extrêmement dangereux"),
        ]
    ),
    AidSection(
        id: "gestures",
        symbol: "hand.raised.fill",
        color: Color(hex: 0x10B981),
        title: String(localized: "Premiers gestes"),
        items: [
            String(localized: "Rester calme et rassurer le chat"),
            String(localized: "Ne pas forcer à manger ni à boire"),
            String(localized: "Ne pas donner de médicaments humains"),
            String(localized: "Appeler immédiatement le vétérinaire"),
            String(localized: "Garder le chat au chaud dans une couverture"),
            String(localized: "Noter l'heure des premiers symptômes"),
            String(localized: "Conserver l'emballage du produit ingéré si applicable"),
        ]
    ),
    AidSection(
        id: "numbers",
        symbol: "phone.fill",
        color: Color(hex: 0x2196F3),
        title: String(localized: "Numéros d'urgence"),
        items: [
            String(localized: "15 — SAMU (orientation médicale d'urgence)"),
            String(localized: "18 — Pompiers"),
            String(localized: "01 48 94 31 00 — Centre Antipoison Animal (24h/24)"),
            String(localized: "Vétérinaire de garde — conservez le numéro local"),
            String(localized: "Clinique vétérinaire la plus proche"),
        ]
    ),
]

struct FirstAidView: View {
    @State private var expandedId: String? = nil

    var body: some View {
        List {
            headerSection

            warningBanner

            ForEach(sections) { section in
                Section {
                    DisclosureGroup(
                        isExpanded: Binding(
                            get: { expandedId == section.id },
                            set: { expanded in expandedId = expanded ? section.id : nil }
                        )
                    ) {
                        VStack(alignment: .leading, spacing: 8) {
                            ForEach(Array(section.items.enumerated()), id: \.offset) { _, item in
                                HStack(alignment: .top, spacing: 10) {
                                    Circle()
                                        .fill(section.color)
                                        .frame(width: 6, height: 6)
                                        .padding(.top, 6)
                                    Text(item)
                                        .font(.subheadline)
                                        .foregroundStyle(AppTheme.textSecondary)
                                        .fixedSize(horizontal: false, vertical: true)
                                }
                            }
                        }
                        .padding(.top, 6)
                        .padding(.bottom, 4)
                    } label: {
                        Label {
                            Text(section.title)
                                .font(.body.weight(.semibold))
                                .foregroundStyle(AppTheme.ivory)
                        } icon: {
                            Image(systemName: section.symbol)
                                .foregroundStyle(section.color)
                                .frame(width: 20)
                        }
                    }
                    .tint(AppTheme.textMuted)
                }
                .listRowBackground(AppTheme.backgroundCard)
            }

            kitSection
        }
        .listStyle(.insetGrouped)
        .scrollContentBackground(.hidden)
        .navigationTitle("Premiers secours")
        .navigationBarTitleDisplayMode(.large)
        .purrlyScreenBackground()
    }

    private var headerSection: some View {
        Section {
            VStack(spacing: 8) {
                Image(systemName: "cross.case.fill")
                    .font(.system(size: 36))
                    .foregroundStyle(Color(hex: 0xE91E63))
                Text("Guide d'urgence pour réagir rapidement en cas de problème avec votre chat")
                    .font(.footnote)
                    .foregroundStyle(AppTheme.textMuted)
                    .multilineTextAlignment(.center)
            }
            .frame(maxWidth: .infinity)
            .padding(.vertical, 12)
        }
        .listRowBackground(Color.clear)
    }

    private var warningBanner: some View {
        Section {
            HStack(alignment: .top, spacing: 12) {
                Image(systemName: "exclamationmark.triangle")
                    .foregroundStyle(AppTheme.primary)
                    .font(.system(size: 20))
                Text("Ces informations sont un guide de premiers secours et ne remplacent pas une consultation vétérinaire. En cas de doute, consultez toujours un professionnel.")
                    .font(.footnote)
                    .foregroundStyle(AppTheme.textSecondary)
                    .fixedSize(horizontal: false, vertical: true)
            }
            .padding(.vertical, 4)
        }
        .listRowBackground(AppTheme.primary.opacity(0.12))
    }

    private var kitSection: some View {
        Section("Trousse de secours recommandée") {
            ForEach([
                String(localized: "Compresses stériles"),
                String(localized: "Bandes de gaze"),
                String(localized: "Sparadrap médical"),
                String(localized: "Solution antiseptique (Bétadine)"),
                String(localized: "Sérum physiologique"),
                String(localized: "Pince à épiler"),
                String(localized: "Ciseaux à bout rond"),
                String(localized: "Collerette de protection"),
                String(localized: "Couverture de survie"),
                String(localized: "Liste des numéros d'urgence"),
            ], id: \.self) { item in
                Label(item, systemImage: "checkmark")
                    .font(.subheadline)
                    .foregroundStyle(AppTheme.textSecondary)
                    .labelStyle(.titleAndIcon)
            }
        }
        .listRowBackground(AppTheme.backgroundCard)
    }
}
