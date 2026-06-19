import Foundation

enum AchievementCategory: String, Codable, CaseIterable {
    case cats, health, social, explorer, dedication

    var label: String {
        switch self {
        case .cats:       "Chats"
        case .health:     "Santé"
        case .social:     "Social"
        case .explorer:   "Explorateur"
        case .dedication: "Fidélité"
        }
    }
}

struct Achievement: Codable, Identifiable, Hashable {
    var id: String
    var title: String
    var description: String
    var icon: String           // SF Symbol name
    var category: AchievementCategory
    var xpValue: Int
    var isUnlocked: Bool
    var unlockedAt: Date?
}
