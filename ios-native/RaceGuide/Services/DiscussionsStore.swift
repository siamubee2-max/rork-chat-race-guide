import Foundation

@MainActor
final class DiscussionsStore: ObservableObject {
    @Published private(set) var threads: [DiscussionThread] = []
    private let storageKey = "discussions_data"

    init() { load() }

    func load() {
        guard let data = UserDefaults.standard.data(forKey: storageKey),
              let decoded = try? JSONDecoder().decode([DiscussionThread].self, from: data)
        else { loadSamples(); return }
        threads = decoded
    }

    func addThread(title: String, firstMessage: String, authorName: String) {
        let msg = DiscussionMessage(id: UUID().uuidString, authorName: authorName,
                                    content: firstMessage, createdAt: Date())
        let thread = DiscussionThread(id: UUID().uuidString, title: title,
                                      authorName: authorName, createdAt: Date(), messages: [msg])
        threads.insert(thread, at: 0)
        persist()
    }

    func addMessage(_ text: String, author: String, toThread threadId: String) {
        guard let i = threads.firstIndex(where: { $0.id == threadId }) else { return }
        let msg = DiscussionMessage(id: UUID().uuidString, authorName: author,
                                    content: text, createdAt: Date())
        threads[i].messages.append(msg)
        persist()
    }

    private func persist() {
        if let data = try? JSONEncoder().encode(threads) {
            UserDefaults.standard.set(data, forKey: storageKey)
        }
    }

    private func loadSamples() {
        threads = [
            DiscussionThread(
                id: "sample-1",
                title: "Mon Maine Coon griffe tout — conseils ?",
                authorName: "Léa",
                createdAt: Date().addingTimeInterval(-7200),
                messages: [
                    DiscussionMessage(id: "m1", authorName: "Léa",
                                      content: "Il griffe les canapés, les rideaux… je suis à bout.",
                                      createdAt: Date().addingTimeInterval(-7200)),
                    DiscussionMessage(id: "m2", authorName: "Marc",
                                      content: "Griffoir en sisal + spray répulsif, ça marche bien.",
                                      createdAt: Date().addingTimeInterval(-3600)),
                ]
            ),
        ]
    }
}
