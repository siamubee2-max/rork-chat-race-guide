import SwiftUI
import Charts

struct CatHealthDashboardView: View {
    let cat: CatProfile
    @Environment(AppEnvironment.self) private var environment

    private var liveCat: CatProfile {
        environment.cats.cats.first { $0.id == cat.id } ?? cat
    }

    var body: some View {
        ScrollView {
            VStack(spacing: 20) {
                weightCard

                if !liveCat.medicalRecords.isEmpty {
                    recordsCard
                }

                quickActions
            }
            .padding(16)
        }
        .navigationTitle("Santé de \(liveCat.name)")
        .navigationBarTitleDisplayMode(.inline)
        .purrlyScreenBackground()
    }

    private var weightCard: some View {
        GlassChrome.card(tint: AppTheme.primary.opacity(0.1)) {
            VStack(alignment: .leading, spacing: 12) {
                Text("Suivi du poids")
                    .font(.headline)
                    .foregroundStyle(AppTheme.ivory)

                if liveCat.weightHistory.isEmpty {
                    Text("Aucun poids enregistré")
                        .foregroundStyle(AppTheme.textMuted)
                        .font(.subheadline)
                } else {
                    let sorted = liveCat.weightHistory.sorted { $0.date > $1.date }
                    if let latest = sorted.first {
                        HStack {
                            Text("\(latest.weight, specifier: "%.1f") \(latest.unit)")
                                .font(.title.weight(.bold))
                                .foregroundStyle(AppTheme.primary)
                            Spacer()
                            Text(latest.date)
                                .font(.caption)
                                .foregroundStyle(AppTheme.textMuted)
                        }
                    }

                    if liveCat.weightHistory.count > 1 {
                        let chartData = liveCat.weightHistory
                            .sorted { $0.date < $1.date }
                            .suffix(8)
                        Chart(Array(chartData)) { entry in
                            LineMark(
                                x: .value("Date", entry.date),
                                y: .value("Kg", entry.weight)
                            )
                            .foregroundStyle(AppTheme.primary)
                            PointMark(
                                x: .value("Date", entry.date),
                                y: .value("Kg", entry.weight)
                            )
                            .foregroundStyle(AppTheme.primary)
                        }
                        .frame(height: 120)
                        .chartXAxis(.hidden)
                    }
                }

                NavigationLink(value: CatRoute.weightForm(liveCat)) {
                    Label("Ajouter un poids", systemImage: "plus")
                        .frame(maxWidth: .infinity, minHeight: AppTheme.minTouch)
                }
                .buttonStyle(GlassPrimaryButtonStyle())
            }
        }
    }

    private var recordsCard: some View {
        GlassChrome.card {
            VStack(alignment: .leading, spacing: 10) {
                Text("Carnet de santé")
                    .font(.headline)
                    .foregroundStyle(AppTheme.ivory)

                ForEach(liveCat.medicalRecords.prefix(3)) { record in
                    HStack(spacing: 10) {
                        Image(systemName: record.type == .vaccine ? "syringe.fill" : "cross.case.fill")
                            .foregroundStyle(AppTheme.primary)
                            .frame(width: 24)
                        VStack(alignment: .leading, spacing: 2) {
                            Text(record.title)
                                .font(.subheadline.weight(.semibold))
                                .foregroundStyle(AppTheme.ivory)
                            Text(record.date)
                                .font(.caption)
                                .foregroundStyle(AppTheme.textMuted)
                        }
                        Spacer()
                    }
                }

                NavigationLink(value: CatRoute.recordForm(liveCat)) {
                    Text("Ajouter un acte médical")
                        .font(.subheadline)
                        .foregroundStyle(AppTheme.primary)
                }
            }
        }
    }

    private var quickActions: some View {
        VStack(spacing: 12) {
            NavigationLink(value: CatRoute.dailyLogs(liveCat)) {
                Label("Logs quotidiens", systemImage: "calendar.badge.plus")
                    .frame(maxWidth: .infinity, minHeight: AppTheme.minTouch)
            }
            .buttonStyle(GlassPrimaryButtonStyle())

            NavigationLink(value: CatRoute.weightChart(liveCat)) {
                Label("Suivi du poids", systemImage: "scalemass")
                    .frame(maxWidth: .infinity, minHeight: AppTheme.minTouch)
            }
            .buttonStyle(GlassPrimaryButtonStyle())

            NavigationLink(value: CatRoute.recordForm(liveCat)) {
                Label("Nouveau dossier médical", systemImage: "cross.case")
                    .frame(maxWidth: .infinity, minHeight: AppTheme.minTouch)
            }
            .buttonStyle(GlassPrimaryButtonStyle())

            NavigationLink(value: CatRoute.weightForm(liveCat)) {
                Label("Enregistrer un poids", systemImage: "scalemass")
                    .frame(maxWidth: .infinity, minHeight: AppTheme.minTouch)
            }
            .buttonStyle(GlassPrimaryButtonStyle())
        }
    }
}
