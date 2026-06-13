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
}

struct CommunityEvent: Identifiable, Hashable {
    let id: String
    let title: String
    let location: String
    let date: Date
}

struct CommunityComment: Identifiable, Hashable {
    let id: String
    let postId: String
    let authorName: String
    let text: String
    let createdAt: Date
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
