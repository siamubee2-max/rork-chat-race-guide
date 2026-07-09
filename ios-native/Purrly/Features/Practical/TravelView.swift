import SwiftUI

struct TravelView: View {
    struct CheckItem: Identifiable {
        let id: String
        let label: String
        var isChecked: Bool
    }

    struct TravelSection: Identifiable {
        let id: String
        let title: String
        let icon: String
        let color: Color
        var items: [CheckItem]
    }

    @State private var sections: [TravelSection] = [
        TravelSection(id: "docs", title: String(localized: "Documents"), icon: "doc.text.fill", color: .blue, items: [
            CheckItem(id: "passport", label: String(localized: "Passeport européen du chat"), isChecked: false),
            CheckItem(id: "vaccination", label: String(localized: "Carnet de vaccination à jour"), isChecked: false),
            CheckItem(id: "chip", label: String(localized: "Certificat de puce électronique"), isChecked: false),
            CheckItem(id: "health_cert", label: String(localized: "Certificat sanitaire (si hors UE)"), isChecked: false),
            CheckItem(id: "insurance", label: String(localized: "Attestation d'assurance"), isChecked: false),
        ]),
        TravelSection(id: "health", title: String(localized: "Santé"), icon: "cross.case.fill", color: .green, items: [
            CheckItem(id: "vet_visit", label: String(localized: "Visite vétérinaire avant départ"), isChecked: false),
            CheckItem(id: "vaccines", label: String(localized: "Vaccins à jour (rage obligatoire)"), isChecked: false),
            CheckItem(id: "antiparasite", label: String(localized: "Traitement antiparasitaire récent"), isChecked: false),
            CheckItem(id: "medications", label: String(localized: "Médicaments habituels"), isChecked: false),
            CheckItem(id: "first_aid", label: String(localized: "Trousse de premiers soins"), isChecked: false),
        ]),
        TravelSection(id: "transport", title: String(localized: "Transport"), icon: "car.fill", color: .orange, items: [
            CheckItem(id: "carrier", label: String(localized: "Caisse de transport sécurisée"), isChecked: false),
            CheckItem(id: "carrier_habit", label: String(localized: "Chat habitué à la caisse (3–7 jours avant)"), isChecked: false),
            CheckItem(id: "no_food_3h", label: String(localized: "Pas de repas 3h avant le départ"), isChecked: false),
            CheckItem(id: "harness", label: String(localized: "Harnais + laisse de sécurité"), isChecked: false),
        ]),
        TravelSection(id: "essentials", title: String(localized: "Essentiels"), icon: "bag.fill", color: .purple, items: [
            CheckItem(id: "food", label: String(localized: "Nourriture pour 3 jours minimum"), isChecked: false),
            CheckItem(id: "water_bowl", label: String(localized: "Gamelle pliable"), isChecked: false),
            CheckItem(id: "litter", label: String(localized: "Litière + bac portable"), isChecked: false),
            CheckItem(id: "toys", label: String(localized: "Jouets familiers"), isChecked: false),
            CheckItem(id: "blanket", label: String(localized: "Couverture avec odeur familière"), isChecked: false),
        ]),
    ]

    private var totalChecked: Int { sections.flatMap(\.items).filter(\.isChecked).count }
    private var totalItems: Int { sections.flatMap(\.items).count }

    var body: some View {
        ScrollView {
            VStack(spacing: 16) {
                // Progress
                GlassChrome.card(tint: AppTheme.primary.opacity(0.1)) {
                    VStack(spacing: 8) {
                        HStack {
                            Text("Préparation voyage")
                                .font(.headline)
                                .foregroundStyle(AppTheme.ivory)
                            Spacer()
                            Text("\(totalChecked)/\(totalItems)")
                                .font(.subheadline.weight(.bold))
                                .foregroundStyle(AppTheme.primary)
                        }
                        ProgressView(value: Double(totalChecked), total: Double(totalItems))
                            .tint(AppTheme.primary)
                            .scaleEffect(x: 1, y: 2)
                    }
                }

                // Reset button
                if totalChecked > 0 {
                    Button { resetAll() } label: {
                        Label("Réinitialiser", systemImage: "arrow.counterclockwise")
                            .font(.subheadline)
                            .foregroundStyle(AppTheme.textMuted)
                    }
                }

                // Sections
                ForEach(Array(sections.enumerated()), id: \.element.id) { si, section in
                    VStack(alignment: .leading, spacing: 8) {
                        HStack(spacing: 8) {
                            Image(systemName: section.icon).foregroundStyle(section.color)
                            Text(section.title)
                                .font(.headline)
                                .foregroundStyle(AppTheme.ivory)
                            let checked = section.items.filter(\.isChecked).count
                            if checked > 0 {
                                Text("\(checked)/\(section.items.count)")
                                    .font(.caption)
                                    .foregroundStyle(AppTheme.textMuted)
                            }
                        }
                        ForEach(Array(section.items.enumerated()), id: \.element.id) { ii, item in
                            Button { toggle(si: si, ii: ii) } label: {
                                HStack(spacing: 12) {
                                    Image(systemName: item.isChecked ? "checkmark.circle.fill" : "circle")
                                        .foregroundStyle(item.isChecked ? .green : AppTheme.textMuted)
                                        .font(.title3)
                                    Text(item.label)
                                        .font(.subheadline)
                                        .foregroundStyle(item.isChecked ? AppTheme.textMuted : AppTheme.ivory)
                                        .strikethrough(item.isChecked, color: AppTheme.textMuted)
                                    Spacer()
                                }
                                .padding(.horizontal, 14)
                                .padding(.vertical, 10)
                                .background(AppTheme.backgroundCard, in: RoundedRectangle(cornerRadius: 10))
                                .overlay(RoundedRectangle(cornerRadius: 10).stroke(AppTheme.border))
                            }
                        }
                    }
                }
            }
            .padding(16)
        }
        .navigationTitle("Checklist voyage")
        .navigationBarTitleDisplayMode(.inline)
        .purrlyScreenBackground()
    }

    private func toggle(si: Int, ii: Int) {
        sections[si].items[ii].isChecked.toggle()
    }

    private func resetAll() {
        for si in sections.indices {
            for ii in sections[si].items.indices {
                sections[si].items[ii].isChecked = false
            }
        }
    }
}
