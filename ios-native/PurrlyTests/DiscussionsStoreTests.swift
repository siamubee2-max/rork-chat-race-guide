import XCTest
@testable import Purrly

/// Régression H4 (red-team 2026-11-27) : les discussions ne doivent jamais
/// afficher de fils d'exemple fabriqués comme de vrais fils.
@MainActor
final class DiscussionsStoreTests: XCTestCase {

    func testNoBackendShowsNoFabricatedThreads() async {
        let sut = DiscussionsStore(client: nil)

        await sut.load()

        XCTAssertTrue(sut.threads.isEmpty,
                      "Aucun fil de discussion ne doit être fabriqué sans backend")
    }
}
