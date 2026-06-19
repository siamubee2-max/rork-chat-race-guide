import SwiftUI

struct CatFormView: View {
    @Environment(\.dismiss) private var dismiss
    @Environment(AppEnvironment.self) private var environment

    let cat: CatProfile?

    @State private var name = ""
    @State private var breedId: String?
    @State private var microchip = ""
    @State private var notes = ""

    var body: some View {
        NavigationStack {
            Form {
                Section {
                    TextField(String(localized: "cats.name"), text: $name)
                    Picker(String(localized: "cats.breed"), selection: $breedId) {
                        Text(String(localized: "cats.mixed")).tag(String?.none)
                        ForEach(environment.breeds.breeds) { breed in
                            Text(breed.name).tag(Optional(breed.id))
                        }
                    }
                    TextField(String(localized: "cats.chip"), text: $microchip)
                        .keyboardType(.numberPad)
                    TextField(String(localized: "cats.notes"), text: $notes, axis: .vertical)
                }
            }
            .scrollContentBackground(.hidden)
            .purrlyScreenBackground()
            .navigationTitle(cat == nil ? String(localized: "cats.add") : String(localized: "common.edit"))
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button(String(localized: "common.cancel")) { dismiss() }
                }
                ToolbarItem(placement: .confirmationAction) {
                    Button(String(localized: "common.save")) { save() }
                        .disabled(name.trimmingCharacters(in: .whitespaces).isEmpty)
                }
            }
            .onAppear(perform: populate)
        }
    }

    private func populate() {
        environment.breeds.loadIfNeeded()
        guard let cat else { return }
        name = cat.name
        breedId = cat.breedId
        microchip = cat.microchip
        notes = cat.notes ?? ""
    }

    private func save() {
        var profile = cat ?? CatProfile.empty(name: name.trimmingCharacters(in: .whitespaces))
        profile.name = name.trimmingCharacters(in: .whitespaces)
        profile.breedId = breedId
        profile.microchip = microchip
        profile.notes = notes.isEmpty ? nil : notes
        environment.cats.upsert(profile)
        dismiss()
    }
}
