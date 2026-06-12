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

    var hasSelectedLanguage: Bool {
        get { UserDefaults.standard.bool(forKey: "language_selected") }
        set { UserDefaults.standard.set(newValue, forKey: "language_selected") }
    }

    func bootstrap() async {
        breeds.loadIfNeeded()
        cats.load()
        community.loadSampleIfNeeded()
        await auth.bootstrap()
    }
}
