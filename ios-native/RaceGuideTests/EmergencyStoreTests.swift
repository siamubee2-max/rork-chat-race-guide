import XCTest
@testable import RaceGuide

@MainActor
final class EmergencyStoreTests: XCTestCase {
    var sut: EmergencyStore!
    let testDefaults = UserDefaults(suiteName: "EmergencyStoreTests")!

    override func setUp() {
        super.setUp()
        testDefaults.removePersistentDomain(forName: "EmergencyStoreTests")
        sut = EmergencyStore(defaults: testDefaults)
    }

    func testAddAlert() {
        let alert = EmergencyAlert.create(type: .lost, catName: "Mimi", location: "Paris 11",
                                          description: "Roux, collier rouge", contactPhone: "0612345678")
        sut.add(alert)
        XCTAssertEqual(sut.alerts.count, 1)
        XCTAssertEqual(sut.alerts.first?.catName, "Mimi")
    }

    func testResolveAlert() {
        let alert = EmergencyAlert.create(type: .lost, catName: "Félix", location: "Lyon",
                                          description: "", contactPhone: "")
        sut.add(alert)
        sut.resolve(id: alert.id)
        XCTAssertTrue(sut.alerts.first?.isResolved ?? false)
    }

    func testDeleteAlert() {
        let alert = EmergencyAlert.create(type: .found, catName: "Luna", location: "Bordeaux",
                                          description: "", contactPhone: "")
        sut.add(alert)
        sut.delete(id: alert.id)
        XCTAssertTrue(sut.alerts.isEmpty)
    }

    func testPersistsAcrossInit() {
        let alert = EmergencyAlert.create(type: .lost, catName: "Oscar", location: "Nice",
                                          description: "", contactPhone: "")
        sut.add(alert)
        let sut2 = EmergencyStore(defaults: testDefaults)
        XCTAssertEqual(sut2.alerts.count, 1)
    }

    func testAlertsOrderedNewestFirst() {
        let a1 = EmergencyAlert.create(type: .lost, catName: "A", location: "X", description: "", contactPhone: "")
        let a2 = EmergencyAlert.create(type: .found, catName: "B", location: "Y", description: "", contactPhone: "")
        sut.add(a1)
        sut.add(a2)
        XCTAssertEqual(sut.alerts.first?.catName, "B") // newest first
    }
}
