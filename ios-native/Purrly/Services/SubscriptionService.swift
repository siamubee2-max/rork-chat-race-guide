import Foundation
import Observation
import RevenueCat

/// Wrapper RevenueCat pour l'app native.
///
/// - Configure le SDK une seule fois au lancement (clé publique `appl_` depuis Secrets.xcconfig).
/// - Identité partagée avec Expo : `identify(userID:)` passe l'id Supabase comme appUserID,
///   pour que le webhook RevenueCat → Supabase mappe l'achat au bon utilisateur.
/// - Source de vérité *locale* de l'accès payant via l'entitlement `premium`.
///   Le palier autoritaire reste côté serveur (Supabase `subscription_tier`).
/// - Dégrade proprement quand la clé est absente (tests UI, dev) : tout devient no-op.
@Observable
@MainActor
final class SubscriptionService {

    /// Identifiant d'entitlement configuré dans le tableau de bord RevenueCat.
    static let premiumEntitlementID = "premium"

    /// `true` dès que l'entitlement `premium` est actif (achat, renouvellement, restauration).
    private(set) var isPremium = false

    /// Packages de l'offering courant (`default`), prêts à l'achat.
    private(set) var packages: [Package] = []

    private(set) var isLoadingOfferings = false
    private(set) var purchaseInProgress = false

    /// Dernier message d'erreur lisible (offerings/achat/restauration), pour l'UI.
    var lastErrorMessage: String?

    /// `true` si le SDK est réellement configuré (clé présente).
    private(set) var isReady = false

    /// Appelé sur le main actor à chaque mise à jour du `CustomerInfo`
    /// (achat, expiration, renouvellement, changement d'appareil).
    var onEntitlementChange: (@MainActor (Bool) -> Void)?

    private var streamTask: Task<Void, Never>?

    // MARK: - Cycle de vie

    /// Configure RevenueCat une seule fois. Sûr à appeler plusieurs fois.
    func start() {
        guard !isReady else { return }
        guard let key = AppConfiguration.revenueCatIOSKey else {
            // Pas de clé → mode dégradé silencieux (l'accès reste piloté par le serveur).
            return
        }
        #if DEBUG
        Purchases.logLevel = .debug
        #endif
        Purchases.configure(withAPIKey: key)
        isReady = true
        observeCustomerInfo()
    }

    /// Lie l'utilisateur RevenueCat à l'id Supabase. À appeler après connexion/inscription.
    func identify(userID: String) async {
        guard isReady, !userID.isEmpty else { return }
        do {
            let (info, _) = try await Purchases.shared.logIn(userID)
            apply(info)
        } catch {
            lastErrorMessage = error.localizedDescription
        }
    }

    /// Repasse en utilisateur anonyme RevenueCat (à la déconnexion).
    func signOut() async {
        guard isReady else { return }
        do {
            let info = try await Purchases.shared.logOut()
            apply(info)
        } catch {
            // logOut échoue uniquement si déjà anonyme — bénin.
        }
    }

    /// Synchronise l'état `isPremium` avec le serveur RevenueCat à la demande.
    func refresh() async {
        guard isReady else { return }
        do {
            let info = try await Purchases.shared.customerInfo()
            apply(info)
        } catch {
            lastErrorMessage = error.localizedDescription
        }
    }

    // MARK: - Offerings & achat

    /// Charge l'offering `current` (mappé sur l'offering `default` du tableau de bord).
    func loadOfferings() async {
        guard isReady else { return }
        isLoadingOfferings = true
        defer { isLoadingOfferings = false }
        do {
            let offerings = try await Purchases.shared.offerings()
            packages = offerings.current?.availablePackages ?? []
        } catch {
            lastErrorMessage = error.localizedDescription
        }
    }

    /// Lance l'achat d'un package. Retourne `true` si l'entitlement `premium` est désormais actif.
    @discardableResult
    func purchase(_ package: Package) async -> Bool {
        guard isReady else { return false }
        purchaseInProgress = true
        defer { purchaseInProgress = false }
        do {
            let result = try await Purchases.shared.purchase(package: package)
            if result.userCancelled { return false }
            apply(result.customerInfo)
            return isPremium
        } catch {
            lastErrorMessage = error.localizedDescription
            return false
        }
    }

    /// Restaure les achats antérieurs. Retourne `true` si `premium` est actif après restauration.
    @discardableResult
    func restore() async -> Bool {
        guard isReady else { return false }
        purchaseInProgress = true
        defer { purchaseInProgress = false }
        do {
            let info = try await Purchases.shared.restorePurchases()
            apply(info)
            return isPremium
        } catch {
            lastErrorMessage = error.localizedDescription
            return false
        }
    }

    // MARK: - Privé

    private func observeCustomerInfo() {
        streamTask?.cancel()
        streamTask = Task { [weak self] in
            guard self != nil else { return }
            for await info in Purchases.shared.customerInfoStream {
                await MainActor.run { self?.apply(info) }
            }
        }
    }

    private func apply(_ info: CustomerInfo) {
        let active = info.entitlements.active[Self.premiumEntitlementID] != nil
        if active != isPremium {
            isPremium = active
        }
        onEntitlementChange?(isPremium)
    }
}
