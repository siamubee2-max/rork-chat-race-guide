import Foundation

/// Données communauté locales (à brancher sur Supabase social plus tard).
@MainActor
final class CommunityStore: ObservableObject {
    @Published private(set) var posts: [CommunityPost] = []
    @Published private(set) var events: [CommunityEvent] = []

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
}
