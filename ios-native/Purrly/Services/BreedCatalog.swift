import Foundation

@Observable
@MainActor
final class BreedCatalog{
    private(set) var breeds: [BreedProfile] = []
    private(set) var loadError: String?

    func loadIfNeeded() {
        guard breeds.isEmpty, loadError == nil else { return }
        guard let url = Bundle.main.url(forResource: "breeds", withExtension: "json") else {
            loadError = "Catalogue de races introuvable."
            return
        }
        do {
            let data = try Data(contentsOf: url)
            breeds = try JSONDecoder().decode([BreedProfile].self, from: data)
                .sorted { $0.name.localizedCaseInsensitiveCompare($1.name) == .orderedAscending }
        } catch {
            loadError = error.localizedDescription
        }
    }

    func breed(id: String?) -> BreedProfile? {
        guard let id else { return nil }
        return breeds.first { $0.id == id }
    }

    func search(_ query: String) -> [BreedProfile] {
        let q = query.trimmingCharacters(in: .whitespacesAndNewlines)
        guard !q.isEmpty else { return breeds }
        return breeds.filter {
            $0.name.localizedCaseInsensitiveContains(q)
                || $0.origin.localizedCaseInsensitiveContains(q)
                || $0.temperament.contains { $0.localizedCaseInsensitiveContains(q) }
        }
    }
}
