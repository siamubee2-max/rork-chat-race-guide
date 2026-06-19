import SwiftUI
import Charts

struct WeightChartView: View {
    let cat: CatProfile
    @Environment(AppEnvironment.self) private var environment
    @State private var showForm = false

    private var live: CatProfile? { environment.cats.cats.first { $0.id == cat.id } }
    private var weights: [WeightEntry] {
        (live ?? cat).weightHistory.sorted { $0.date < $1.date }
    }

    var body: some View {
        ScrollView {
            VStack(spacing: 20) {
                if weights.isEmpty {
                    emptyState
                } else {
                    chartCard
                    weightList
                }
                Button { showForm = true } label: {
                    Label("Ajouter un poids", systemImage: "plus")
                        .frame(maxWidth: .infinity, minHeight: AppTheme.minTouch)
                }.buttonStyle(GlassPrimaryButtonStyle())
            }
            .padding(16)
        }
        .navigationTitle("Poids de \(cat.name)")
        .navigationBarTitleDisplayMode(.inline)
        .sheet(isPresented: $showForm) { WeightFormView(cat: live ?? cat) }
        .purrlyScreenBackground()
    }

    private var emptyState: some View {
        VStack(spacing: 12) {
            Image(systemName: "scalemass")
                .font(.system(size: 52))
                .foregroundStyle(AppTheme.textMuted)
            Text("Aucune pesée")
                .font(.headline)
                .foregroundStyle(AppTheme.ivory)
            Text("Enregistrez régulièrement le poids pour détecter des variations.")
                .foregroundStyle(AppTheme.textSecondary)
                .multilineTextAlignment(.center)
        }.padding(32)
    }

    private var chartCard: some View {
        GlassChrome.card(tint: AppTheme.primary.opacity(0.1)) {
            VStack(alignment: .leading, spacing: 12) {
                if let latest = weights.last {
                    HStack {
                        Text("\(latest.weight, specifier: "%.1f") \(latest.unit)")
                            .font(.title.weight(.bold))
                            .foregroundStyle(AppTheme.primary)
                        Spacer()
                        if weights.count > 1, let prev = weights.dropLast().last {
                            let diff = latest.weight - prev.weight
                            Label(String(format: "%+.1f", diff),
                                  systemImage: diff >= 0 ? "arrow.up" : "arrow.down")
                                .font(.caption.weight(.semibold))
                                .foregroundStyle(diff == 0 ? AppTheme.textMuted
                                                 : (diff > 0 ? Color.orange : Color.green))
                        }
                    }
                }
                Chart(weights) { entry in
                    LineMark(x: .value("Date", entry.date), y: .value("kg", entry.weight))
                        .foregroundStyle(AppTheme.primary)
                        .interpolationMethod(.catmullRom)
                    AreaMark(x: .value("Date", entry.date), y: .value("kg", entry.weight))
                        .foregroundStyle(AppTheme.primary.opacity(0.15))
                    PointMark(x: .value("Date", entry.date), y: .value("kg", entry.weight))
                        .foregroundStyle(AppTheme.primary)
                }
                .frame(height: 160)
                .chartXAxis(.hidden)
                .chartYAxis {
                    AxisMarks { AxisValueLabel().foregroundStyle(AppTheme.textMuted) }
                }
            }
        }
    }

    private var weightList: some View {
        VStack(alignment: .leading, spacing: 8) {
            Text("Historique")
                .font(.headline)
                .foregroundStyle(AppTheme.ivory)
            ForEach(weights.reversed().prefix(10)) { entry in
                HStack {
                    Text(entry.date)
                        .font(.caption)
                        .foregroundStyle(AppTheme.textMuted)
                    Spacer()
                    Text("\(entry.weight, specifier: "%.1f") \(entry.unit)")
                        .font(.subheadline.weight(.semibold))
                        .foregroundStyle(AppTheme.ivory)
                }
                .padding(.horizontal, 14)
                .padding(.vertical, 8)
                .background(AppTheme.backgroundCard, in: RoundedRectangle(cornerRadius: 10))
            }
        }
    }
}
