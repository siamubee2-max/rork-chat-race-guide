import Foundation

enum MedicalRecordType: String, Codable, CaseIterable {
    case vaccine, operation, medication, care, parasite
}

struct MedicalRecord: Codable, Identifiable, Hashable {
    var id: String
    var type: MedicalRecordType
    var title: String
    var date: String
    var nextDueDate: String?
    var notes: String?
    var vetName: String?
}

struct WeightEntry: Codable, Identifiable, Hashable {
    var id: String
    var date: String
    var weight: Double
    var unit: String
    var notes: String?
}

struct CatProfile: Codable, Identifiable, Hashable {
    var id: String
    var name: String
    var breedId: String?
    var microchip: String
    var birthDate: String?
    var imageUri: String?
    var notes: String?
    var medicalRecords: [MedicalRecord]
    var weightHistory: [WeightEntry]

    static func empty(name: String) -> CatProfile {
        CatProfile(
            id: UUID().uuidString,
            name: name,
            breedId: nil,
            microchip: "",
            birthDate: nil,
            imageUri: nil,
            notes: nil,
            medicalRecords: [],
            weightHistory: []
        )
    }
}
