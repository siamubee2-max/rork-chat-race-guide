import Foundation
import Observation
import Supabase

// MARK: - Types de modération

/// Nature du contenu signalé (colonne `content_type` de `content_reports`).
enum ContentKind: String, Codable {
    case post, comment, thread, message, profile
}

/// Auteur d'un contenu. L'identité est l'**identifiant** quand il existe ; le nom
/// d'affichage n'est qu'un repli pour le contenu ancien/exemple qui n'en a pas
/// (les noms sont libres et non uniques : blocage ou « contenu à moi » par nom
/// permettrait l'usurpation — red-team H2).
struct ContentAuthor: Equatable {
    /// Normalisé en minuscules : Swift (`UUID.uuidString`) produit des majuscules,
    /// Postgres renvoie les uuid en minuscules.
    let id: String?
    let name: String

    init(id: String?, name: String) {
        self.id = id?.lowercased()
        self.name = name
    }
}

/// Signalement envoyé à l'équipe de modération.
struct ContentReport: Codable, Equatable {
    let kind: ContentKind
    let contentId: String
    let authorId: String?
    let authorName: String
    let reason: String

    init(kind: ContentKind, contentId: String, authorId: String?, authorName: String, reason: String) {
        self.kind = kind
        self.contentId = contentId
        self.authorId = authorId
        self.authorName = authorName
        self.reason = reason
    }
}

/// Frontière réseau du signalement (injectable pour les tests).
protocol ReportSubmitting {
    func submit(_ report: ContentReport) async throws
}

/// Envoie le signalement dans la table Supabase `content_reports`
/// (voir `supabase/migrations/20261127_content_reports.sql`).
struct SupabaseReportSubmitter: ReportSubmitting {
    enum SubmitError: Error { case notConfigured }

    func submit(_ report: ContentReport) async throws {
        guard let url = AppConfiguration.supabaseURL,
              let key = AppConfiguration.supabaseAnonKey else {
            throw SubmitError.notConfigured
        }
        let client = SupabaseClient(supabaseURL: url, supabaseKey: key)

        struct Row: Encodable {
            let content_type: String
            let content_id: String
            let author_id: String?
            let author_name: String
            let reason: String
        }
        do {
            try await client.from("content_reports").insert(
                Row(content_type: report.kind.rawValue,
                    content_id: report.contentId,
                    author_id: report.authorId,
                    author_name: report.authorName,
                    reason: report.reason)
            ).execute()
        } catch let error as PostgrestError where error.code == "23505" {
            // Déjà signalé par cet utilisateur : l'équipe l'a, c'est un succès.
            return
        }
    }
}

// MARK: - Store

/// Conformité App Store — Guideline 1.2 (User-Generated Content).
///
/// Acceptation des règles (EULA), blocage d'utilisateurs et signalement de contenus.
/// Le **masquage** est local et instantané (exigé par Apple). Le **signalement**,
/// lui, part réellement au serveur ; s'il échoue, il reste en file d'attente
/// persistante et est renvoyé (`flushPendingReports`), et l'UI ne prétend plus
/// l'avoir transmis (red-team H1 : l'ancienne version affichait « signalé à notre
/// équipe » sans aucun envoi).
@Observable
@MainActor
final class ModerationStore {
    /// Adresse de l'équipe de modération (signalements + retraits sous 24 h).
    static let supportEmail = "support@inferencevision.store"

    private(set) var hasAcceptedTerms: Bool
    /// Clés d'identité bloquées : `id:<authorId>`, `name:<nom>` (contenu sans id),
    /// ou un nom brut (ancien format, avant la correction H2).
    private(set) var blockedAuthors: Set<String> = []
    private(set) var reportedIDs: Set<String> = []
    private(set) var pendingReports: [ContentReport] = []

    /// Message de confirmation transitoire affiché une seule fois à la racine
    /// après un signalement ou un blocage.
    var lastActionMessage: String?

    var pendingReportCount: Int { pendingReports.count }

    private let defaults: UserDefaults
    private let submitter: any ReportSubmitting
    private let termsKey = "moderation_terms_accepted_v1"
    private let blockedKey = "moderation_blocked_authors"
    private let reportedKey = "moderation_reported_ids"
    private let pendingKey = "moderation_pending_reports_v1"

