import Foundation

struct ShoppingItem: Codable, Identifiable, Hashable {
    var id: String
    var name: String
    var quantity: String
    var isChecked: Bool
    var category: String // food, health, accessories, other

    static func create(name: String, quantity: String = "1", category: String = "other") -> ShoppingItem {
        ShoppingItem(id: UUID().uuidString, name: name, quantity: quantity, isChecked: false, category: category)
    }
}
