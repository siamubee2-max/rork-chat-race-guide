import XCTest
@testable import Purrly

/// Régression H5 (red-team 2026-11-27) : les « j'aime » doivent être **par
/// utilisateur** (idempotents), jamais un compteur absolu réécrit par le client.
///  - le like envoie l'état (aimé / retiré), pas un nombre ;
///  - l'état « déjà aimé » survit au rechargement : re-liker après un
///    relancement ne doit pas rajouter +1.
@MainActor
final class CommunityLikeTests: XCTestCase {

    final class SpyLikeSync: LikeSyncing, @unchecked Sendable {
        var calls: [(postId: String, liked: Bool)] = []
        var likedIds: Set<String> = []
        var shouldFail = false
        struct Boom: Error {}

        func setLiked(postId: String, liked: Bool) async throws {
            if shouldFail { throw Boom() }
            calls.append((postId, liked))
            if liked { likedIds.insert(postId) } else { likedIds.remove(postId) }
        }

        func likedPostIds() async throws -> Set<String> {
            if shouldFail { throw Boom() }
            return likedIds
        }
    }

    private var spy: SpyLikeSync!
    private var sut: CommunityStore!

    override func setUp() {
        super.setUp()
        spy = SpyLikeSync()
        sut = CommunityStore(client: nil, likeSync: spy)
    }

    /// Avant : `toggleLike` réécrivait un compteur absolu (`likes = n`) —
    /// deux clics pouvaient gonfler le compteur et les écritures concurrentes
    /// s'écrasaient. Après : l'état aimé est envoyé, jamais un nombre.
    func testToggleLikeSendsPerUserStateNotAnAbsoluteCount() async {
        sut.addPost(content: "p", authorName: "moi", authorId: "u1")
        let id = try! XCTUnwrap(sut.posts.first?.id)

        sut.toggleLike(postId: id)
        sut.toggleLike(postId: id)
        await waitForPendingSync()

        XCTAssertEqual(spy.calls.count, 2)
        XCTAssertEqual(spy.calls.first?.postId, id)
        XCTAssertEqual(spy.calls.first?.liked, true)
        XCTAssertEqual(spy.calls.last?.liked, false,
                      "Le second clic retire le like — il ne réécrit pas un compteur")
    }

    /// Avant : `load()` remettait `isLiked = false`, donc chaque relancement
    /// permettait de re-liker (+1). Après : l'état déjà aimé est restauré,
    /// le clic suivant **retire** le like.
    func testReloadRestoresLikedStateSoTheSameUserCannotLikeTwice() async {
        sut.addPost(content: "p", authorName: "moi", authorId: "u1")
        let id = try! XCTUnwrap(sut.posts.first?.id)
        spy.likedIds = [id]   // l'utilisateur a déjà aimé ce post (persisté côté serveur)

        await sut.load()

        XCTAssertTrue(sut.posts.first?.isLiked ?? false,
                      "Le like déjà donné doit être restauré au chargement")
        sut.toggleLike(postId: id)
        await waitForPendingSync()
        XCTAssertEqual(spy.calls.last?.liked, false,
                      "Le clic suivant doit retirer le like, pas en ajouter un")
    }

    /// La synchro des likes est « fire and forget » côté UI ; laisse les tâches se terminer.
    private func waitForPendingSync() async {
        for _ in 0..<5 { await Task.yield() }
        try? await Task.sleep(nanoseconds: 100_000_000)
    }
}