    init(defaults: UserDefaults = .standard,
         submitter: any ReportSubmitting = SupabaseReportSubmitter()) {
        self.defaults = defaults
        self.submitter = submitter
        // En mode tests UI / captures, on considère les règles acceptées dès l'init
        // (synchronement, avant toute vue) pour que le fullScreenCover ne bloque pas.
        let uiTesting = ProcessInfo.processInfo.arguments.contains("-uiTesting")
        hasAcceptedTerms = uiTesting || defaults.bool(forKey: termsKey)
        if let arr = defaults.stringArray(forKey: blockedKey) { blockedAuthors = Set(arr) }
        if let arr = defaults.stringArray(forKey: reportedKey) { reportedIDs = Set(arr) }
        if let data = defaults.data(forKey: pendingKey),
           let decoded = try? JSONDecoder().decode([ContentReport].self, from: data) {
            pendingReports = decoded
        }
    }

    // MARK: - Règles communautaires (EULA)

    func acceptTerms() {
        hasAcceptedTerms = true
        defaults.set(true, forKey: termsKey)
    }

    // MARK: - Identité

    /// Vrai uniquement si l'identifiant de l'auteur est celui de l'utilisateur courant.
    /// Jamais par nom : un homonyme doit rester signalable.
    func isOwnContent(authorId: String?, currentUserId: String?) -> Bool {
        guard let authorId, let currentUserId else { return false }
        return authorId.lowercased() == currentUserId.lowercased()
    }

    // MARK: - Blocage d'utilisateurs

    func isBlocked(_ author: ContentAuthor) -> Bool {
        if let id = author.id {
            return blockedAuthors.contains("id:\(id)")
        }
        // Contenu sans identifiant : repli sur le nom (nouveau format ou ancien format brut).
        return blockedAuthors.contains("name:\(author.name)") || blockedAuthors.contains(author.name)
    }

    func block(author: ContentAuthor) {
        blockedAuthors.insert(Self.key(for: author))
        persistBlocked()
        lastActionMessage = "\(author.name) a été bloqué·e. Son contenu n'apparaît plus dans votre fil."
    }

    func unblock(author: ContentAuthor) {
        blockedAuthors.remove(Self.key(for: author))
        // Ancien format brut : à retirer aussi pour le contenu sans identifiant.
        if author.id == nil { blockedAuthors.remove(author.name) }
        persistBlocked()
    }

    private static func key(for author: ContentAuthor) -> String {
        author.id.map { "id:\($0)" } ?? "name:\(author.name)"
    }

    // MARK: - Signalement de contenu

    func isReported(_ id: String) -> Bool { reportedIDs.contains(id) }

    /// Masque immédiatement le contenu puis l'envoie à l'équipe.
    /// - Returns: `true` si le serveur a reçu le signalement ; `false` s'il est en file d'attente.
    @discardableResult
    func report(kind: ContentKind, id: String, author: ContentAuthor, reason: String) async -> Bool {
        if reportedIDs.contains(id) {
            // Déjà signalé : ne pas renvoyer ; vrai seulement s'il n'est plus en attente.
            return !pendingReports.contains { $0.contentId == id }
        }
        reportedIDs.insert(id)
        persistReported()

        let report = ContentReport(kind: kind, contentId: id, authorId: author.id,
                                   authorName: author.name, reason: reason)
        do {
            try await submitter.submit(report)
            lastActionMessage = "Merci. Ce contenu a été masqué et signalé à notre équipe, qui agira sous 24 h."
            return true
        } catch {
            pendingReports.append(report)
            persistPending()
            lastActionMessage = "Ce contenu a été masqué. Le signalement n'a pas pu être envoyé ; il sera renvoyé automatiquement."
            return false
        }
    }

    /// Renvoie les signalements restés en file d'attente (à appeler au lancement et
    /// après une connexion). S'arrête au premier échec pour conserver l'ordre.
    func flushPendingReports() async {
        guard !pendingReports.isEmpty else { return }
        for report in pendingReports {
            do {
                try await submitter.submit(report)
            } catch {
                return
            }
            pendingReports.removeAll { $0 == report }
            persistPending()
        }
    }

    /// Un contenu est masqué s'il a été signalé OU si son auteur est bloqué.
    func isHidden(id: String, author: ContentAuthor) -> Bool {
        isReported(id) || isBlocked(author)
    }

    // MARK: - Réinitialisation (suppression de données)

    /// Les signalements en attente sont volontairement conservés : ils protègent
    /// la communauté et doivent atteindre l'équipe même après une réinitialisation.
    func reset() {
        blockedAuthors = []
        reportedIDs = []
        lastActionMessage = nil
        defaults.removeObject(forKey: blockedKey)
        defaults.removeObject(forKey: reportedKey)
    }

    // MARK: - Persistance

    private func persistBlocked() {
        defaults.set(Array(blockedAuthors), forKey: blockedKey)
    }

    private func persistReported() {
        defaults.set(Array(reportedIDs), forKey: reportedKey)
    }

    private func persistPending() {
        if let data = try? JSONEncoder().encode(pendingReports) {
            defaults.set(data, forKey: pendingKey)
        }
    }
}
