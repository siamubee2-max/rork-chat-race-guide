import Foundation

@Observable
@MainActor
final class GamificationStore{
    private(set) var achievements: [Achievement] = GamificationStore.defaultAchievements
    private(set) var totalXP: Int = 0

    private let storageKey = "gamification_data"

    init() { load() }

    func load() {
        guard let data = UserDefaults.standard.data(forKey: storageKey),
              let saved = try? JSONDecoder().decode([Achievement].self, from: data)
        else {
            recalculate()
            return
        }
        achievements = saved
        recalculate()
    }

    func unlock(id: String) {
        guard let i = achievements.firstIndex(where: { $0.id == id }),
              !achievements[i].isUnlocked else { return }
        achievements[i].isUnlocked = true
        achievements[i].unlockedAt = Date()
        recalculate()
        persist()
    }

    func checkAndUnlock(forCatCount count: Int) {
        if count >= 1 { unlock(id: "first_cat") }
        if count >= 3 { unlock(id: "three_cats") }
    }

    func checkAndUnlockScan() { unlock(id: "first_scan") }

    var level: Int { max(1, totalXP / 100 + 1) }
    var xpToNextLevel: Int { level * 100 - totalXP }

    private func recalculate() {
        totalXP = achievements.filter(\.isUnlocked).reduce(0) { $0 + $1.xpValue }
    }

    private func persist() {
        if let data = try? JSONEncoder().encode(achievements) {
            UserDefaults.standard.set(data, forKey: storageKey)
        }
    }

    static let defaultAchievements: [Achievement] = [
        Achievement(id: "first_cat",  title: "Premier compagnon",
                    description: "Ajoute ton premier chat",
                    icon: "heart.fill", category: .cats, xpValue: 50,
                    isUnlocked: false, unlockedAt: nil),
        Achievement(id: "three_cats", title: "Maison de chats",
                    description: "Ajoute 3 chats",
                    icon: "house.fill", category: .cats, xpValue: 100,
                    isUnlocked: false, unlockedAt: nil),
        Achievement(id: "first_scan", title: "Chercheur de races",
                    description: "Lance ton premier scan",
                    icon: "camera.fill", category: .explorer, xpValue: 30,
                    isUnlocked: false, unlockedAt: nil),
        Achievement(id: "social_1",   title: "Communauté",
                    description: "Rejoins la communauté",
                    icon: "person.3.fill", category: .social, xpValue: 20,
                    isUnlocked: false, unlockedAt: nil),
        Achievement(id: "week_1",     title: "Une semaine",
                    description: "Ouvre l'app 7 jours de suite",
                    icon: "calendar", category: .dedication, xpValue: 70,
                    isUnlocked: false, unlockedAt: nil),
    ]
}
