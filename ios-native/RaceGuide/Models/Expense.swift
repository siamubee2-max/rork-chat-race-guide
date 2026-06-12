import Foundation

enum ExpenseCategory: String, Codable, CaseIterable {
    case vet, food, grooming, toy, pharmacy, other

    var label: String {
        switch self {
        case .vet:      "Vétérinaire"
        case .food:     "Alimentation"
        case .grooming: "Toilettage"
        case .toy:      "Jouets & accessoires"
        case .pharmacy: "Pharmacie"
        case .other:    "Autre"
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
