import Foundation

enum EmergencyType: String, Codable, CaseIterable {
    case lost, injured, found

    var label: String {
        switch self {
        case .lost:     String(localized: "emergency.type.lost")
        case .injured:  String(localized: "emergency.type.injured")
        case .found:    String(localized: "emergency.type.found")
        }
    }

    var colorHex: String {
        switch self {
        case .lost:     "FF6B6B"
        case .injured:  "FF8C42"
        case .found:    "4ECDC4"
        }
    }
}

struct EmergencyAlert: Codable, Identifiable, Hashable {
    var id: String
    var type: EmergencyType
    var catName: String
    var location: String
    var description: String
    var contactPhone: String
    var imageUri: String?
    var createdAt: Date
    var isResolved: Bool

    static func create(type: EmergencyType, catName: String, location: String,
                       description: String, contactPhone: String,
                       imageUri: String? = nil) -> EmergencyAlert {
        EmergencyAlert(id: UUID().uuidString, type: type, catName: catName,
                       location: location, description: description,
                       contactPhone: contactPhone, imageUri: imageUri,
                       createdAt: Date(), isResolved: false)
    }
}
