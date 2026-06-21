import Foundation

/// Instantané léger partagé entre l'app et l'extension widget via un App Group.
/// L'app l'écrit ; le widget le lit. Volontairement minimal (pas d'images lourdes).
struct PurrlyWidgetSnapshot: Codable, Equatable {
    var headline: String
    var subtitle: String
    var breedCount: Int
    var nextReminderTitle: String?
    var nextReminderDate: Date?

    static let placeholder = PurrlyWidgetSnapshot(
        headline: "Purrly",
        subtitle: "Identifiez la race de votre chat",
        breedCount: 400,
        nextReminderTitle: nil,
        nextReminderDate: nil
    )
}

/// Accès au stockage partagé (App Group). Utilisé des deux côtés.
enum PurrlyWidgetStore {
    /// Doit correspondre à l'App Group déclaré dans les entitlements de l'app et du widget.
    static let appGroup = "group.app.rork.chat-race-guide"
    private static let key = "widget_snapshot_v1"

    private static var defaults: UserDefaults? {
        UserDefaults(suiteName: appGroup)
    }

    static func load() -> PurrlyWidgetSnapshot {
        guard let data = defaults?.data(forKey: key),
              let snapshot = try? JSONDecoder().decode(PurrlyWidgetSnapshot.self, from: data) else {
            return .placeholder
        }
        return snapshot
    }

    static func save(_ snapshot: PurrlyWidgetSnapshot) {
        guard let data = try? JSONEncoder().encode(snapshot) else { return }
        defaults?.set(data, forKey: key)
    }
}
