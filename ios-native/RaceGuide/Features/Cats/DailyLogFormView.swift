import SwiftUI

struct DailyLogFormView: View {
    let cat: CatProfile
    @Environment(AppEnvironment.self) private var environment
    @Environment(\.dismiss) private var dismiss

    @State private var appetite = "normal"
    @State private var water = "normal"
    @State private var energy = "normal"
    @State private var litter = "normal"
    @State private var notes = ""

    let appetiteOptions = [("normal","Normal"),("increased","↑ Augmenté"),("decreased","↓ Diminué"),("none","Aucun")]
    let waterOptions = [("normal","Normal"),("increased","↑ Augmenté"),("decreased","↓ Diminué"),("none","Aucune")]
    let energyOptions = [("normal","Normal"),("playful","Joueur"),("lethargic","Léthargique"),("hyperactive","Hyperactif")]
    let litterOptions = [("normal","Normal"),("diarrhea","Diarrhée"),("constipation","Constipation"),("blood","Sang"),("none","Aucun")]

    var body: some View {
        NavigationStack {
            Form {
                segmentSection("🍽 Appétit", binding: $appetite, options: appetiteOptions)
                segmentSection("💧 Eau", binding: $water, options: waterOptions)
                segmentSection("⚡️ Énergie", binding: $energy, options: energyOptions)
                segmentSection("🪣 Litière", binding: $litter, options: litterOptions)
                Section("Notes") {
                    TextField("Observations…", text: $notes, axis: .vertical)
                        .lineLimit(2...4)
                }.listRowBackground(AppTheme.backgroundCard)
            }
            .scrollContentBackground(.hidden)
            .background(AppTheme.background)
            .navigationTitle("Log du jour")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button("Annuler") { dismiss() }
                }
                ToolbarItem(placement: .confirmationAction) {
                    Button("Enregistrer") { save() }.tint(AppTheme.primary)
                }
            }
        }
    }

    @ViewBuilder
    private func segmentSection(_ title: String, binding: Binding<String>, options: [(String, String)]) -> some View {
        Section(title) {
            Picker(title, selection: binding) {
                ForEach(options, id: \.0) { opt in Text(opt.1).tag(opt.0) }
            }.pickerStyle(.menu)
        }.listRowBackground(AppTheme.backgroundCard)
    }

    private func save() {
        let log = DailyLog.create(appetite: appetite, water: water, energy: energy, litter: litter, notes: notes)
        var updated = cat
        updated.dailyLogs.append(log)
        environment.cats.upsert(updated)
        dismiss()
    }
}
