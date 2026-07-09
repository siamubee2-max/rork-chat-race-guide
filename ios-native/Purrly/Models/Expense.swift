import Foundation

enum ExpenseCategory: String, Codable, CaseIterable {
    case vet, food, grooming, toy, pharmacy, other

    var label: String {
        switch self {
        case .vet:      String(localized: "Vétérinaire")
        case .food:     String(localized: "Alimentation")
        case .grooming: String(localized: "Toilettage")
        case .toy:      String(localized: "Jouets & accessoires")
        case .pharmacy: String(localized: "Pharmacie")
        case .other:    String(localized: "Autre")
        }
    }

    var symbol: String {
        switch self {
        case .vet:      "stethoscope"
        case .food:     "fork.knife"
        case .grooming: "scissors"
        case .toy:      "pawprint"
        case .pharmacy: "pill"
        case .other:    "ellipsis.circle"
        }
    }
}

struct Expense: Codable, Identifiable, Hashable {
    var id: String
    var category: ExpenseCategory
    var amount: Double
    var date: Date
    var catId: String?
    var notes: String

    static func create(category: ExpenseCategory, amount: Double, date: Date,
                       catId: String? = nil, notes: String = "") -> Expense {
        Expense(id: UUID().uuidString, category: category, amount: amount,
                date: date, catId: catId, notes: notes)
    }
}
