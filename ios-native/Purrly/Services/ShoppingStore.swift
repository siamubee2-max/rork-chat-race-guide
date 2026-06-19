import Foundation
import Observation

@Observable
@MainActor
final class ShoppingStore {
    private(set) var items: [ShoppingItem] = []
    private let storageKey = "shopping_data"

    init() { load() }

    private func load() {
        guard let data = UserDefaults.standard.data(forKey: storageKey),
              let decoded = try? JSONDecoder().decode([ShoppingItem].self, from: data)
        else { return }
        items = decoded
    }

    func add(_ item: ShoppingItem) { items.append(item); persist() }

    func toggle(id: String) {
        guard let i = items.firstIndex(where: { $0.id == id }) else { return }
        items[i].isChecked.toggle()
        persist()
    }

    func delete(id: String) { items.removeAll { $0.id == id }; persist() }

    func clearChecked() { items.removeAll(where: \.isChecked); persist() }

    private func persist() {
        if let data = try? JSONEncoder().encode(items) {
            UserDefaults.standard.set(data, forKey: storageKey)
        }
    }
}
