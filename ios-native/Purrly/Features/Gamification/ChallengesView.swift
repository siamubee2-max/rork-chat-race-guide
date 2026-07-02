import SwiftUI

struct Challenge: Identifiable {
    let id: String
    let title: String
    let description: String
    let xpReward: Int
    let icon: String
    let isCompleted: Bool
}

struct ChallengesView: View {
    @Environment(AppEnvironment.self) private var environment

    private let challenges: [Challenge] = [
        Challenge(id: "c1", title: "Première pesée", description: "Enregistre le poids de ton chat", xpReward: 30, icon: "scalemass", isCompleted: false),
        Challenge(id: "c2", title: "Communauté active", description: "Publie dans le forum", xpReward: 20, icon: "bubble.left", isCompleted: false),
        Challenge(id: "c3", title: "Scan du jour", description: "Scanne une race de chat", xpReward: 25, icon: "camera.viewfinder", isCompleted: false),
        Challenge(id: "c4", title: "Assistant IA", description: "Pose 3 questions à l'assistant", xpReward: 15, icon: "sparkles", isCompleted: false),
        Challenge(id: "c5", title: "Dossier santé", description: "Ajoute un acte médical", xpReward: 40, icon: "cross.case", isCompleted: false),
    ]

    var body: some View {
        List(challenges) { challenge in
            HStack(spacing: 14) {
                Image(systemName: challenge.icon)
                    .font(.system(size: 22))
                    .foregroundStyle(challenge.isCompleted ? .green : AppTheme.primary)
                    .frame(width: 36)
                VStack(alignment: .leading, spacing: 4) {
                    Text(challenge.title)
                        .font(.body.weight(.semibold))
                        .foregroundStyle(challenge.isCompleted ? AppTheme.textMuted : AppTheme.ivory)
                    Text(challenge.description)
                        .font(.caption)
                        .foregroundStyle(AppTheme.textMuted)
                }
                Spacer()
                Text("+\(challenge.xpReward) XP")
                    .font(.caption.weight(.bold))
                    .foregroundStyle(challenge.isCompleted ? .green : AppTheme.primary)
            }
            .padding(.vertical, 4)
            .listRowBackground(AppTheme.backgroundCard)
            .listRowSeparatorTint(AppTheme.border)
        }
        .listStyle(.plain)
        .scrollContentBackground(.hidden)
        .navigationTitle("Défis de la semaine")
        .purrlyScreenBackground()
    }
}
