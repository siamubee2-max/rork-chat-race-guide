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

struct DailyLog: Codable, Identifiable, Hashable {
    var id: String
    var date: Date
    var appetite: String  // normal, increased, decreased, none
    var water: String     // normal, increased, decreased, none
    var energy: String    // normal, playful, lethargic, hyperactive
    var litter: String    // normal, diarrhea, constipation, blood, none
    var notes: String

    static func create(appetite: String = "normal", water: String = "normal",
                       energy: String = "normal", litter: String = "normal",
                       notes: String = "") -> DailyLog {
        DailyLog(id: UUID().uuidString, date: Date(), appetite: appetite,
                 water: water, energy: energy, litter: litter, notes: notes)
    }
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
    var dailyLogs: [DailyLog]

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
            weightHistory: [],
            dailyLogs: []
        )
    }
}
