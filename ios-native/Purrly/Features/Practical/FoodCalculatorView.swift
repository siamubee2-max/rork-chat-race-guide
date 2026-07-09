import SwiftUI

struct FoodCalculatorView: View {
    enum ActivityLevel: String, CaseIterable {
        case low = "low", normal = "normal", high = "high"
        var label: String {
            switch self {
            case .low: String(localized: "Peu actif")
            case .normal: "Normal"
            case .high: String(localized: "Très actif")
            }
        }
        var multiplier: Double {
            switch self {
            case .low: 0.9
            case .normal: 1.0
            case .high: 1.2
            }
        }
        var icon: String {
            switch self {
            case .low: "heart"
            case .normal: "figure.walk"
            case .high: "bolt.fill"
            }
        }
    }

    enum LifeStage: String, CaseIterable {
        case kitten, adult, senior, pregnant
        var label: String {
            switch self {
            case .kitten: String(localized: "Chaton (< 1 an)")
            case .adult: String(localized: "Adulte (1–7 ans)")
            case .senior: String(localized: "Senior (> 7 ans)")
            case .pregnant: String(localized: "Gestante/Allaitante")
            }
        }
        var multiplier: Double {
            switch self {
            case .kitten: 1.5
            case .adult: 1.0
            case .senior: 0.85
            case .pregnant: 1.5
            }
        }
        var description: String {
            switch self {
            case .kitten: String(localized: "Besoins élevés pour la croissance")
            case .adult: String(localized: "Besoins standards")
            case .senior: String(localized: "Métabolisme ralenti")
            case .pregnant: String(localized: "Besoins énergétiques accrus")
            }
        }
    }

    @State private var weight = ""
    @State private var activity: ActivityLevel = .normal
    @State private var lifeStage: LifeStage = .adult
    @State private var isNeutered = true

    private struct CalcResult {
        let calories: Int
        let dryFood: Int
        let wetFood: Int
        let water: Int
    }

    private var result: CalcResult? {
        guard let w = Double(weight.replacingOccurrences(of: ",", with: ".")), w > 0 else { return nil }
        let base = 70 * pow(w, 0.75)
        let cal = Int(base * activity.multiplier * lifeStage.multiplier * (isNeutered ? 0.9 : 1.0))
        return CalcResult(
            calories: cal,
            dryFood: Int(Double(cal) / 3.5),
            wetFood: Int(Double(cal) / 0.85),
            water: Int(w * 50)
        )
    }

    var body: some View {
        ScrollView {
            VStack(spacing: 20) {
                // Input card
                GlassChrome.card {
                    VStack(spacing: 14) {
                        HStack {
                            Text("Poids du chat")
                                .foregroundStyle(AppTheme.ivory)
                                .font(.subheadline)
                            Spacer()
                            HStack(spacing: 6) {
                                TextField("ex: 4.5", text: $weight)
                                    .keyboardType(.decimalPad)
                                    .frame(width: 70)
                                    .multilineTextAlignment(.trailing)
                                    .foregroundStyle(AppTheme.ivory)
                                Text("kg").foregroundStyle(AppTheme.textMuted)
                            }
                        }
                        Divider().background(AppTheme.border)
                        Toggle("Stérilisé(e)", isOn: $isNeutered)
                            .tint(AppTheme.primary)
                            .foregroundStyle(AppTheme.ivory)
                            .font(.subheadline)
                    }
                }

                // Activity level
                VStack(alignment: .leading, spacing: 8) {
                    Text("Niveau d'activité")
                        .font(.headline)
                        .foregroundStyle(AppTheme.ivory)
                    HStack(spacing: 10) {
                        ForEach(ActivityLevel.allCases, id: \.self) { level in
                            Button { activity = level } label: {
                                VStack(spacing: 6) {
                                    Image(systemName: level.icon).font(.title2)
                                    Text(level.label).font(.caption2.weight(.semibold))
                                }
                                .frame(maxWidth: .infinity)
                                .padding(.vertical, 12)
                                .background(
                                    activity == level ? AppTheme.primary : AppTheme.backgroundCard,
                                    in: RoundedRectangle(cornerRadius: 12)
                                )
                                .foregroundStyle(
                                    activity == level ? AppTheme.background : AppTheme.textSecondary
                                )
                            }
                        }
                    }
                }

                // Life stage
                VStack(alignment: .leading, spacing: 8) {
                    Text("Stade de vie")
                        .font(.headline)
                        .foregroundStyle(AppTheme.ivory)
                    ForEach(LifeStage.allCases, id: \.self) { stage in
                        Button { lifeStage = stage } label: {
                            HStack {
                                VStack(alignment: .leading, spacing: 2) {
                                    Text(stage.label)
                                        .font(.subheadline.weight(.semibold))
                                        .foregroundStyle(lifeStage == stage ? AppTheme.background : AppTheme.ivory)
                                    Text(stage.description)
                                        .font(.caption)
                                        .foregroundStyle(
                                            lifeStage == stage
                                                ? AppTheme.background.opacity(0.7)
                                                : AppTheme.textMuted
                                        )
                                }
                                Spacer()
                                if lifeStage == stage {
                                    Image(systemName: "checkmark").font(.caption.weight(.bold))
                                }
                            }
                            .padding(12)
                            .background(
                                lifeStage == stage ? AppTheme.primary : AppTheme.backgroundCard,
                                in: RoundedRectangle(cornerRadius: 12)
                            )
                            .overlay(RoundedRectangle(cornerRadius: 12).stroke(AppTheme.border))
                        }
                    }
                }

                // Results
                if let r = result {
                    GlassChrome.card(tint: AppTheme.primary.opacity(0.15)) {
                        VStack(spacing: 14) {
                            Text("Résultats journaliers")
                                .font(.headline)
                                .foregroundStyle(AppTheme.ivory)
                            resultRow("Calories", "\(r.calories) kcal")
                            resultRow(String(localized: "Croquettes (sèches)"), "\(r.dryFood) g")
                            resultRow(String(localized: "Pâtée (humide)"), "\(r.wetFood) g")
                            resultRow(String(localized: "Eau recommandée"), "\(r.water) ml")
                        }
                    }

                    Text("Ces valeurs sont indicatives. Consultez un vétérinaire pour un programme alimentaire adapté.")
                        .font(.caption)
                        .foregroundStyle(AppTheme.textMuted)
                        .multilineTextAlignment(.center)
                }
            }
            .padding(16)
        }
        .navigationTitle("Calculateur alimentaire")
        .navigationBarTitleDisplayMode(.inline)
        .purrlyScreenBackground()
    }

    private func resultRow(_ label: String, _ value: String) -> some View {
        HStack {
            Text(label)
                .foregroundStyle(AppTheme.textSecondary)
                .font(.subheadline)
            Spacer()
            Text(value)
                .font(.subheadline.weight(.bold))
                .foregroundStyle(AppTheme.primary)
        }
    }
}
