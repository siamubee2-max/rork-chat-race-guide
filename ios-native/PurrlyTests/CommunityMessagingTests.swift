import XCTest
@testable import Purrly

/// Régression H3 (red-team 2026-11-27) : commentaires et messages privés
/// étaient **locaux uniquement** mais présentés comme envoyés — un DM disparaît
/// à la fermeture de la vue et n'arrive jamais au destinataire.
///  - un commentaire / un DM part réellement au serveur ;
///  - en cas d'échec, l'erreur est affichée au lieu d'un succès silencieux ;
///  - les messages survivent à la fermeture de la vue (stockés côté store).
@MainActor
final class CommunityMessagingTests: XCTestCase {

    final class SpyCommentSync: CommentSyncing, @unchecked Sendable {
        var sent: [CommunityComment] = []
        var serverComments: [String: [CommunityComment]] = [:]
        var shouldFail = false
        struct Boom: Error {}

        func send(_ comment: CommunityComment) async throws {
            if shouldFail { throw Boom() }
            sent.append(comment)
        }

        func comments(postId: String) async throws -> [CommunityComment] {
            if shouldFail { throw Boom() }
            return serverComments[postId] ?? []
        }
    }

    final class SpyMessageSync: DirectMessageSyncing, @unchecked Sendable {
        var sent: [(message: DirectMessage, recipientId: String)] = []
        var shouldFail = false
        struct Boom: Error {}

        func send(_ message: DirectMessage, to recipientId: String) async throws {
            if shouldFail { throw Boom() }
            sent.append((message, recipientId))
        }

        func messages(with userId: String) async throws -> [DirectMessage] { [] }
    }

    private var commentSpy: SpyCommentSync!
    private var messageSpy: SpyMessageSync!
    private var sut: CommunityStore!

    override func setUp() {
        super.setUp()
        commentSpy = SpyCommentSync()
        messageSpy = SpyMessageSync()
        sut = CommunityStore(client: nil, commentSync: commentSpy, messageSync: messageSpy)
    }

    // MARK: - Commentaires

    func testCommentIsSentToTheServer() async {
        sut.addComment(postId: "p1", text: "Super chat !", authorName: "Moi", authorId: "u1")
        await waitForPendingSync()

        XCTAssertEqual(commentSpy.sent.count, 1)
        XCTAssertEqual(commentSpy.sent.first?.postId, "p1")
        XCTAssertEqual(commentSpy.sent.first?.text, "Super chat !")
    }

    func testFailedCommentDoesNotClaimDelivery() async {
        commentSpy.shouldFail = true

        sut.addComment(postId: "p1", text: "x", authorName: "Moi", authorId: "u1")
        await waitForPendingSync()

        XCTAssertNotNil(sut.lastSyncError,
                        "L'échec doit être signalé — pas de succès silencieux")
    }

    func testCommentsAreLoadedFromTheServer() async {
        commentSpy.serverComments["p1"] = [
            CommunityComment(id: "c1", postId: "p1", authorName: "Léa",
                             text: "vrai commentaire serveur", createdAt: Date(), authorId: "u2"),
        ]

        await sut.loadComments(postId: "p1")

        XCTAssertEqual(sut.commentsFor(postId: "p1").count, 1)
        XCTAssertEqual(sut.commentsFor(postId: "p1").first?.text, "vrai commentaire serveur")
    }

    // MARK: - Messages privés

    func testDirectMessageIsSentToTheServer() async {
        sut.sendMessage(to: "u2", participantName: "Léa",
                        text: "salut", fromId: "u1", fromName: "Moi")
        await waitForPendingSync()

        XCTAssertEqual(messageSpy.sent.count, 1)
        XCTAssertEqual(messageSpy.sent.first?.recipientId, "u2")
        XCTAssertEqual(messageSpy.sent.first?.message.content, "salut")
    }

    /// Avant : les DMs vivaient dans `@State` de la vue — disparaissaient à la
    /// fermeture et n'étaient jamais relus. Après : ils sont dans le store.
    func testMessagesSurviveViewDismissal() {
        sut.sendMessage(to: "u2", participantName: "Léa",
                        text: "salut", fromId: "u1", fromName: "Moi")

        let messages = sut.messages(with: "u2")

        XCTAssertEqual(messages.count, 1)
        XCTAssertEqual(messages.first?.content, "salut",
                       "Le message doit rester consultable après fermeture de la vue")
    }

    func testFailedDirectMessageDoesNotClaimDelivery() async {
        messageSpy.shouldFail = true

        sut.sendMessage(to: "u2", participantName: "Léa",
                        text: "x", fromId: "u1", fromName: "Moi")
        await waitForPendingSync()

        XCTAssertNotNil(sut.lastSyncError,
                        "L'échec d'envoi doit être signalé")
    }

    private func waitForPendingSync() async {
        for _ in 0..<5 { await Task.yield() }
        try? await Task.sleep(nanoseconds: 100_000_000)
    }
}
