import XCTest
@testable import RaceGuide

@MainActor
final class UsageLimitsTests: XCTestCase {
    var sut: UsageLimits!
    let testDefaults = UserDefaults(suiteName: "UsageLimitsTests")!

    override func setUp() {
        super.setUp()
        testDefaults.removePersistentDomain(forName: "UsageLimitsTests")
        sut = UsageLimits(defaults: testDefaults)
    }

    func testFreshUserCanSendAIMessage() {
        XCTAssertTrue(sut.canSendAIMessage)
        XCTAssertEqual(sut.aiMessagesThisMonth, 0)
    }

    func testAfter15MessagesCannotSend() {
        for _ in 0..<15 { sut.recordAIMessage() }
        XCTAssertFalse(sut.canSendAIMessage)
        XCTAssertEqual(sut.aiMessagesThisMonth, 15)
    }

    func testCanAddFirstCat() {
        XCTAssertTrue(sut.canAddCat(currentCount: 0))
    }

    func testCannotAddSecondCatOnFree() {
        XCTAssertFalse(sut.canAddCat(currentCount: 1))
    }

    func testPremiumCanAddUnlimitedCats() {
        sut.isPremium = true
        XCTAssertTrue(sut.canAddCat(currentCount: 5))
    }

    func testPremiumCanSendUnlimitedMessages() {
        sut.isPremium = true
        for _ in 0..<20 { sut.recordAIMessage() }
        XCTAssertTrue(sut.canSendAIMessage)
    }
}
