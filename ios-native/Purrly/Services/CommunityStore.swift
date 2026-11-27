import Foundation
import Supabase

/// Frontière réseau des « j'aime » (injectable pour les tests).
/// L'état est **par utilisateur** (idempotent) : on envoie aimé/retiré,
/// jamais un compteur absolu (red-team H5).
protocol LikeSyncing: Sendable {
    /// Marque ou retire le « j'aime » de l'utilisateur courant pour un post.
    func setLiked(postId: String, liked: Bool) async throws
    /// Identifiants des posts déjà aimés par l'utilisateur courant.
    func likedPostIds() async throws -> Set<String>
}

/// Implémentation Supabase : table `community_post_likes` (post_id, user_id).
struct SupabaseLikeSync: LikeSyncing {
    func setLiked(postId: String, liked: Bool) async throws {
        guard let url = AppConfiguration.supabaseURL,
              let key = AppConfiguration.supabaseAnonKey else { return }
        let client = SupabaseClient(supabaseURL: url, supabaseKey: key)
        struct LikeRow: Encodable { let post_id: String; let user_id: String? }
        if liked {
            try await client.from("community_post_likes").insert(
                LikeRow(post_id: postId, user_id: nil)   // user_id = auth.uid() par défaut
            ).execute()
        } else {
            try await client.from("community_post_likes")
                .delete()
                .eq("post_id", value: postId)
                .execute()
        }
    }

    func likedPostIds() async throws -> Set<String> {
        guard let url = AppConfiguration.supabaseURL,
              let key = AppConfiguration.supabaseAnonKey else { return [] }
        let client = SupabaseClient(supabaseURL: url, supabaseKey: key)
        struct LikeRow: Decodable { let post_id: String }
        let rows: [LikeRow] = try await client.from("community_post_likes")
            .select("post_id").execute().value
        return Set(rows.map(\.post_id))
    }
}

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

    /// Backend Supabase, injectable pour les tests (`nil` = sans backend).
    private let client: SupabaseClient?
    /// Frontière réseau des « j'aime » (injectable pour les tests).
    private let likeSync: any LikeSyncing

    init(client: SupabaseClient? = CommunityStore.makeClient(),
         likeSync: any LikeSyncing = SupabaseLikeSync()) {
        self.client = client
        self.likeSync = likeSync
    }

    private static func makeClient() -> SupabaseClient? {
        guard let url = AppConfiguration.supabaseURL,
              let key = AppConfiguration.supabaseAnonKey else { return nil }
        return SupabaseClient(supabaseURL: url, supabaseKey: key)
    }

    // MARK: - Load

    func loadIfNeeded() {
        Task { await load() }
    }

    /// Charge le fil réel. Sans backend ou en cas d'échec, le fil reste **vide** :
    /// aucun contenu d'exemple n'est fabriqué (red-team H4 — « Léa/Marc » étaient
    /// présentés comme du vrai contenu communautaire).
    func load() async {
        if let db = client {
            await loadPostsAndEvents(from: db)
        }
        await restoreLikedState()
    }

    private func loadPostsAndEvents(from db: SupabaseClient) async {
        isLoading = true
        defer { isLoading = false }
        do {
            // Posts
            struct PostRow: Decodable {
                let id: String; let author_name: String; let content: String
                let likes: Int; let created_at: String
                let author_id: String?
            }
            let postRows: [PostRow] = try await db.from("community_posts")
                .select().order("created_at", ascending: false).limit(50).execute().value
            posts = postRows.map { r in
                CommunityPost(id: r.id, authorName: r.author_name, content: r.content,
                              createdAt: iso(r.created_at), likes: r.likes, isLiked: false,
                              authorId: r.author_id)
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
            // Échec réseau : garder le fil tel quel (vide si rien n'a été chargé).
            lastSyncError = "Contenus non synchronisés : \(error.localizedDescription)"
        }
    }

    // MARK: - Posts

    func addPost(content: String, authorName: String, authorId: String? = nil) {
        let post = CommunityPost(id: UUID().uuidString, authorName: authorName,
                                  content: content, createdAt: Date(), likes: 0, isLiked: false,
                                  authorId: authorId)
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
                lastSyncError = "Publication non synchronisée : \(error.localizedDescription)"
            }
        }
    }

    func toggleLike(postId: String) {
        guard let index = posts.firstIndex(where: { $0.id == postId }) else { return }
        var post = posts[index]
        post.isLiked.toggle()
        post.likes += post.isLiked ? 1 : -1
        posts[index] = post

        // État par utilisateur (idempotent), jamais un compteur absolu :
        // l'ancien `update(likes: n)` perdait les écritures concurrentes et
        // se gonflait au relancement (red-team H5).
        let liked = post.isLiked
        Task {
            do {
                try await likeSync.setLiked(postId: postId, liked: liked)
                lastSyncError = nil
            } catch {
                lastSyncError = "Like non synchronisé : \(error.localizedDescription)"
            }
        }
    }

    /// Restaure l'état « déjà aimé » de l'utilisateur sur les posts chargés
    /// (red-team H5 : `isLiked = false` en dur laissait re-liker à chaque
    /// relancement et gonfler le compteur).
    private func restoreLikedState() async {
        guard let liked = try? await likeSync.likedPostIds() else { return }
        for index in posts.indices where liked.contains(posts[index].id) {
            posts[index].isLiked = true
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
                lastSyncError = "Événement non synchronisé : \(error.localizedDescription)"
            }
        }
    }

    // MARK: - Conversations (local only for now)

    // MARK: - Comments (local)
    private var comments: [String: [CommunityComment]] = [:]

    func commentsFor(postId: String) -> [CommunityComment] { comments[postId] ?? [] }

    func addComment(postId: String, text: String, authorName: String, authorId: String? = nil) {
        let comment = CommunityComment(id: UUID().uuidString, postId: postId,
                                        authorName: authorName, text: text, createdAt: Date(),
                                        authorId: authorId)
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

}
