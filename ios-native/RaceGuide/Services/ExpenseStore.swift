import Foundation

@Observable
@MainActor
final class ExpenseStore{
    private(set) var expenses: [Expense] = []
    private let storageKey = "expenses_data"
    private let defaults: UserDefaults

    init(defaults: UserDefaults = .standard) {
        self.defaults = defaults
        load()
    }

    private func load() {
        guard let data = defaults.data(forKey: storageKey),
              let decoded = try? JSONDecoder().decode([Expense].self, from: data)
        else { return }
        expenses = decoded.sorted { $0.date > $1.date }
    }

    func add(_ expense: Expense) {
        expenses.insert(expense, at: 0)
        persist()
    }

    func delete(id: String) {
        expenses.removeAll { $0.id == id }
        persist()
    }

    func total(for category: ExpenseCategory) -> Double {
        expenses.filter { $0.category == category }.reduce(0) { $0 + $1.amount }
    }

    var grandTotal: Double { expenses.reduce(0) { $0 + $1.amount } }

    private func persist() {
        if let data = try? JSONEncoder().encode(expenses) {
            defaults.set(data, forKey: storageKey)
        }
    }
}
