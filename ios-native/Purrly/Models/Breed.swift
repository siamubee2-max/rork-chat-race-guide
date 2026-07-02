import Foundation

struct BreedCoat: Codable, Hashable {
    let length: String
    let shedding: String
    let notes: [String]
}

struct BreedCare: Codable, Hashable {
    let grooming: [String]
    let habits: [String]
    let watchouts: [String]
}

struct BreedHealth: Codable, Hashable {
    let common: [String]
    let specific: [String]
    let prevention: [String]
    let vetWhen: [String]
}

struct BreedDiet: Codable, Hashable {
    let recommended: [String]
    let avoid: [String]
    let notes: [String]
}

struct BreedProfile: Codable, Identifiable, Hashable {
    let id: String
    let name: String
    let origin: String
    let temperament: [String]
    let coat: BreedCoat
    let care: BreedCare
    let health: BreedHealth
    let diet: BreedDiet
    let imageUri: String
}
