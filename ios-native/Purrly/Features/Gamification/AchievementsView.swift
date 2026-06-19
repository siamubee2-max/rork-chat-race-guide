import SwiftUI

struct AchievementsView: View {
    @Environment(AppEnvironment.self) private var environment
    @State private var filter: AchievementCategory? = nil

    private var store: GamificationStore { environment.gamification }

    private var filtered: [Achievement] {
        guard let f = filter else { return store.achievements }
        return store.achievements.filter { $0.category == f }
    }

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(spacing: 16) {
                    categoryFilter
                    LazyVGrid(
                        columns: Array(repeating: GridItem(.flexible(), spacing: 14), count: 2),
                        spacing: 14
                    ) {
                        ForEach(filtered) { ach in
                            achievementCard(ach)
                        }
                    }
                    .padding(.horizontal, 16)
                }
                .padding(.top, 12)
            }
            .navigationTitle("Succès")
            .purrlyScreenBackground()
        }
    }

    private var categoryFilter: some View {
        ScrollView(.horizontal, showsIndicators: false) {
            HStack(spacing: 8) {
                filterChip(nil, label: "Tous")
                ForEach(AchievementCategory.allCases, id: \.self) { cat in
                    filterChip(cat, label: cat.label)
                }
            }
            .padding(.horizontal, 16)
        }
    }

    private func filterChip(_ cat: AchievementCategory?, label: String) -> some View {
        Button { filter = cat } label: {
            Text(label)
                .font(.subheadline.weight(.semibold))
                .padding(.horizontal, 14).padding(.vertical, 8)
                .background(filter == cat ? AppTheme.primary : AppTheme.backgroundCard,
                            in: Capsule())
                .foregroundStyle(filter == cat ? AppTheme.background : AppTheme.textSecondary)
        }
    }

    private func achievementCard(_ ach: Achievement) -> some View {
        VStack(spacing: 10) {
            Image(systemName: ach.isUnlocked ? ach.icon : "lock.fill")
                .font(.system(size: 32))
                .foregroundStyle(ach.isUnlocked ? AppTheme.primary : AppTheme.textMuted)
            Text(ach.title)
                .font(.subheadline.weight(.semibold))
                .foregroundStyle(ach.isUnlocked ? AppTheme.ivory : AppTheme.textMuted)
                .multilineTextAlignment(.center)
            Text(ach.description)
                .font(.caption)
                .foregroundStyle(AppTheme.textMuted)
                .multilineTextAlignment(.center)
            Text("+\(ach.xpValue) XP")
                .font(.caption2.weight(.bold))
                .foregroundStyle(ach.isUnlocked ? AppTheme.primary : AppTheme.textMuted)
        }
        .padding(14)
        .frame(maxWidth: .infinity)
        .background(AppTheme.backgroundCard, in: RoundedRectangle(cornerRadius: 14))
        .overlay(RoundedRectangle(cornerRadius: 14).stroke(AppTheme.border, lineWidth: 1))
        .opacity(ach.isUnlocked ? 1 : 0.5)
    }
}
