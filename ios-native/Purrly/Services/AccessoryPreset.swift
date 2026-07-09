import Foundation

/// Accessoire ajouté par l'IA sur une photo de chat (IA Booth).
/// Le `rawValue` est envoyé au proxy `kie-generate` ; le prompt GPT-4o
/// associé vit **côté serveur** (la clé KIE ne quitte jamais le backend).
enum AccessoryPreset: String, CaseIterable, Identifiable {
    case cowboyHat    = "cowboy_hat"
    case crown        = "crown"
    case witchHat     = "witch_hat"
    case sunglasses   = "sunglasses"
    case partyHat     = "party_hat"
    case bowtie       = "bowtie"
    case flowerWreath = "flower_wreath"
    case superhero    = "superhero"
    case pirate       = "pirate"
    case princess     = "princess"

    var id: String { rawValue }

    var label: String {
        switch self {
        case .cowboyHat:    return String(localized: "Chapeau cowboy")
        case .crown:        return String(localized: "Couronne royale")
        case .witchHat:     return String(localized: "Chapeau de sorcière")
        case .sunglasses:   return String(localized: "Lunettes de soleil")
        case .partyHat:     return String(localized: "Chapeau de fête")
        case .bowtie:       return String(localized: "Nœud papillon")
        case .flowerWreath: return String(localized: "Couronne de fleurs")
        case .superhero:    return String(localized: "Super-héros")
        case .pirate:       return String(localized: "Pirate")
        case .princess:     return String(localized: "Princesse")
        }
    }

    var emoji: String {
        switch self {
        case .cowboyHat:    return "🤠"
        case .crown:        return "👑"
        case .witchHat:     return "🧙"
        case .sunglasses:   return "🕶️"
        case .partyHat:     return "🎉"
        case .bowtie:       return "🎀"
        case .flowerWreath: return "🌸"
        case .superhero:    return "🦸"
        case .pirate:       return "☠️"
        case .princess:     return "👸"
        }
    }
}
