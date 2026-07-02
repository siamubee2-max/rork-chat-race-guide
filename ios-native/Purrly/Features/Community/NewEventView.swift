import SwiftUI

struct NewEventView: View {
    @Environment(AppEnvironment.self) private var environment
    @Environment(\.dismiss) private var dismiss

    @State private var title = ""
    @State private var description = ""
    @State private var type = "meetup"
    @State private var date = Date()
    @State private var location = ""
    @State private var address = ""
    @State private var maxAttendees = "20"
    @State private var price = ""
    @State private var errorMessage: String?

    private let types: [(String, String)] = [
        ("meetup",   "🐱 Rencontre"),
        ("adoption", "🏠 Adoption"),
        ("show",     "🏆 Exposition"),
        ("workshop", "📚 Atelier"),
        ("charity",  "❤️ Caritatif"),
    ]

    var body: some View {
        NavigationStack {
            Form {
                Section("Type d'événement") {
                    Picker("Type", selection: $type) {
                        ForEach(types, id: \.0) { t in
                            Text(t.1).tag(t.0)
                        }
                    }
                }
                .listRowBackground(AppTheme.backgroundCard)

                Section("Détails") {
                    TextField("Titre", text: $title)
                    TextField("Description", text: $description, axis: .vertical)
                        .lineLimit(3...5)
                    DatePicker("Date", selection: $date, displayedComponents: [.date, .hourAndMinute])
                        .tint(AppTheme.primary)
                }
                .listRowBackground(AppTheme.backgroundCard)

                Section("Lieu") {
                    TextField("Nom du lieu", text: $location)
                    TextField("Adresse complète", text: $address)
                }
                .listRowBackground(AppTheme.backgroundCard)

                Section("Participants") {
                    TextField("Max participants", text: $maxAttendees)
                        .keyboardType(.numberPad)
                    TextField("Prix (optionnel, en €)", text: $price)
                        .keyboardType(.decimalPad)
                }
                .listRowBackground(AppTheme.backgroundCard)

                if let err = errorMessage {
                    Section {
                        Text(err)
                            .foregroundStyle(AppTheme.error)
                            .font(.footnote)
                    }
                    .listRowBackground(AppTheme.backgroundCard)
                }
            }
            .scrollContentBackground(.hidden)
            .background(AppTheme.background)
            .foregroundStyle(AppTheme.ivory)
            .tint(AppTheme.primary)
            .navigationTitle("Créer un événement")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button("Annuler") { dismiss() }
                        .foregroundStyle(AppTheme.textMuted)
                }
                ToolbarItem(placement: .confirmationAction) {
                    Button("Créer") { submit() }
                        .tint(AppTheme.primary)
                }
            }
        }
    }

    // MARK: - Actions

    private func submit() {
        let trimmedTitle = title.trimmingCharacters(in: .whitespaces)
        guard !trimmedTitle.isEmpty else {
            errorMessage = "Le titre est requis."
            return
        }
        guard !location.trimmingCharacters(in: .whitespaces).isEmpty else {
            errorMessage = "Le lieu est requis."
            return
        }
        errorMessage = nil

        let isoFmt = ISO8601DateFormatter()
        isoFmt.formatOptions = [.withFullDate]
        let dateStr = isoFmt.string(from: date)

        let cal = Calendar.current
        let h = cal.component(.hour, from: date)
        let m = cal.component(.minute, from: date)
        let timeStr = String(format: "%02d:%02d", h, m)

        let event = CommunityEvent(
            id: UUID().uuidString,
            title: trimmedTitle,
            description: description.trimmingCharacters(in: .whitespacesAndNewlines),
            date: dateStr,
            time: timeStr,
            location: location.trimmingCharacters(in: .whitespaces),
            address: address.trimmingCharacters(in: .whitespacesAndNewlines),
            type: type,
            maxAttendees: Int(maxAttendees) ?? 20,
            price: price.trimmingCharacters(in: .whitespaces),
            attendees: [],
            createdAt: Date()
        )
        environment.community.addEvent(event)
        dismiss()
    }
}
