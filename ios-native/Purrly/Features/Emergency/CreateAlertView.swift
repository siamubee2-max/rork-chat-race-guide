import SwiftUI

struct CreateAlertView: View {
    @Environment(AppEnvironment.self) private var environment
    @Environment(\.dismiss) private var dismiss

    @State private var type: EmergencyType = .lost
    @State private var catName = ""
    @State private var location = ""
    @State private var description = ""
    @State private var contactPhone = ""
    @State private var errorMessage: String?

    var body: some View {
        NavigationStack {
            Form {
                Section(String(localized: "emergency.form.type")) {
                    Picker("Type", selection: $type) {
                        ForEach(EmergencyType.allCases, id: \.self) { t in
                            Text(t.label).tag(t)
                        }
                    }
                    .pickerStyle(.segmented)
                }
                .listRowBackground(AppTheme.backgroundCard)

                Section(String(localized: "emergency.form.info")) {
                    TextField(String(localized: "emergency.form.catName"), text: $catName)
                        .accessibilityIdentifier("alertCatNameField")
                    TextField(String(localized: "emergency.form.location"), text: $location)
                        .accessibilityIdentifier("alertLocationField")
                    TextField(String(localized: "emergency.form.description"), text: $description, axis: .vertical)
                        .lineLimit(3...6)
                    TextField(String(localized: "emergency.form.phone"), text: $contactPhone)
                        .keyboardType(.phonePad)
                }
                .listRowBackground(AppTheme.backgroundCard)

                if let err = errorMessage {
                    Section {
                        Text(err).foregroundStyle(AppTheme.error).font(.footnote)
                    }
                    .listRowBackground(AppTheme.backgroundCard)
                }
            }
            .scrollContentBackground(.hidden)
            .background(AppTheme.background)
            .navigationTitle(String(localized: "emergency.createAlert"))
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button(String(localized: "common.cancel")) { dismiss() }
                }
                ToolbarItem(placement: .confirmationAction) {
                    Button(String(localized: "common.publish")) { submit() }
                        .tint(AppTheme.primary)
                        .accessibilityIdentifier("publishAlertButton")
                }
            }
        }
    }

    private func submit() {
        let trimmedName = catName.trimmingCharacters(in: .whitespaces)
        let trimmedLocation = location.trimmingCharacters(in: .whitespaces)
        guard !trimmedName.isEmpty else {
            errorMessage = String(localized: "emergency.error.catNameRequired")
            return
        }
        guard !trimmedLocation.isEmpty else {
            errorMessage = String(localized: "emergency.error.locationRequired")
            return
        }
        environment.emergency.add(EmergencyAlert.create(
            type: type, catName: trimmedName, location: trimmedLocation,
            description: description, contactPhone: contactPhone))
        dismiss()
    }
}
