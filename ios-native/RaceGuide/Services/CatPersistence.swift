import Foundation

/// Persistance locale des profils chats (équivalent AsyncStorage `cats_data`).
@MainActor
final class CatPersistence: ObservableObject {
    @Published private(set) var cats: [CatProfile] = []

    private let storageKey = "cats_data"
    private let defaults = UserDefaults.standard

    func load() {
        guard let data = defaults.data(forKey: storageKey) else {
            cats = []
            return
        }
        do {
            cats = try JSONDecoder().decode([CatProfile].self, from: data)
        } catch {
            cats = []
        }
    }

    func save(_ updated: [CatProfile]) {
        cats = updated
        if let data = try? JSONEncoder().encode(updated) {
            defaults.set(data, forKey: storageKey)
        }
    }

    func upsert(_ cat: CatProfile) {
        var copy = cats
        if let index = copy.firstIndex(where: { $0.id == cat.id }) {
            copy[index] = cat
        } else {
            copy.append(cat)
        }
        save(copy)
    }

    func delete(id: String) {
        save(cats.filter { $0.id != id })
    }
}
