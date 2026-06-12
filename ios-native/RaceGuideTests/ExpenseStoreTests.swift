import XCTest
@testable import RaceGuide

@MainActor
final class ExpenseStoreTests: XCTestCase {
    var sut: ExpenseStore!
    let testDefaults = UserDefaults(suiteName: "ExpenseStoreTests")!

    override func setUp() {
        super.setUp()
        testDefaults.removePersistentDomain(forName: "ExpenseStoreTests")
        sut = ExpenseStore(defaults: testDefaults)
    }

    func testAddExpense() {
        let e = Expense.create(category: .vet, amount: 85.0, date: Date())
        sut.add(e)
        XCTAssertEqual(sut.expenses.count, 1)
        XCTAssertEqual(sut.expenses.first?.amount, 85.0)
    }

    func testTotalByCategory() {
        sut.add(Expense.create(category: .food, amount: 30, date: Date()))
        sut.add(Expense.create(category: .food, amount: 20, date: Date()))
        sut.add(Expense.create(category: .vet,  amount: 90, date: Date()))
        XCTAssertEqual(sut.total(for: .food), 50)
        XCTAssertEqual(sut.total(for: .vet),  90)
    }

    func testDeleteExpense() {
        let e = Expense.create(category: .toy, amount: 12, date: Date())
        sut.add(e)
        sut.delete(id: e.id)
        XCTAssertTrue(sut.expenses.isEmpty)
    }

    func testGrandTotal() {
        sut.add(Expense.create(category: .food, amount: 30, date: Date()))
        sut.add(Expense.create(category: .vet,  amount: 70, date: Date()))
        XCTAssertEqual(sut.grandTotal, 100)
    }

    func testPersistsAcrossInit() {
        let e = Expense.create(category: .grooming, amount: 45, date: Date())
        sut.add(e)
        let sut2 = ExpenseStore(defaults: testDefaults)
        XCTAssertEqual(sut2.expenses.count, 1)
        XCTAssertEqual(sut2.expenses.first?.amount, 45)
    }
}
