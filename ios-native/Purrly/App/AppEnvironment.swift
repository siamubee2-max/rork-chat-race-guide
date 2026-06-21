import Foundation
import Observation
import WidgetKit

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
    let subscriptions = SubscriptionService()
    let breedClassifier = BreedClassifierService()

    var hasSelectedLanguage: Bool = UserDefaults.standard.bool(forKey: "language_selected") {
        didSet { UserDefaults.standard.set(hasSelectedLanguage, forKey: "language_selected") }
    }

    func bootstrap() async {
        breeds.loadIfNeeded()
        cats.load()
        community.loadSampleIfNeeded()

        // Toute mise à jour d'entitlement RevenueCat (achat, expiration,
        // renouvellement, autre appareil) réaligne le flag UI `limits.isPremium`.
        subscriptions.onEntitlementChange = { [weak self] _ in
            self?.syncEntitlements()
        }

        // Mode tests UI : état connecté déterministe, pas d'auth réseau,
        // store de chats vide pour que chaque run reparte propre.
        // RevenueCat ne démarre pas (pas de clé en test) → mode dégradé.
        if ProcessInfo.processInfo.arguments.contains("-uiTesting") {
            hasSelectedLanguage = true
            cats.save([])
            UserDefaults.standard.removeObject(forKey: "assistant_chat_history")
            auth.enterUITestMode()
            syncEntitlements()
            updateWidgetSnapshot()
            return
        }

        // Configure RevenueCat en anonyme dès le lancement.
        subscriptions.start()

        await auth.bootstrap()

        // Lie l'achat à l'id Supabase (identité partagée avec Expo + webhook).
        if let userID = auth.currentUser?.id {
            await subscriptions.identify(userID: userID)
        }

        syncEntitlements()
        updateWidgetSnapshot()
    }

    /// Aligne le flag UI `limits.isPremium` sur l'accès payant.
    /// Premium si le palier serveur l'indique OU si l'entitlement RevenueCat est actif
    /// (déverrouillage immédiat après achat, avant que le webhook ne mette à jour Supabase).
    /// À appeler après bootstrap et après une connexion/inscription.
    func syncEntitlements() {
        let serverPremium = (auth.currentUser?.subscriptionTier ?? .free) != .free
        limits.isPremium = serverPremium || subscriptions.isPremium
    }

    /// À appeler après une connexion/inscription réussie : lie l'achat RevenueCat
    /// à l'id Supabase puis réaligne l'accès payant.
    func refreshSubscriberIdentity() async {
        if let userID = auth.currentUser?.id {
            await subscriptions.identify(userID: userID)
        }
        syncEntitlements()
    }

    /// À appeler après déconnexion : repasse RevenueCat en anonyme puis réaligne.
    func signOutSubscriber() async {
        await subscriptions.signOut()
        syncEntitlements()
    }

    /// Écrit l'instantané partagé lu par le widget d'accueil et recharge ses timelines.
    func updateWidgetSnapshot() {
        let upcoming = reminders.reminders
            .filter { !$0.isCompleted && $0.date >= Date() }
            .min { $0.date < $1.date }

        let snapshot = PurrlyWidgetSnapshot(
            headline: cats.cats.first?.name ?? "Purrly",
            subtitle: breeds.breeds.isEmpty
                ? "Identifiez la race de votre chat"
                : "\(breeds.breeds.count) races · scan IA",
            breedCount: breeds.breeds.count,
            nextReminderTitle: upcoming?.title,
            nextReminderDate: upcoming?.date
        )
        PurrlyWidgetStore.save(snapshot)
        WidgetCenter.shared.reloadAllTimelines()
    }
}
