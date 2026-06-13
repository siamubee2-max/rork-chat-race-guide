import SwiftUI

struct LeaderboardView: View {
    @Environment(AppEnvironment.self) private var environment

    // Sample leaderboard — would come from Supabase in production
    private var entries: [(rank: Int, name: String, xp: Int, isMe: Bool)] {
        let myXP = environment.gamification.totalXP
        var list: [(name: String, xp: Int, isMe: Bool)] = [
            ("Sophie D.", 850, false),
            ("Marc L.", 720, false),
            ("Emma B.", 680, false),
            ("Lucas M.", 540, false),
            ("Léa P.", 480, false),
            ("Vous", myXP, true),
        ]
        let sorted = list.sorted { $0.xp > $1.xp }
        return sorted.enumerated().map { (i, e) in (i + 1, e.name, e.xp, e.isMe) }
    }

    var body: some View {
        List {
            ForEach(entries, id: \.rank) { entry in
                HStack(spacing: 14) {
                    Text("\(entry.rank)")
                        .font(.title3.weight(.bold))
                        .foregroundStyle(entry.rank <= 3 ? AppTheme.primary : AppTheme.textMuted)
                        .frame(width: 28)
                    Circle()
                        .fill(entry.isMe ? AppTheme.primary.opacity(0.3) : AppTheme.backgroundSecondary)
                        .frame(width: 36, height: 36)
                        .overlay(
                            Text(String(entry.name.prefix(1)))
                                .font(.caption.weight(.bold))
                                .foregroundStyle(AppTheme.primary)
                        )
                    Text(entry.name)
                        .font(.body.weight(entry.isMe ? .bold : .regular))
                        .foregroundStyle(entry.isMe ? AppTheme.primary : AppTheme.ivory)
                    Spacer()
                    Text("\(entry.xp) XP")
                        .font(.subheadline.weight(.semibold))
                        .foregroundStyle(AppTheme.textSecondary)
                }
                .padding(.vertical, 4)
                .listRowBackground(entry.isMe ? AppTheme.primary.opacity(0.08) : AppTheme.backgroundCard)
                .listRowSeparatorTint(AppTheme.border)
            }
        }
        .listStyle(.plain)
        .scrollContentBackground(.hidden)
        .navigationTitle("Classement")
        .purrlyScreenBackground()
    }
}
