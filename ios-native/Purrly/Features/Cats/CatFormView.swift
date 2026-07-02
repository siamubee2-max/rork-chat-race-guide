import SwiftUI
import PhotosUI

struct CatFormView: View {
    @Environment(\.dismiss) private var dismiss
    @Environment(AppEnvironment.self) private var environment

    let cat: CatProfile?

    @State private var name = ""
    @State private var breedId: String?
    @State private var microchip = ""
    @State private var notes = ""

    @State private var pickerItem: PhotosPickerItem?
    @State private var photo: UIImage?

    var body: some View {
        NavigationStack {
            Form {
                Section {
                    PhotosPicker(selection: $pickerItem, matching: .images) {
                        HStack(spacing: 14) {
                            ZStack {
                                RoundedRectangle(cornerRadius: 16)
                                    .fill(AppTheme.backgroundSecondary)
                                    .frame(width: 64, height: 64)
                                if let photo {
                                    Image(uiImage: photo)
                                        .resizable()
                                        .scaledToFill()
                                        .frame(width: 64, height: 64, alignment: .top)
                                        .clipShape(RoundedRectangle(cornerRadius: 16))
                                } else {
                                    Image(systemName: "camera.fill")
                                        .foregroundStyle(AppTheme.textMuted)
                                }
                            }
                            Text(photo == nil ? "Ajouter une photo" : "Changer la photo")
                                .foregroundStyle(AppTheme.primary)
                        }
                    }
                }
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
                        .accessibilityIdentifier("saveCatButton")
                }
            }
            .onAppear(perform: populate)
            .onChange(of: pickerItem) { _, item in
                Task {
                    guard let data = try? await item?.loadTransferable(type: Data.self),
                          let img = UIImage(data: data) else { return }
                    photo = img
                }
            }
        }
    }

    private func populate() {
        environment.breeds.loadIfNeeded()
        guard let cat else { return }
        name = cat.name
        breedId = cat.breedId
        microchip = cat.microchip
        notes = cat.notes ?? ""
        photo = CatImageStore.load(cat.imageUri)
    }

    private func save() {
        var profile = cat ?? CatProfile.empty(name: name.trimmingCharacters(in: .whitespaces))
        profile.name = name.trimmingCharacters(in: .whitespaces)
        profile.breedId = breedId
        profile.microchip = microchip
        profile.notes = notes.isEmpty ? nil : notes
        // Persiste la photo comme fichier ; imageUri ne contient que le nom de fichier.
        if let photo {
            profile.imageUri = CatImageStore.save(photo, catId: profile.id)
        }
        environment.cats.upsert(profile)
        dismiss()
    }
}
