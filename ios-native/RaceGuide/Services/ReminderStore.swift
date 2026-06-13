import Foundation
import Observation

@Observable
@MainActor
final class ReminderStore {
    private(set) var reminders: [Reminder] = []
    private let storageKey = "reminders_data"

    init() { load() }

    private func load() {
        guard let data = UserDefaults.standard.data(forKey: storageKey),
              let decoded = try? JSONDecoder().decode([Reminder].self, from: data)
        else { return }
        reminders = decoded.sorted { $0.date < $1.date }
    }

    func add(_ reminder: Reminder) {
        reminders.append(reminder)
        reminders.sort { $0.date < $1.date }
        persist()
    }

    func toggle(id: String) {
        guard let i = reminders.firstIndex(where: { $0.id == id }) else { return }
        reminders[i].isCompleted.toggle()
        persist()
    }

    func delete(id: String) {
        reminders.removeAll { $0.id == id }
        persist()
    }

    private func persist() {
        if let data = try? JSONEncoder().encode(reminders) {
            UserDefaults.standard.set(data, forKey: storageKey)
        }
    }
}
