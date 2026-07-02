import Foundation

// SECURITY NOTE: isPremium and aiMessagesToday are stored in UserDefaults (client-side).
// These are UI-only guards — they can be bypassed by a rooted device or memory editor.
// The authoritative subscription gate lives server-side in verifySubscriptionTier() (ai.ts).
//
// QUOTA WINDOW: daily. freeAILimit must match the server's FREE_DAILY in
// supabase/functions/ai-chat/index.ts so this UI guard predicts the server 429.
@Observable
@MainActor
final class UsageLimits{
    var isPremium: Bool {
        didSet { defaults.set(isPremium, forKey: premiumKey) }
    }
    private(set) var aiMessagesToday: Int

    private let defaults: UserDefaults
    private let dayKey = "usage_ai_day"
    private let countKey = "usage_ai_count"
    private let premiumKey = "usage_premium"

    static let freeAILimit = 15
    static let freeCatLimit = 1

    init(defaults: UserDefaults = .standard) {
        self.defaults = defaults
        self.isPremium = defaults.bool(forKey: premiumKey)
        let storedDay = defaults.string(forKey: dayKey) ?? ""
        let currentDay = Self.currentDayKey()
        if storedDay == currentDay {
            self.aiMessagesToday = defaults.integer(forKey: countKey)
        } else {
            self.aiMessagesToday = 0
            defaults.set(currentDay, forKey: dayKey)
            defaults.set(0, forKey: countKey)
        }
    }

    var canSendAIMessage: Bool {
        isPremium || aiMessagesToday < Self.freeAILimit
    }

    var aiMessagesRemaining: Int {
        isPremium ? Int.max : max(0, Self.freeAILimit - aiMessagesToday)
    }

    func canAddCat(currentCount: Int) -> Bool {
        isPremium || currentCount < Self.freeCatLimit
    }

    /// Records one AI message. No-op check for limit is the caller's responsibility.
    /// Increments counter even when user is premium (for analytics).
    func recordAIMessage() {
        aiMessagesToday += 1
        defaults.set(aiMessagesToday, forKey: countKey)
    }

    private static func currentDayKey() -> String {
        // UTC, not device-local: the server quota counts per Postgres `current_date`
        // and the DB runs in UTC, so the client window must roll over at the same
        // instant to predict the server 429 accurately.
        var cal = Calendar(identifier: .gregorian)
        cal.timeZone = TimeZone(identifier: "UTC") ?? .gmt
        let c = cal.dateComponents([.year, .month, .day], from: Date())
        return "\(c.year ?? 0)-\(c.month ?? 0)-\(c.day ?? 0)"
    }
}
