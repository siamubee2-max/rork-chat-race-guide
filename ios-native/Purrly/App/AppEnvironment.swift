import Foundation
import Observation

@Observable
@MainActor
final class AppEnvironment {
    let auth = AuthService()
    let breeds = BreedCatalog()
    let cats = CatPersistence()
    let community = CommunityStore()
    let aiChat = AIChatService()
    let limits = UsageLimits()
    let emergency = EmergencyStore()
    let discussions = DiscussionsStore()
    let expenses = ExpenseStore()
    let gamification = GamificationStore()
    let reminders = ReminderStore()
    let shopping = ShoppingStore()

    var hasSelectedLanguage: Bool = UserDefaults.standard.bool(forKey: "language_selected") {
        didSet { UserDefaults.standard.set(hasSelectedLanguage, forKey: "language_selected") }
    }

    func bootstrap() async {
        breeds.loadIfNeeded()
        cats.load()
        community.loadSampleIfNeeded()
        await auth.bootstrap()
    }
}
