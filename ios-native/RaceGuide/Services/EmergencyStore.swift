import Foundation

@MainActor
final class EmergencyStore: ObservableObject {
    @Published private(set) var alerts: [EmergencyAlert] = []
    private let storageKey = "emergency_alerts"
    private let defaults: UserDefaults

    init(defaults: UserDefaults = .standard) {
        self.defaults = defaults
        load()
    }

    private func load() {
        guard let data = defaults.data(forKey: storageKey),
              let decoded = try? JSONDecoder().decode([EmergencyAlert].self, from: data)
        else { return }
        alerts = decoded.sorted { $0.createdAt > $1.createdAt }
    }

    func add(_ alert: EmergencyAlert) {
        alerts.insert(alert, at: 0)
        persist()
    }

    func resolve(id: String) {
        guard let i = alerts.firstIndex(where: { $0.id == id }) else { return }
        alerts[i].isResolved = true
        persist()
    }

    func delete(id: String) {
        alerts.removeAll { $0.id == id }
        persist()
    }

    private func persist() {
        if let data = try? JSONEncoder().encode(alerts) {
            defaults.set(data, forKey: storageKey)
        }
    }
}
