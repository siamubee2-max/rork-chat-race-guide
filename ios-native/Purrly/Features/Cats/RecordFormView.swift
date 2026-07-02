import SwiftUI

struct RecordFormView: View {
    let cat: CatProfile
    @Environment(AppEnvironment.self) private var environment
    @Environment(\.dismiss) private var dismiss
    @State private var type: MedicalRecordType = .vaccine
    @State private var title = ""
    @State private var date = Date()
    @State private var nextDueDate: Date? = nil
    @State private var showNextDue = false
    @State private var notes = ""
    @State private var vetName = ""
    @State private var error: String?

    var body: some View {
        NavigationStack {
            Form {
                Section("Type") {
                    Picker("Type", selection: $type) {
                        ForEach(MedicalRecordType.allCases, id: \.self) { t in
                            Text(t.rawValue.capitalized).tag(t)
                        }
                    }
                }
                .listRowBackground(AppTheme.backgroundCard)

                Section("Détails") {
                    TextField("Titre (ex: Vaccin rage)", text: $title)
                    DatePicker("Date", selection: $date, displayedComponents: .date)
                        .tint(AppTheme.primary)
                    Toggle("Prochaine échéance", isOn: $showNextDue)
                    if showNextDue {
                        DatePicker(
                            "Prochaine visite",
                            selection: Binding(
                                get: { nextDueDate ?? Date().addingTimeInterval(86400 * 365) },
                                set: { nextDueDate = $0 }
                            ),
                            displayedComponents: .date
                        )
                        .tint(AppTheme.primary)
                    }
                    TextField("Vétérinaire (optionnel)", text: $vetName)
                }
                .listRowBackground(AppTheme.backgroundCard)

                Section("Notes") {
                    TextField("Notes", text: $notes, axis: .vertical)
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
            .navigationTitle("Acte médical")
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
        guard !title.trimmingCharacters(in: .whitespaces).isEmpty else {
            error = "Titre requis."
            return
        }
        let record = MedicalRecord(
            id: UUID().uuidString,
            type: type,
            title: title,
            date: ISO8601DateFormatter().string(from: date),
            nextDueDate: showNextDue
                ? ISO8601DateFormatter().string(from: nextDueDate ?? Date())
                : nil,
            notes: notes.isEmpty ? nil : notes,
            vetName: vetName.isEmpty ? nil : vetName
        )
        var updated = cat
        updated.medicalRecords.append(record)
        environment.cats.upsert(updated)
        dismiss()
    }
}
