import Foundation

enum ReminderFrequency: String, Codable, CaseIterable {
    case once, daily, weekly, monthly
    var label: String {
        switch self {
        case .once: "Une fois"
        case .daily: "Quotidien"
        case .weekly: "Hebdomadaire"
        case .monthly: "Mensuel"
        }
    }
}

struct Reminder: Codable, Identifiable, Hashable {
    var id: String
    var title: String
    var date: Date
    var frequency: ReminderFrequency
    var catId: String?
    var notes: String
    var isCompleted: Bool

    static func create(title: String, date: Date, frequency: ReminderFrequency = .once, catId: String? = nil, notes: String = "") -> Reminder {
        Reminder(id: UUID().uuidString, title: title, date: date, frequency: frequency, catId: catId, notes: notes, isCompleted: false)
    }
}
