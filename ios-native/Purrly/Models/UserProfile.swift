import Foundation

enum SubscriptionTier: String, Codable, CaseIterable {
    case free
    case premium
    case premium_plus
    case family
    case pro

    var isPremium: Bool { self != .free }
}

struct UserProfile: Identifiable, Equatable {
    let id: String
    let email: String
    var name: String
    var subscriptionTier: SubscriptionTier
    var subscriptionExpiry: Date?
}

struct CommunityPost: Identifiable, Hashable {
    let id: String
    let authorName: String
    let content: String
    let createdAt: Date
    var likes: Int
    var isLiked: Bool
    /// Identifiant serveur de l'auteur (nil pour le contenu d'exemple/ancien).
    var authorId: String? = nil

    var author: ContentAuthor { ContentAuthor(id: authorId, name: authorName) }
}

struct CommunityEvent: Codable, Identifiable, Hashable {
    var id: String
    var title: String
    var description: String
    var date: String       // "YYYY-MM-DD"
    var time: String       // "HH:MM"
    var location: String
    var address: String
    var type: String       // meetup | adoption | show | workshop | charity
    var maxAttendees: Int
    var price: String      // "" means free
    var attendees: [String] // user IDs
    var createdAt: Date
}

struct CommunityComment: Identifiable, Hashable {
    let id: String
    let postId: String
    let authorName: String
    let text: String
    let createdAt: Date
    var authorId: String? = nil

    var author: ContentAuthor { ContentAuthor(id: authorId, name: authorName) }
}

struct DirectMessage: Codable, Identifiable, Hashable {
    var id: String
    var authorId: String
    var authorName: String
    var content: String
    var createdAt: Date
}

struct Conversation: Codable, Identifiable, Hashable {
    var id: String
    var participants: [String]
    var participantNames: [String: String]
    var messages: [DirectMessage]
    var lastActivity: Date
}

struct ChatMessage: Identifiable, Hashable, Codable {
    let id: String
    let role: ChatRole
    let content: String
    let createdAt: Date
}

enum ChatRole: String, Codable {
    case user
    case assistant
    case system
}
