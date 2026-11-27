import Foundation
import Supabase

@Observable
@MainActor
final class DiscussionsStore {
    private(set) var threads: [DiscussionThread] = []
    private(set) var isLoading = false

    /// Backend Supabase, injectable pour les tests (`nil` = sans backend).
    private let client: SupabaseClient?

    init(client: SupabaseClient? = DiscussionsStore.makeClient()) {
        self.client = client
        Task { await load() }
    }

    private static func makeClient() -> SupabaseClient? {
        guard let url = AppConfiguration.supabaseURL,
              let key = AppConfiguration.supabaseAnonKey else { return nil }
        return SupabaseClient(supabaseURL: url, supabaseKey: key)
    }

    // MARK: - Load

    /// Charge les fils réels. Sans backend ou en cas d'échec, la liste reste
    /// **vide** : aucun fil d'exemple n'est fabriqué (red-team H4).
    func load() async {
        guard let db = client else { return }
        isLoading = true
        defer { isLoading = false }
        do {
            struct ThreadRow: Decodable {
                let id: String; let author_name: String; let title: String; let created_at: String
                let author_id: String?
            }
            struct MsgRow: Decodable {
                let id: String; let thread_id: String; let author_name: String
                let content: String; let created_at: String
                let author_id: String?
            }

            let threadRows: [ThreadRow] = try await db.from("discussion_threads")
                .select().order("created_at", ascending: false).limit(30).execute().value

            let msgRows: [MsgRow] = try await db.from("discussion_messages")
                .select().order("created_at", ascending: true).execute().value

            threads = threadRows.map { t in
                let msgs = msgRows.filter { $0.thread_id == t.id }.map { m in
                    DiscussionMessage(id: m.id, authorName: m.author_name,
                                      content: m.content, createdAt: iso(m.created_at),
                                      authorId: m.author_id)
                }
                return DiscussionThread(id: t.id, title: t.title, authorName: t.author_name,
                                        createdAt: iso(t.created_at), messages: msgs,
                                        authorId: t.author_id)
            }
        } catch {
            // Échec réseau : garder la liste telle quelle (vide si rien de chargé).
        }
    }

    // MARK: - Write

    func addThread(title: String, firstMessage: String, authorName: String, authorId: String? = nil) {
        let threadId = UUID().uuidString
        let msg = DiscussionMessage(id: UUID().uuidString, authorName: authorName,
                                    content: firstMessage, createdAt: Date(), authorId: authorId)
        let thread = DiscussionThread(id: threadId, title: title, authorName: authorName,
                                      createdAt: Date(), messages: [msg], authorId: authorId)
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

    func addMessage(_ text: String, author: String, authorId: String? = nil, toThread threadId: String) {
        guard let i = threads.firstIndex(where: { $0.id == threadId }) else { return }
        let msg = DiscussionMessage(id: UUID().uuidString, authorName: author,
                                    content: text, createdAt: Date(), authorId: authorId)
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

}
