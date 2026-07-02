import SwiftUI

struct ReminderFormView: View {
    @Environment(AppEnvironment.self) private var environment
    @Environment(\.dismiss) private var dismiss

    @State private var title = ""
    @State private var date = Date()
    @State private var frequency: ReminderFrequency = .once
    @State private var selectedCatId: String? = nil
    @State private var notes = ""
    @State private var showError = false

    var body: some View {
        NavigationStack {
            Form {
                Section("Titre") {
                    TextField("Ex: Vaccin antirabique", text: $title)
                        .foregroundStyle(AppTheme.ivory)
                }
                .listRowBackground(AppTheme.backgroundCard)

                Section("Date & Fréquence") {
                    DatePicker("Date", selection: $date, displayedComponents: [.date])
                        .tint(AppTheme.primary)
                        .foregroundStyle(AppTheme.ivory)

                    Picker("Fréquence", selection: $frequency) {
                        ForEach(ReminderFrequency.allCases, id: \.self) { freq in
                            Text(freq.label).tag(freq)
                        }
                    }
                    .tint(AppTheme.primary)
                    .foregroundStyle(AppTheme.ivory)
                }
                .listRowBackground(AppTheme.backgroundCard)

                if !environment.cats.cats.isEmpty {
                    Section("Chat (optionnel)") {
                        Picker("Chat", selection: $selectedCatId) {
                            Text("Aucun").tag(String?.none)
                            ForEach(environment.cats.cats) { cat in
                                Text(cat.name).tag(Optional(cat.id))
                            }
                        }
                        .tint(AppTheme.primary)
                        .foregroundStyle(AppTheme.ivory)
                    }
                    .listRowBackground(AppTheme.backgroundCard)
                }

                Section("Notes (optionnel)") {
                    TextField("Notes", text: $notes, axis: .vertical)
                        .lineLimit(2...4)
                        .foregroundStyle(AppTheme.ivory)
                }
                .listRowBackground(AppTheme.backgroundCard)

                if showError {
                    Section {
                        Text("Le titre est obligatoire.")
                            .foregroundStyle(AppTheme.error)
                            .font(.footnote)
                    }
                    .listRowBackground(AppTheme.backgroundCard)
                }
            }
            .scrollContentBackground(.hidden)
            .background(AppTheme.background)
            .navigationTitle("Nouveau rappel")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button("Annuler") { dismiss() }
                        .foregroundStyle(AppTheme.textMuted)
                }
                ToolbarItem(placement: .confirmationAction) {
                    Button("Ajouter") { submit() }
                        .tint(AppTheme.primary)
                }
            }
        }
    }

    private func submit() {
        let trimmed = title.trimmingCharacters(in: .whitespaces)
        guard !trimmed.isEmpty else { showError = true; return }
        environment.reminders.add(
            Reminder.create(title: trimmed, date: date, frequency: frequency, catId: selectedCatId, notes: notes)
        )
        dismiss()
    }
}
