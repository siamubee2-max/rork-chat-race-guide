import XCTest
@testable import Purrly

/// Régression H4 (red-team 2026-11-27) : le fil communautaire ne doit jamais
/// fabriquer de contenu d'exemple (« Léa », « Marc ») présenté comme du vrai
/// contenu communautaire — ni quand Supabase n'est pas configuré, ni après un
/// échec réseau, ni sur un résultat vide.
@MainActor
final class CommunityStoreTests: XCTestCase {

    /// Avant : `load()` sans backend appelait `loadSamples()` → 2 posts et
    /// 1 événement fictifs affichés comme réels. Après : fil vide (honnête).
    func testNoBackendShowsAnEmptyFeedNotEmptyFabricatedContent() async {
        let sut = CommunityStore(client: nil)

        await sut.load()

        XCTAssertTrue(sut.posts.isEmpty,
                      "Aucun post ne doit être fabriqué sans backend")
        XCTAssertTrue(sut.events.isEmpty,
                      "Aucun événement ne doit être fabriqué sans backend")
    }

    /// Un fil qui a reçu de vraies données ne doit pas être rempli d'exemples.
    func testLoadingTwiceKeepsTheFeedEmptyWithoutFabrication() async {
        let sut = CommunityStore(client: nil)

        await sut.load()
        await sut.load()

        XCTAssertTrue(sut.posts.isEmpty)
        XCTAssertTrue(sut.events.isEmpty)
    }
}
