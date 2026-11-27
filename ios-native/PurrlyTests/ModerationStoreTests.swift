import XCTest
@testable import Purrly

/// Régressions H1/H2 (red-team 2026-11-27).
///  H1 : un signalement doit réellement partir au serveur (et ne pas prétendre l'avoir fait s'il échoue).
///  H2 : blocage / « contenu à moi » décidés par identifiant d'auteur, jamais par nom d'affichage.
@MainActor
final class ModerationStoreTests: XCTestCase {

    // MARK: - Doubles de test (frontière réseau uniquement)

    final class SpySubmitter: ReportSubmitting, @unchecked Sendable {
        var submitted: [ContentReport] = []
        var shouldFail = false
        struct Boom: Error {}
        func submit(_ report: ContentReport) async throws {
            if shouldFail { throw Boom() }
            submitted.append(report)
        }
    }

    private var defaults: UserDefaults!
    private var spy: SpySubmitter!
    private var sut: ModerationStore!
    private var suiteName: String!

    override func setUp() {
        super.setUp()
        suiteName = "ModerationStoreTests-\(UUID().uuidString)"
        defaults = UserDefaults(suiteName: suiteName)!
        spy = SpySubmitter()
        sut = ModerationStore(defaults: defaults, submitter: spy)
    }

    override func tearDown() {
        defaults.removePersistentDomain(forName: suiteName)
        super.tearDown()
    }

    // MARK: - H2 : identité par identifiant

    func testBlockingByIdDoesNotHideAnImpostorWithTheSameName() {
        sut.block(author: ContentAuthor(id: "u1", name: "Marc"))

        XCTAssertTrue(sut.isHidden(id: "p1", author: ContentAuthor(id: "u1", name: "Marc")))
        XCTAssertFalse(sut.isHidden(id: "p2", author: ContentAuthor(id: "u2", name: "Marc")),
                       "Un autre utilisateur nommé « Marc » ne doit pas être masqué")
    }

    func testBlockedAuthorStaysHiddenAfterRenaming() {
        sut.block(author: ContentAuthor(id: "u1", name: "Marc"))
        XCTAssertTrue(sut.isHidden(id: "p1", author: ContentAuthor(id: "u1", name: "Nouveau nom")))
    }

    /// `UUID.uuidString` (Swift) est en MAJUSCULES, Postgres renvoie les uuid en minuscules.
    func testIdsAreComparedCaseInsensitively() {
        let uuidUpper = "A1B2C3D4-0000-4000-8000-000000000001"
        let uuidLower = uuidUpper.lowercased()

        XCTAssertTrue(sut.isOwnContent(authorId: uuidLower, currentUserId: uuidUpper))

        sut.block(author: ContentAuthor(id: uuidUpper, name: "Marc"))
        XCTAssertTrue(sut.isHidden(id: "p1", author: ContentAuthor(id: uuidLower, name: "Marc")))
    }

    func testBlockFallsBackToNameWhenContentHasNoAuthorId() {
        sut.block(author: ContentAuthor(id: nil, name: "Léa"))
        XCTAssertTrue(sut.isHidden(id: "s1", author: ContentAuthor(id: nil, name: "Léa")))
    }

    func testLegacyBlockedNameStillHidesContentWithoutId() {
        defaults.set(["Léa"], forKey: "moderation_blocked_authors")   // format d'avant la correction
        let migrated = ModerationStore(defaults: defaults, submitter: spy)
        XCTAssertTrue(migrated.isHidden(id: "s1", author: ContentAuthor(id: nil, name: "Léa")))
    }

    func testUnblockRestoresVisibility() {
        let author = ContentAuthor(id: "u1", name: "Marc")
        sut.block(author: author)
        sut.unblock(author: author)
        XCTAssertFalse(sut.isHidden(id: "p1", author: author))
    }

