import Foundation

@MainActor
final class UsageLimits: ObservableObject {
    @Published var isPremium: Bool {
        didSet { defaults.set(isPremium, forKey: premiumKey) }
    }
    @Published private(set) var aiMessagesThisMonth: Int

    private let defaults: UserDefaults
    private let monthKey = "usage_ai_month"
    private let countKey = "usage_ai_count"
    private let premiumKey = "usage_premium"

    static let freeAILimit = 15
    static let freeCatLimit = 1

    init(defaults: UserDefaults = .standard) {
        self.defaults = defaults
        self.isPremium = defaults.bool(forKey: "usage_premium")
        let storedMonth = defaults.string(forKey: "usage_ai_month") ?? ""
        let currentMonth = Self.currentMonthKey()
        if storedMonth == currentMonth {
            self.aiMessagesThisMonth = defaults.integer(forKey: "usage_ai_count")
        } else {
            self.aiMessagesThisMonth = 0
            defaults.set(currentMonth, forKey: "usage_ai_month")
            defaults.set(0, forKey: "usage_ai_count")
        }
    }

    var canSendAIMessage: Bool {
        isPremium || aiMessagesThisMonth < Self.freeAILimit
    }

    var aiMessagesRemaining: Int {
        isPremium ? Int.max : max(0, Self.freeAILimit - aiMessagesThisMonth)
    }

    func canAddCat(currentCount: Int) -> Bool {
        isPremium || currentCount < Self.freeCatLimit
    }

    func recordAIMessage() {
        aiMessagesThisMonth += 1
        defaults.set(aiMessagesThisMonth, forKey: countKey)
    }

    private static func currentMonthKey() -> String {
        let c = Calendar.current.dateComponents([.year, .month], from: Date())
        return "\(c.year ?? 0)-\(c.month ?? 0)"
    }
}
