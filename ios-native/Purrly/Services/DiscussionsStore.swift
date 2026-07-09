import Foundation
import Supabase

@Observable
@MainActor
final class DiscussionsStore {
    private(set) var threads: [DiscussionThread] = []
    private(set) var isLoading = false

    private var client: SupabaseClient? {
        guard let url = AppConfiguration.supabaseURL,
              let key = AppConfiguration.supabaseAnonKey else { return nil }
        return SupabaseClient(supabaseURL: url, supabaseKey: key)
    }

    init() { Task { await load() } }

    // MARK: - Load

    func load() async {
        guard let db = client else { loadSamples(); return }
        isLoading = true
        defer { isLoading = false }
        do {
            struct ThreadRow: Decodable {
                let id: String; let author_name: String; let title: String; let created_at: String
            }
            struct MsgRow: Decodable {
                let id: String; let thread_id: String; let author_name: String
                let content: String; let created_at: String
            }

            let threadRows: [ThreadRow] = try await db.from("discussion_threads")
                .select().order("created_at", ascending: false).limit(30).execute().value

            let msgRows: [MsgRow] = try await db.from("discussion_messages")
                .select().order("created_at", ascending: true).execute().value

            threads = threadRows.map { t in
                let msgs = msgRows.filter { $0.thread_id == t.id }.map { m in
                    DiscussionMessage(id: m.id, authorName: m.author_name,
                                      content: m.content, createdAt: iso(m.created_at))
                }
                return DiscussionThread(id: t.id, title: t.title, authorName: t.author_name,
                                        createdAt: iso(t.created_at), messages: msgs)
            }
            if threads.isEmpty { loadSamples() }
        } catch {
            if threads.isEmpty { loadSamples() }
        }
    }

    // MARK: - Write

    func addThread(title: String, firstMessage: String, authorName: String) {
        let threadId = UUID().uuidString
        let msg = DiscussionMessage(id: UUID().uuidString, authorName: authorName,
                                    content: firstMessage, createdAt: Date())
        let thread = DiscussionThread(id: threadId, title: title, authorName: authorName,
                                      createdAt: Date(), messages: [msg])
        threads.insert(thread, at: 0)

        Task {
            guard let db = client else { return }
            do {
                let session = try? await db.auth.session
                struct TInsert: Encodable {
                    let id: String; let author_name: String; let title: String; let author_id: String?
                }
                struct MInsert: Encodable {
                    let id: String; let thread_id: String; let author_name: String
                    let content: String; let author_id: String?
                }
                let uid = session?.user.id.uuidString
                try await db.from("discussion_threads").insert(
                    TInsert(id: threadId, author_name: authorName, title: title, author_id: uid)
                ).execute()
                try await db.from("discussion_messages").insert(
                    MInsert(id: msg.id, thread_id: threadId, author_name: authorName,
                            content: firstMessage, author_id: uid)
                ).execute()
            } catch { /* keep local */ }
        }
    }

    func addMessage(_ text: String, author: String, toThread threadId: String) {
        guard let i = threads.firstIndex(where: { $0.id == threadId }) else { return }
        let msg = DiscussionMessage(id: UUID().uuidString, authorName: author,
                                    content: text, createdAt: Date())
        threads[i].messages.append(msg)

        Task {
            guard let db = client else { return }
            do {
                let session = try? await db.auth.session
                struct MInsert: Encodable {
                    let id: String; let thread_id: String; let author_name: String
                    let content: String; let author_id: String?
                }
                try await db.from("discussion_messages").insert(
                    MInsert(id: msg.id, thread_id: threadId, author_name: author,
                            content: text, author_id: session?.user.id.uuidString)
                ).execute()
            } catch { /* keep local */ }
        }
    }

    // MARK: - Helpers

    private func iso(_ str: String) -> Date {
        ISO8601DateFormatter().date(from: str) ?? Date()
    }

    private func loadSamples() {
        guard threads.isEmpty else { return }
        threads = [
            DiscussionThread(id: "sample-1", title: "Mon Maine Coon griffe tout — conseils ?",
                             authorName: "Léa", createdAt: Date().addingTimeInterval(-7200),
                             messages: [
                                DiscussionMessage(id: "m1", authorName: "Léa",
                                                  content: String(localized: "Il griffe les canapés… je suis à bout."),
                                                  createdAt: Date().addingTimeInterval(-7200)),
                                DiscussionMessage(id: "m2", authorName: "Marc",
                                                  content: String(localized: "Griffoir en sisal + spray répulsif, ça marche !"),
                                                  createdAt: Date().addingTimeInterval(-3600)),
                             ]),
        ]
    }
}
