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

        // Mode tests UI : état connecté déterministe, pas d'auth réseau,
        // store de chats vide pour que chaque run reparte propre.
        if ProcessInfo.processInfo.arguments.contains("-uiTesting") {
            hasSelectedLanguage = true
            cats.save([])
            UserDefaults.standard.removeObject(forKey: "assistant_chat_history")
            auth.enterUITestMode()
            syncEntitlements()
            return
        }

        await auth.bootstrap()
        syncEntitlements()
    }

    /// Aligne le flag UI `limits.isPremium` sur le vrai palier d'abonnement.
    /// À appeler après bootstrap et après une connexion/inscription.
    func syncEntitlements() {
        limits.isPremium = (auth.currentUser?.subscriptionTier ?? .free) != .free
    }
}
