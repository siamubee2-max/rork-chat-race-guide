import Foundation

struct DiscussionMessage: Codable, Identifiable, Hashable {
    var id: String
    var authorName: String
    var content: String
    var createdAt: Date
}

struct DiscussionThread: Codable, Identifiable, Hashable {
    var id: String
    var title: String
    var authorName: String
    var createdAt: Date
    var messages: [DiscussionMessage]

    var lastMessage: DiscussionMessage? { messages.last }
    var messageCount: Int { messages.count }
}
