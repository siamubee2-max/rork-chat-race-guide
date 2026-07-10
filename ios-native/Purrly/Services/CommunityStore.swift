import Foundation
import Supabase

@Observable
@MainActor
final class CommunityStore {
    private(set) var posts: [CommunityPost] = []
    private(set) var events: [CommunityEvent] = []
    private(set) var conversations: [Conversation] = []
    private(set) var isLoading = false
    /// Dernière erreur de synchro (publication/like non remontée au serveur).
    /// Permet à l'UI de signaler "non synchronisé" au lieu d'un échec silencieux.
    private(set) var lastSyncError: String?

    private var client: SupabaseClient? {
        guard let url = AppConfiguration.supabaseURL,
              let key = AppConfiguration.supabaseAnonKey else { return nil }
        return SupabaseClient(supabaseURL: url, supabaseKey: key)
    }

    // MARK: - Load

    func loadSampleIfNeeded() {
        Task { await load() }
    }

    func load() async {
        guard let db = client else { loadSamples(); return }
        isLoading = true
        defer { isLoading = false }
        do {
            // Posts
            struct PostRow: Decodable {
                let id: String; let author_name: String; let content: String
                let likes: Int; let created_at: String
            }
            let postRows: [PostRow] = try await db.from("community_posts")
                .select().order("created_at", ascending: false).limit(50).execute().value
            posts = postRows.map { r in
                CommunityPost(id: r.id, authorName: r.author_name, content: r.content,
                              createdAt: iso(r.created_at), likes: r.likes, isLiked: false)
            }
            // Events
            struct EventRow: Decodable {
                let id: String; let title: String; let description: String?
                let event_date: String?; let event_time: String?; let location: String?
                let address: String?; let type: String?; let max_attendees: Int?
                let price: String?; let attendees: [String]?; let created_at: String
            }
            let eventRows: [EventRow] = try await db.from("community_events")
                .select().order("created_at", ascending: false).limit(20).execute().value
            events = eventRows.map { r in
                CommunityEvent(id: r.id, title: r.title, description: r.description ?? "",
                               date: r.event_date ?? "", time: r.event_time ?? "",
                               location: r.location ?? "", address: r.address ?? "",
                               type: r.type ?? "meetup", maxAttendees: r.max_attendees ?? 20,
                               price: r.price ?? "", attendees: r.attendees ?? [],
                               createdAt: iso(r.created_at))
            }
        } catch {
            if posts.isEmpty { loadSamples() }
        }
    }

    // MARK: - Posts

    func addPost(content: String, authorName: String) {
        let post = CommunityPost(id: UUID().uuidString, authorName: authorName,
                                  content: content, createdAt: Date(), likes: 0, isLiked: false)
        posts.insert(post, at: 0)
        Task {
            guard let db = client else { return }
            do {
                struct Insert: Encodable {
                    let id: String; let author_name: String; let content: String
                    let author_id: String?
                }
                // Get current user ID if available
                let session = try? await db.auth.session
                try await db.from("community_posts").insert(
                    Insert(id: post.id, author_name: authorName, content: content,
                           author_id: session?.user.id.uuidString)
                ).execute()
                lastSyncError = nil
            } catch {
                lastSyncError = String(localized: "Publication non synchronisée : \(error.localizedDescription)")
            }
        }
    }

    func toggleLike(postId: String) {
        guard let index = posts.firstIndex(where: { $0.id == postId }) else { return }
        var post = posts[index]
        post.isLiked.toggle()
        post.likes += post.isLiked ? 1 : -1
        posts[index] = post

        // Persiste le compteur (best-effort). Sans ça, le like se réinitialise
        // au prochain load() depuis le serveur.
        let newLikes = post.likes
        Task {
            guard let db = client else { return }
            do {
                struct LikeUpdate: Encodable { let likes: Int }
                try await db.from("community_posts")
                    .update(LikeUpdate(likes: newLikes))
                    .eq("id", value: postId)
                    .execute()
                lastSyncError = nil
            } catch {
                lastSyncError = String(localized: "Like non synchronisé : \(error.localizedDescription)")
            }
        }
    }

