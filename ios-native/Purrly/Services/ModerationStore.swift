import Foundation
import Observation

/// Conformité App Store — Guideline 1.2 (User-Generated Content).
///
/// La modération est gérée localement sur l'appareil : acceptation des règles
/// communautaires (EULA), blocage d'utilisateurs et signalement de contenus.
/// Les vues filtrent leur affichage via ce store, ce qui retire le contenu masqué
/// du fil **instantanément**, comme l'exige Apple.
///
/// Contrairement à l'app sœur sans compte, l'identité de l'utilisateur courant
/// provient de l'authentification réelle (`AppEnvironment.auth.currentUser?.name`).
/// Le nom de l'auteur courant est donc passé au moment de l'appel pour éviter
/// qu'un utilisateur ne se signale / bloque lui-même.
@Observable
@MainActor
final class ModerationStore {
    /// Adresse de l'équipe de modération (signalements + retraits sous 24 h).
    static let supportEmail = "support@inferencevision.store"

    private(set) var hasAcceptedTerms: Bool
    private(set) var blockedAuthors: Set<String> = []
    private(set) var reportedIDs: Set<String> = []

    /// Message de confirmation transitoire affiché une seule fois à la racine
    /// après un signalement ou un blocage.
    var lastActionMessage: String?

    private let termsKey = "moderation_terms_accepted_v1"
    private let blockedKey = "moderation_blocked_authors"
    private let reportedKey = "moderation_reported_ids"

    init() {
        let d = UserDefaults.standard
        hasAcceptedTerms = d.bool(forKey: termsKey)
        if let arr = d.stringArray(forKey: blockedKey) { blockedAuthors = Set(arr) }
        if let arr = d.stringArray(forKey: reportedKey) { reportedIDs = Set(arr) }
    }

    // MARK: - Règles communautaires (EULA)

    func acceptTerms() {
        hasAcceptedTerms = true
        UserDefaults.standard.set(true, forKey: termsKey)
    }

    // MARK: - Blocage d'utilisateurs

    func isBlocked(_ author: String) -> Bool { blockedAuthors.contains(author) }

    func block(author: String) {
        blockedAuthors.insert(author)
        persistBlocked()
        lastActionMessage = "\(author) a été bloqué·e. Son contenu n'apparaît plus dans votre fil."
    }

    func unblock(author: String) {
        blockedAuthors.remove(author)
        persistBlocked()
    }

    // MARK: - Signalement de contenu

    func isReported(_ id: String) -> Bool { reportedIDs.contains(id) }

    func report(id: String, author: String, reason: String) {
        reportedIDs.insert(id)
        persistReported()
        lastActionMessage = "Merci. Ce contenu a été masqué et signalé à notre équipe, qui agira sous 24 h."
    }

    /// Un contenu est masqué s'il a été signalé OU si son auteur est bloqué.
    func isHidden(id: String, author: String) -> Bool {
        isReported(id) || isBlocked(author)
    }

    // MARK: - Réinitialisation (suppression de données)

    func reset() {
        blockedAuthors = []
        reportedIDs = []
        lastActionMessage = nil
        UserDefaults.standard.removeObject(forKey: blockedKey)
        UserDefaults.standard.removeObject(forKey: reportedKey)
    }

    // MARK: - Persistance

    private func persistBlocked() {
        UserDefaults.standard.set(Array(blockedAuthors), forKey: blockedKey)
    }

    private func persistReported() {
        UserDefaults.standard.set(Array(reportedIDs), forKey: reportedKey)
    }
}
