import SwiftUI

struct GamificationView: View {
    @Environment(AppEnvironment.self) private var environment
    @State private var showAchievements = false
    @State private var showChallenges = false
    @State private var showLeaderboard = false

    private var store: GamificationStore { environment.gamification }

    var body: some View {
        ScrollView {
            VStack(spacing: 24) {
                levelCard
                quickActions
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
        .navigationDestination(isPresented: $showChallenges) { ChallengesView() }
        .navigationDestination(isPresented: $showLeaderboard) { LeaderboardView() }
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

    private var quickActions: some View {
        HStack(spacing: 12) {
            Button {
                showChallenges = true
            } label: {
                GlassChrome.card(tint: AppTheme.primary.opacity(0.10)) {
                    HStack(spacing: 8) {
                        Image(systemName: "trophy.fill")
                            .foregroundStyle(AppTheme.primary)
                        Text("Défis")
                            .font(.subheadline.weight(.semibold))
                            .foregroundStyle(AppTheme.ivory)
                        Spacer()
                        Image(systemName: "chevron.right")
                            .font(.caption)
                            .foregroundStyle(AppTheme.textMuted)
                    }
                }
            }
            .buttonStyle(.plain)

            Button {
                showLeaderboard = true
            } label: {
                GlassChrome.card(tint: AppTheme.primary.opacity(0.10)) {
                    HStack(spacing: 8) {
                        Image(systemName: "chart.bar.fill")
                            .foregroundStyle(AppTheme.primary)
                        Text("Classement")
                            .font(.subheadline.weight(.semibold))
                            .foregroundStyle(AppTheme.ivory)
                        Spacer()
                        Image(systemName: "chevron.right")
                            .font(.caption)
                            .foregroundStyle(AppTheme.textMuted)
                    }
                }
            }
            .buttonStyle(.plain)
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
