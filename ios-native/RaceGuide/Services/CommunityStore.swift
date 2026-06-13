import Foundation

/// Données communauté locales (à brancher sur Supabase social plus tard).
@Observable
@MainActor
final class CommunityStore {
    private(set) var posts: [CommunityPost] = []
    private(set) var events: [CommunityEvent] = []
    private(set) var comments: [String: [CommunityComment]] = [:]
    private(set) var conversations: [Conversation] = []

    func loadSampleIfNeeded() {
        guard posts.isEmpty else { return }
        let now = Date()
        posts = [
            CommunityPost(
                id: "1",
                authorName: "Léa",
                content: "Mon Maine Coon vient d'adopter sa litière — des conseils pour la transition ?",
                createdAt: now.addingTimeInterval(-3600),
                likes: 12,
                isLiked: false
            ),
            CommunityPost(
                id: "2",
                authorName: "Marc",
                content: "Photo du jour : notre Bengal adore les étagères hautes 🐾",
                createdAt: now.addingTimeInterval(-86_400),
                likes: 34,
                isLiked: true
            ),
        ]
        events = [
            CommunityEvent(
                id: "e1",
                title: "Rencontre éleveurs Maine Coon",
                description: "Grande rencontre des passionnés de Maine Coon. Venez avec vos chats !",
                date: isoDate(from: now.addingTimeInterval(86_400 * 5)),
                time: "14:00",
                location: "Lyon",
                address: "Parc de la Tête d'Or, 69006 Lyon",
                type: "meetup",
                maxAttendees: 50,
                price: "",
                attendees: [],
                createdAt: now
            ),
            CommunityEvent(
                id: "e2",
                title: "Journée adoption — refuge",
                description: "Le refuge ouvre ses portes pour une journée d'adoption spéciale chats.",
                date: isoDate(from: now.addingTimeInterval(86_400 * 12)),
                time: "10:00",
                location: "Paris",
                address: "15 rue des Chats, 75012 Paris",
                type: "adoption",
                maxAttendees: 100,
                price: "",
                attendees: [],
                createdAt: now
            ),
        ]
    }

    func toggleLike(postId: String) {
        guard let index = posts.firstIndex(where: { $0.id == postId }) else { return }
        var post = posts[index]
        post.isLiked.toggle()
        post.likes += post.isLiked ? 1 : -1
        posts[index] = post
    }

    func addPost(content: String, authorName: String) {
        let post = CommunityPost(
            id: UUID().uuidString,
            authorName: authorName,
            content: content,
            createdAt: Date(),
            likes: 0,
            isLiked: false
        )
        posts.insert(post, at: 0)
    }

    func addComment(postId: String, text: String, authorName: String) {
        let comment = CommunityComment(
            id: UUID().uuidString,
            postId: postId,
            authorName: authorName,
            text: text,
            createdAt: Date()
        )
        var existing = comments[postId] ?? []
        existing.append(comment)
        comments[postId] = existing
    }

    func commentsFor(postId: String) -> [CommunityComment] {
        comments[postId] ?? []
    }

    func addEvent(_ event: CommunityEvent) {
        events.insert(event, at: 0)
    }

    func sendMessage(
        to participantId: String,
        participantName: String,
        text: String,
        fromId: String,
        fromName: String
    ) {
        let message = DirectMessage(
            id: UUID().uuidString,
            authorId: fromId,
            authorName: fromName,
            content: text,
            createdAt: Date()
        )
        if let index = conversations.firstIndex(where: { $0.participants.contains(participantId) && $0.participants.contains(fromId) }) {
            var conv = conversations[index]
            conv.messages.append(message)
            conv.lastActivity = Date()
            conversations[index] = conv
        } else {
            let conv = Conversation(
                id: UUID().uuidString,
                participants: [fromId, participantId],
                participantNames: [fromId: fromName, participantId: participantName],
                messages: [message],
                lastActivity: Date()
            )
            conversations.insert(conv, at: 0)
        }
    }

    // MARK: - Helpers

    private func isoDate(from date: Date) -> String {
        let fmt = ISO8601DateFormatter()
        fmt.formatOptions = [.withFullDate]
        return fmt.string(from: date)
    }
}
