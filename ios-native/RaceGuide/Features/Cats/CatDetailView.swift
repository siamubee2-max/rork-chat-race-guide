import SwiftUI

struct CatDetailView: View {
    @Environment(AppEnvironment.self) private var environment
    let cat: CatProfile
    @State private var showEdit = false

    private var liveCat: CatProfile {
        environment.cats.cats.first { $0.id == cat.id } ?? cat
    }

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 16) {
                GlassChrome.card(tint: AppTheme.primary.opacity(0.2), interactive: true) {
                    VStack(alignment: .leading, spacing: 8) {
                        Text(liveCat.name)
                            .font(.title.weight(.bold))
                            .foregroundStyle(AppTheme.ivory)
                        if let breed = environment.breeds.breed(id: liveCat.breedId) {
                            Text(breed.name).foregroundStyle(AppTheme.primary)
                        }
                        if !liveCat.microchip.isEmpty {
                            Text("\(String(localized: "cats.chip")): \(liveCat.microchip)")
                                .font(.caption)
                                .foregroundStyle(AppTheme.textMuted)
                        }
                        if let notes = liveCat.notes, !notes.isEmpty {
                            Text(notes)
                                .font(.subheadline)
                                .foregroundStyle(AppTheme.textSecondary)
                        }
                    }
                }

                recordsSection
            }
            .padding(20)
        }
        .purrlyScreenBackground()
        .navigationTitle(liveCat.name)
        .toolbar {
            ToolbarItem(placement: .primaryAction) {
                Button(String(localized: "common.edit")) { showEdit = true }
            }
        }
        .sheet(isPresented: $showEdit) {
            CatFormView(cat: liveCat)
        }
    }

    private var recordsSection: some View {
        GlassChrome.card {
            VStack(alignment: .leading, spacing: 8) {
                Text(String(localized: "cats.health"))
                    .font(.headline)
                    .foregroundStyle(AppTheme.ivory)
                if liveCat.medicalRecords.isEmpty {
                    Text(String(localized: "cats.noRecords"))
                        .foregroundStyle(AppTheme.textMuted)
                } else {
                    ForEach(liveCat.medicalRecords) { record in
                        HStack {
                            Text(record.title)
                                .foregroundStyle(AppTheme.ivory)
                            Spacer()
                            Text(record.date)
                                .font(.caption)
                                .foregroundStyle(AppTheme.textMuted)
                        }
                    }
                }
            }
        }
    }
}
