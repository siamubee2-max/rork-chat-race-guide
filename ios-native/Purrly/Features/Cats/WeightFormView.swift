import SwiftUI

struct WeightFormView: View {
    let cat: CatProfile
    @Environment(AppEnvironment.self) private var environment
    @Environment(\.dismiss) private var dismiss
    @State private var weightText = ""
    @State private var unit = "kg"
    @State private var date = Date()
    @State private var notes = ""
    @State private var error: String?

    var body: some View {
        NavigationStack {
            Form {
                Section("Poids") {
                    HStack {
                        TextField("0.0", text: $weightText)
                            .keyboardType(.decimalPad)
                        Picker("Unité", selection: $unit) {
                            Text("kg").tag("kg")
                            Text("lbs").tag("lbs")
                        }
                        .pickerStyle(.segmented)
                        .frame(width: 120)
                    }
                    DatePicker("Date", selection: $date, displayedComponents: .date)
                        .tint(AppTheme.primary)
                }
                .listRowBackground(AppTheme.backgroundCard)

                Section("Notes") {
                    TextField("Optionnel", text: $notes, axis: .vertical)
                        .lineLimit(2...4)
                }
                .listRowBackground(AppTheme.backgroundCard)

                if let e = error {
                    Section {
                        Text(e)
                            .foregroundStyle(AppTheme.error)
                            .font(.footnote)
                    }
                    .listRowBackground(AppTheme.backgroundCard)
                }
            }
            .scrollContentBackground(.hidden)
            .background(AppTheme.background)
            .navigationTitle("Ajouter un poids")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button("Annuler") { dismiss() }
                }
                ToolbarItem(placement: .confirmationAction) {
                    Button("Enregistrer") { save() }
                        .tint(AppTheme.primary)
                }
            }
        }
    }

    private func save() {
        let cleaned = weightText.replacingOccurrences(of: ",", with: ".")
        guard let weight = Double(cleaned), weight > 0 else {
            error = "Poids invalide."
            return
        }
        let entry = WeightEntry(
            id: UUID().uuidString,
            date: ISO8601DateFormatter().string(from: date),
            weight: weight,
            unit: unit,
            notes: notes.isEmpty ? nil : notes
        )
        var updated = cat
        updated.weightHistory.append(entry)
        environment.cats.upsert(updated)
        dismiss()
    }
}