    func testOwnContentIsDecidedByIdNotByName() {
        XCTAssertTrue(sut.isOwnContent(authorId: "me", currentUserId: "me"))
        XCTAssertFalse(sut.isOwnContent(authorId: "other", currentUserId: "me"),
                       "Même nom d'affichage ≠ même personne : on doit pouvoir signaler l'usurpateur")
        XCTAssertFalse(sut.isOwnContent(authorId: nil, currentUserId: "me"))
        XCTAssertFalse(sut.isOwnContent(authorId: "me", currentUserId: nil))
    }

    // MARK: - H1 : le signalement part vraiment

    func testReportIsSentToTheServer() async {
        let author = ContentAuthor(id: "u1", name: "Marc")
        let sent = await sut.report(kind: .post, id: "p1", author: author, reason: "Contenu inapproprié")

        XCTAssertTrue(sent)
        XCTAssertEqual(spy.submitted, [
            ContentReport(kind: .post, contentId: "p1", authorId: "u1",
                          authorName: "Marc", reason: "Contenu inapproprié")
        ])
        XCTAssertEqual(sut.pendingReportCount, 0)
    }

    func testReportedContentIsHiddenImmediately() async {
        let author = ContentAuthor(id: "u1", name: "Marc")
        _ = await sut.report(kind: .post, id: "p1", author: author, reason: "x")
        XCTAssertTrue(sut.isHidden(id: "p1", author: ContentAuthor(id: "u9", name: "Autre")),
                      "Le contenu signalé est masqué même si son auteur n'est pas bloqué")
    }

    func testFailedReportStaysHiddenAndIsQueuedForRetry() async {
        spy.shouldFail = true
        let author = ContentAuthor(id: "u1", name: "Marc")
        let sent = await sut.report(kind: .comment, id: "c1", author: author, reason: "Contenu inapproprié")

        XCTAssertFalse(sent)
        XCTAssertTrue(sut.isReported("c1"), "Masqué localement quoi qu'il arrive (Guideline 1.2)")
        XCTAssertEqual(sut.pendingReportCount, 1)
    }

    func testFailedReportDoesNotClaimTheTeamWasNotified() async {
        spy.shouldFail = true
        _ = await sut.report(kind: .post, id: "p1",
                             author: ContentAuthor(id: "u1", name: "Marc"), reason: "x")
        let message = sut.lastActionMessage ?? ""
        XCTAssertFalse(message.contains("signalé à notre équipe"),
                       "Ne pas prétendre qu'un signalement non envoyé a été transmis")
        XCTAssertFalse(message.isEmpty)
    }

    func testSuccessfulReportMessageConfirmsTransmission() async {
        _ = await sut.report(kind: .post, id: "p1",
                             author: ContentAuthor(id: "u1", name: "Marc"), reason: "x")
        XCTAssertTrue((sut.lastActionMessage ?? "").contains("signalé à notre équipe"))
    }

    func testPendingReportsAreFlushedWhenTheServerIsBack() async {
        spy.shouldFail = true
        _ = await sut.report(kind: .post, id: "p1",
                             author: ContentAuthor(id: "u1", name: "Marc"), reason: "x")
        XCTAssertEqual(sut.pendingReportCount, 1)

        spy.shouldFail = false
        await sut.flushPendingReports()

        XCTAssertEqual(sut.pendingReportCount, 0)
        XCTAssertEqual(spy.submitted.map(\.contentId), ["p1"])
    }

    func testPendingReportsSurviveARelaunch() async {
        spy.shouldFail = true
        _ = await sut.report(kind: .post, id: "p1",
                             author: ContentAuthor(id: "u1", name: "Marc"), reason: "x")

        let relaunched = ModerationStore(defaults: defaults, submitter: spy)
        XCTAssertEqual(relaunched.pendingReportCount, 1)
    }

    func testReportingTheSameContentTwiceSendsOnce() async {
        let author = ContentAuthor(id: "u1", name: "Marc")
        _ = await sut.report(kind: .post, id: "p1", author: author, reason: "x")
        _ = await sut.report(kind: .post, id: "p1", author: author, reason: "x")
        XCTAssertEqual(spy.submitted.count, 1)
    }
}
