import SwiftUI

struct CatDetailView: View {
    @Environment(AppEnvironment.self) private var environment
    let cat: CatProfile
    @State private var showEdit = false
    @State private var showPhotoBooth = false

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
                healthSection
            }
            .padding(20)
        }
        .purrlyScreenBackground()
        .navigationTitle(liveCat.name)
        .toolbar {
            ToolbarItem(placement: .primaryAction) {
                Button(String(localized: "common.edit")) { showEdit = true }
            }
            ToolbarItem(placement: .secondaryAction) {
                Button {
                    showPhotoBooth = true
                } label: {
                    Label("Photo Booth", systemImage: "camera.filters")
                }
            }
        }
        .sheet(isPresented: $showEdit) {
            CatFormView(cat: liveCat)
        }
        .sheet(isPresented: $showPhotoBooth) {
            CatPhotoBoothView()
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

    private var healthSection: some View {
        GlassChrome.card(tint: AppTheme.primary.opacity(0.08)) {
            VStack(alignment: .leading, spacing: 12) {
                Text("Santé & Suivi")
                    .font(.headline)
                    .foregroundStyle(AppTheme.ivory)

                NavigationLink(destination: CatHealthDashboardView(cat: liveCat)) {
                    Label("Tableau de bord santé", systemImage: "heart.text.square.fill")
                        .frame(maxWidth: .infinity, minHeight: AppTheme.minTouch)
                }
                .buttonStyle(GlassPrimaryButtonStyle())

                HStack(spacing: 10) {
                    NavigationLink(destination: WeightChartView(cat: liveCat)) {
                        Label("Poids", systemImage: "scalemass")
                            .frame(maxWidth: .infinity, minHeight: AppTheme.minTouch)
                    }
                    .buttonStyle(GlassSecondaryButtonStyle())

                    NavigationLink(destination: DailyLogsView(cat: liveCat)) {
                        Label("Logs", systemImage: "calendar.badge.plus")
                            .frame(maxWidth: .infinity, minHeight: AppTheme.minTouch)
                    }
                    .buttonStyle(GlassSecondaryButtonStyle())
                }

                NavigationLink(destination: RecordFormView(cat: liveCat)) {
                    Label("Acte médical", systemImage: "cross.case")
                        .frame(maxWidth: .infinity, minHeight: AppTheme.minTouch)
                }
                .buttonStyle(GlassSecondaryButtonStyle())
            }
        }
    }
}
