import Foundation
import Observation
import WidgetKit
import ObjectiveC

@Observable
@MainActor
final class AppEnvironment {
    let auth = AuthService()
    let breeds = BreedCatalog()
    let cats = CatPersistence()
    let community = CommunityStore()
    let moderation = ModerationStore()
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
            // Bypass la porte de règles communautaires (sinon le fullScreenCover
            // bloque l'accès à l'app sur un simulateur neuf pendant les captures).
            moderation.acceptTerms()
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

// MARK: - Language runtime switch (fusionné ici car la cible utilise des
// références de fichiers explicites ; regénérer via xcodegen casserait la
// signature manuelle App Store scopée par-cible).

/// Changement de langue **à l'exécution**, sans redémarrage.
///
/// App Review 2.1(a) : l'app restait dans la langue de l'appareil même après
/// avoir choisi « English » dans l'écran de sélection. Cause : régler
/// `AppleLanguages` ne prend effet qu'au prochain lancement, et
/// `String(localized:)` est résolu au démarrage.
///
/// Solution classique : on remplace la classe de `Bundle.main` par une
/// sous-classe qui redirige TOUTE recherche de chaîne localisée vers le
/// `.lproj` de la langue choisie. Combiné à un ré-rendu de l'arbre de vues
/// (voir `RootView.id(...)`), l'UI bascule instantanément.
@Observable
@MainActor
final class LanguageManager {
    static let shared = LanguageManager()

    /// Langues réellement embarquées et proposées dans l'app.
    static let supported = ["en", "fr", "es", "de"]

    private let storeKey = "purrly.selectedLanguage"

    /// Code de langue courant (ex. "en"). Change → l'UI se re-render.
    private(set) var current: String

    private init() {
        if ProcessInfo.processInfo.arguments.contains("-purrly.reset-language") {
            UserDefaults.standard.removeObject(forKey: storeKey)
            UserDefaults.standard.removeObject(forKey: "language_selected")
            UserDefaults.standard.removeObject(forKey: "AppleLanguages")
        }

        // Migration unique (refus 2.1(a) « app dans une autre langue que celle
        // sélectionnée », iPad). Les builds ≤ 36 écrivaient `AppleLanguages`
        // dans les defaults de l'app à chaque lancement. Or c'est LA MÊME clé
        // qu'iOS utilise pour la « langue préférée » par-app choisie dans
        // Réglages — le mécanisme qu'App Review emploie. Notre écriture parasite
        // (souvent périmée, ex. « fr ») écrasait donc le choix anglais du
        // reviewer. On la purge une seule fois, tant qu'aucun choix explicite
        // in-app n'existe, pour rendre la main à iOS.
        let purgeKey = "purrly.appleLanguagesPurged.v37"
        if !UserDefaults.standard.bool(forKey: purgeKey) {
            if UserDefaults.standard.string(forKey: storeKey) == nil {
                UserDefaults.standard.removeObject(forKey: "AppleLanguages")
            }
            UserDefaults.standard.set(true, forKey: purgeKey)
        }

        Bundle.activatePurrlyLanguageBundle()

        let explicit = UserDefaults.standard.string(forKey: storeKey)
        if let explicit, LanguageManager.supported.contains(explicit) {
            // Choix explicite fait dans l'app → on le force partout, à chaud.
            Bundle.purrlyOverrideLanguage = explicit
            current = explicit
        } else {
            // Aucun choix in-app → localisation 100 % NATIVE iOS : on respecte
            // la langue par-app (Réglages) ou celle de l'appareil. `nil` = le
            // bundle standard résout la localisation. L'anglais est la langue
            // de base du catalogue → repli garanti en anglais.
            Bundle.purrlyOverrideLanguage = nil
            current = LanguageManager.nativeLanguage()
        }
    }

    /// L'utilisateur a-t-il déjà choisi explicitement une langue ?
    var hasExplicitChoice: Bool {
        UserDefaults.standard.string(forKey: storeKey) != nil
    }

    /// Nom (en anglais) de la langue courante, à injecter dans les prompts IA
    /// pour que l'assistant réponde dans la langue de l'app (refus 2.1(a) :
    /// l'app ne doit pas s'afficher/répondre en français quand l'anglais est
    /// sélectionné).
    var aiReplyLanguage: String {
        switch current {
        case "en": return "English"
        case "es": return "Spanish"
        case "de": return "German"
        default:   return "French"
        }
    }

    /// Applique une langue choisie par l'utilisateur, à chaud.
    /// On n'écrit JAMAIS `AppleLanguages` : cela corromprait le réglage de
    /// langue par-app d'iOS (cf. migration ci-dessus).
    func select(_ code: String) {
        let lang = LanguageManager.supported.contains(code) ? code : "en"
        UserDefaults.standard.set(lang, forKey: storeKey)
        Bundle.purrlyOverrideLanguage = lang
        current = lang   // déclenche le re-render (voir RootView.id)
    }

    /// Langue résolue par iOS (par-app / appareil) si supportée, sinon anglais.
    private static func nativeLanguage() -> String {
        for pref in Locale.preferredLanguages {
            let base = String(pref.prefix(2))
            if supported.contains(base) { return base }
        }
        return "en"
    }
}

// MARK: - Bundle override

private nonisolated(unsafe) var purrlyOverrideLanguageKey: UInt8 = 0

extension Bundle {
    /// Langue forcée pour toutes les recherches localisées (nil = comportement standard).
    @MainActor static var purrlyOverrideLanguage: String? {
        get { objc_getAssociatedObject(Bundle.main, &purrlyOverrideLanguageKey) as? String }
        set { objc_setAssociatedObject(Bundle.main, &purrlyOverrideLanguageKey, newValue, .OBJC_ASSOCIATION_RETAIN) }
    }

    /// Remplace la classe de `Bundle.main` une seule fois.
    @MainActor static func activatePurrlyLanguageBundle() {
        guard !(object_getClass(Bundle.main) is PurrlyLocalizedBundle.Type) else { return }
        object_setClass(Bundle.main, PurrlyLocalizedBundle.self)
    }
}

/// Sous-classe qui redirige la recherche de chaînes vers le `.lproj` choisi.
private final class PurrlyLocalizedBundle: Bundle, @unchecked Sendable {
    override func localizedString(forKey key: String, value: String?, table tableName: String?) -> String {
        let override = MainActor.assumeIsolated { Bundle.purrlyOverrideLanguage }
        if let code = override,
           let path = Bundle.main.path(forResource: code, ofType: "lproj"),
           let langBundle = Bundle(path: path) {
            return langBundle.localizedString(forKey: key, value: value, table: tableName)
        }
        return super.localizedString(forKey: key, value: value, table: tableName)
    }
}

