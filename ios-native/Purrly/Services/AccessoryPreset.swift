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
        case .cowboyHat:    return "Chapeau cowboy"
        case .crown:        return "Couronne royale"
        case .witchHat:     return "Chapeau de sorcière"
        case .sunglasses:   return "Lunettes de soleil"
        case .partyHat:     return "Chapeau de fête"
        case .bowtie:       return "Nœud papillon"
        case .flowerWreath: return "Couronne de fleurs"
        case .superhero:    return "Super-héros"
        case .pirate:       return "Pirate"
        case .princess:     return "Princesse"
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
