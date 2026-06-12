import SwiftUI

struct GamificationView: View {
    @Environment(AppEnvironment.self) private var environment
    @State private var showAchievements = false

    private var store: GamificationStore { environment.gamification }

    var body: some View {
        ScrollView {
            VStack(spacing: 24) {
                levelCard
                recentBadges
            }
            .padding(16)
        }
        .navigationTitle("Progression")
        .toolbar {
            ToolbarItem(placement: .primaryAction) {
                Button { showAchievements = true } label: {
                    Text("Tous les succès").font(.subheadline)
                }
                .tint(AppTheme.primary)
            }
        }
        .sheet(isPresented: $showAchievements) { AchievementsView() }
        .purrlyScreenBackground()
    }

    private var levelCard: some View {
        GlassChrome.card(tint: AppTheme.primary.opacity(0.15)) {
            VStack(spacing: 12) {
                Text("Niveau \(store.level)")
                    .font(.title.weight(.bold))
                    .foregroundStyle(AppTheme.primary)
                ProgressView(value: Double(store.totalXP % 100), total: 100)
                    .tint(AppTheme.primary)
                    .scaleEffect(x: 1, y: 2)
                HStack {
                    Text("\(store.totalXP) XP")
                        .font(.caption).foregroundStyle(AppTheme.textMuted)
                    Spacer()
                    Text("\(store.xpToNextLevel) XP jusqu'au niveau \(store.level + 1)")
                        .font(.caption).foregroundStyle(AppTheme.textMuted)
                }
            }
        }
    }

    private var recentBadges: some View {
        VStack(alignment: .leading, spacing: 12) {
            Text("Succès récents").font(.headline).foregroundStyle(AppTheme.ivory)
            LazyVGrid(
                columns: Array(repeating: GridItem(.flexible(), spacing: 12), count: 3),
                spacing: 12
            ) {
                ForEach(store.achievements.prefix(6)) { ach in
                    AchievementBadge(achievement: ach)
                }
            }
        }
    }
}

struct AchievementBadge: View {
    let achievement: Achievement

    var body: some View {
        VStack(spacing: 6) {
            Image(systemName: achievement.isUnlocked ? achievement.icon : "lock.fill")
                .font(.system(size: 28))
                .foregroundStyle(achievement.isUnlocked ? AppTheme.primary : AppTheme.textMuted)
                .frame(width: 56, height: 56)
                .background(
                    Circle().fill(achievement.isUnlocked
                                  ? AppTheme.primary.opacity(0.15)
                                  : AppTheme.backgroundSecondary)
                )
            Text(achievement.title)
                .font(.caption2)
                .foregroundStyle(achievement.isUnlocked ? AppTheme.ivory : AppTheme.textMuted)
                .multilineTextAlignment(.center)
                .lineLimit(2)
        }
    }
}
