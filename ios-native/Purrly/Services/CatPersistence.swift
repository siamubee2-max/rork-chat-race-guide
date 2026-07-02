import Foundation

/// Persistance locale des profils chats (équivalent AsyncStorage `cats_data`).
@Observable
@MainActor
final class CatPersistence{
    private(set) var cats: [CatProfile] = []
    private(set) var loadFailed = false

    private let storageKey = "cats_data"
    private let corruptKey = "cats_data.corrupt"
    private let defaults = UserDefaults.standard

    func load() {
        guard let data = defaults.data(forKey: storageKey) else {
            cats = []
            return
        }
        do {
            cats = try JSONDecoder().decode([CatProfile].self, from: data)
            loadFailed = false
        } catch {
            // Décodage échoué (migration de modèle, corruption). NE PAS écraser :
            // un cats = [] suivi d'un save() effacerait définitivement les chats.
            // On sauvegarde le blob brut et on bloque les écritures jusqu'à résolution.
            defaults.set(data, forKey: corruptKey)
            loadFailed = true
            cats = []
        }
    }

    func save(_ updated: [CatProfile]) {
        // Refuse d'écrire si le chargement a échoué — sinon on écrase des données
        // récupérables (sauvegardées sous cats_data.corrupt) par du vide.
        guard !loadFailed else { return }
        cats = updated
        if let data = try? JSONEncoder().encode(updated) {
            defaults.set(data, forKey: storageKey)
        }
    }

    func upsert(_ cat: CatProfile) {
        var copy = cats
        if let index = copy.firstIndex(where: { $0.id == cat.id }) {
            copy[index] = cat
        } else {
            copy.append(cat)
        }
        save(copy)
    }

    func delete(id: String) {
        save(cats.filter { $0.id != id })
    }
}