    // MARK: - Events

    func addEvent(_ event: CommunityEvent) {
        events.insert(event, at: 0)
        Task {
            guard let db = client else { return }
            do {
                struct Insert: Encodable {
                    let id: String; let title: String; let description: String
                    let event_date: String; let event_time: String; let location: String
                    let address: String; let type: String; let max_attendees: Int; let price: String
                    let author_id: String?
                }
                let session = try? await db.auth.session
                try await db.from("community_events").insert(
                    Insert(id: event.id, title: event.title, description: event.description,
                           event_date: event.date, event_time: event.time,
                           location: event.location, address: event.address,
                           type: event.type, max_attendees: event.maxAttendees, price: event.price,
                           author_id: session?.user.id.uuidString)
                ).execute()
                lastSyncError = nil
            } catch {
                lastSyncError = String(localized: "Événement non synchronisé : \(error.localizedDescription)")
            }
        }
    }

    // MARK: - Conversations (local only for now)

    // MARK: - Comments (local)
    private var comments: [String: [CommunityComment]] = [:]

    func commentsFor(postId: String) -> [CommunityComment] { comments[postId] ?? [] }

    func addComment(postId: String, text: String, authorName: String) {
        let comment = CommunityComment(id: UUID().uuidString, postId: postId,
                                        authorName: authorName, text: text, createdAt: Date())
        var existing = comments[postId] ?? []
        existing.append(comment)
        comments[postId] = existing
    }

    func sendMessage(to participantId: String, participantName: String,
                     text: String, fromId: String, fromName: String) {
        let message = DirectMessage(id: UUID().uuidString, authorId: fromId,
                                     authorName: fromName, content: text, createdAt: Date())
        if let index = conversations.firstIndex(where: {
            $0.participants.contains(participantId) && $0.participants.contains(fromId)
        }) {
            var conv = conversations[index]
            conv.messages.append(message)
            conv.lastActivity = Date()
            conversations[index] = conv
        } else {
            let conv = Conversation(id: UUID().uuidString,
                                     participants: [fromId, participantId],
                                     participantNames: [fromId: fromName, participantId: participantName],
                                     messages: [message], lastActivity: Date())
            conversations.insert(conv, at: 0)
        }
    }

    // MARK: - Helpers

    private func iso(_ str: String) -> Date {
        ISO8601DateFormatter().date(from: str) ?? Date()
    }

    private func isoDate(from date: Date) -> String {
        let fmt = ISO8601DateFormatter(); fmt.formatOptions = [.withFullDate]
        return fmt.string(from: date)
    }

    private func loadSamples() {
        guard posts.isEmpty else { return }
        let now = Date()
        posts = [
            CommunityPost(id: "s1", authorName: "Lea",
                          content: String(localized: "Mon Maine Coon vient d'adopter sa litière — des conseils ?"),
                          createdAt: now.addingTimeInterval(-3600), likes: 12, isLiked: false),
            CommunityPost(id: "s2", authorName: "Marc",
                          content: String(localized: "Photo du jour : notre Bengal adore les étagères hautes 🐾"),
                          createdAt: now.addingTimeInterval(-86_400), likes: 34, isLiked: true),
        ]
        events = [
            CommunityEvent(id: "e1", title: String(localized: "Rencontre éleveurs Maine Coon"),
                           description: String(localized: "Grande rencontre des passionnés de Maine Coon."),
                           date: isoDate(from: now.addingTimeInterval(86_400 * 5)), time: "14:00",
                           location: "Lyon", address: "Parc de la Tête d'Or, 69006 Lyon",
                           type: "meetup", maxAttendees: 50, price: "", attendees: [], createdAt: now),
        ]
    }
}
