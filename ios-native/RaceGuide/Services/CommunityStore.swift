import Foundation

/// Données communauté locales (à brancher sur Supabase social plus tard).
@Observable
@MainActor
final class CommunityStore{
    private(set) var posts: [CommunityPost] = []
    private(set) var events: [CommunityEvent] = []
    private(set) var comments: [String: [CommunityComment]] = [:]

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
                location: "Lyon",
                date: now.addingTimeInterval(86_400 * 5)
            ),
            CommunityEvent(
                id: "e2",
                title: "Journée adoption — refuge",
                location: "Paris",
                date: now.addingTimeInterval(86_400 * 12)
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
}
