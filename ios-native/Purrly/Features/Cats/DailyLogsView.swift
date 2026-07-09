import SwiftUI

struct DailyLogsView: View {
    let cat: CatProfile
    @Environment(AppEnvironment.self) private var environment
    @State private var showForm = false

    private var live: CatProfile? { environment.cats.cats.first { $0.id == cat.id } }
    private var logs: [DailyLog] { (live ?? cat).dailyLogs.sorted { $0.date > $1.date } }

    var body: some View {
        Group {
            if logs.isEmpty {
                VStack(spacing: 16) {
                    Image(systemName: "calendar.badge.plus")
                        .font(.system(size: 52))
                        .foregroundStyle(AppTheme.textMuted)
                    Text("Aucun log")
                        .font(.headline)
                        .foregroundStyle(AppTheme.ivory)
                    Text("Suivez l'appétit, l'énergie et la litière de \(cat.name) quotidiennement.")
                        .foregroundStyle(AppTheme.textSecondary)
                        .multilineTextAlignment(.center)
                    Button { showForm = true } label: {
                        Label("Ajouter un log", systemImage: "plus")
                            .frame(minHeight: AppTheme.minTouch)
                    }.buttonStyle(GlassPrimaryButtonStyle())
                }
                .padding(32)
                .frame(maxWidth: .infinity, maxHeight: .infinity)
            } else {
                List {
                    ForEach(logs) { log in
                        LogRow(log: log)
                            .listRowBackground(AppTheme.backgroundCard)
                            .listRowSeparatorTint(AppTheme.border)
                            .swipeActions(edge: .trailing) {
                                Button(role: .destructive) { deleteLog(log) }
                                    label: { Label("Supprimer", systemImage: "trash") }
                            }
                    }
                }
                .listStyle(.plain)
                .scrollContentBackground(.hidden)
            }
        }
        .navigationTitle("Logs de \(cat.name)")
        .toolbar {
            ToolbarItem(placement: .primaryAction) {
                Button { showForm = true } label: { Image(systemName: "plus") }
                    .tint(AppTheme.primary)
            }
        }
        .sheet(isPresented: $showForm) { DailyLogFormView(cat: live ?? cat) }
        .purrlyScreenBackground()
    }

    private func deleteLog(_ log: DailyLog) {
        var updated = live ?? cat
        updated.dailyLogs.removeAll { $0.id == log.id }
        environment.cats.upsert(updated)
    }
}

private struct LogRow: View {
    let log: DailyLog
    private let statusColors: [String: Color] = [
        "normal": .green, "increased": .cyan, "playful": .cyan,
        "decreased": .orange, "lethargic": .orange, "hyperactive": .blue,
        "none": .red, "diarrhea": .red, "constipation": .orange, "blood": .red
    ]
    private let labels: [String: String] = [
        "normal": "Normal", "increased": String(localized: "↑ Augmenté"), "decreased": String(localized: "↓ Diminué"),
        "none": String(localized: "Aucun"), "playful": String(localized: "Joueur"), "lethargic": String(localized: "Léthargique"),
        "hyperactive": String(localized: "Hyperactif"), "diarrhea": String(localized: "Diarrhée"),
        "constipation": String(localized: "Constipation"), "blood": String(localized: "Sang")
    ]
    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            Text(log.date, style: .date)
                .font(.caption.weight(.bold))
                .foregroundStyle(AppTheme.textMuted)
            HStack(spacing: 12) {
                chip("🍽", labels[log.appetite] ?? log.appetite, statusColors[log.appetite] ?? .gray)
                chip("💧", labels[log.water] ?? log.water, statusColors[log.water] ?? .gray)
                chip("⚡️", labels[log.energy] ?? log.energy, statusColors[log.energy] ?? .gray)
                chip("🪣", labels[log.litter] ?? log.litter, statusColors[log.litter] ?? .gray)
            }
            if !log.notes.isEmpty {
                Text(log.notes)
                    .font(.caption)
                    .foregroundStyle(AppTheme.textMuted)
            }
        }
        .padding(.vertical, 4)
    }
    private func chip(_ icon: String, _ label: String, _ color: Color) -> some View {
        HStack(spacing: 3) {
            Text(icon).font(.caption2)
            Text(label).font(.caption2.weight(.semibold)).foregroundStyle(color)
        }
    }
}
