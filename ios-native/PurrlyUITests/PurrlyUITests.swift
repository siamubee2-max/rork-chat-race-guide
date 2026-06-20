import XCTest

/// Smoke tests UI : lancent l'app en mode test déterministe (`-uiTesting`,
/// état connecté Pro sans réseau) et exercent chaque onglet + une action clé.
/// Étendre ici au fur et à mesure (chat IA, scan, Photo Booth, urgence…).
@MainActor
final class PurrlyUITests: XCTestCase {

    private var app: XCUIApplication!

    override func setUp() {
        super.setUp()
        continueAfterFailure = false
        app = XCUIApplication()
        app.launchArguments += ["-uiTesting"]
        app.launch()
    }

    /// La barre d'onglets apparaît et expose les 5 onglets.
    func testTabBarHasFiveTabs() {
        let tabBar = app.tabBars.firstMatch
        XCTAssertTrue(tabBar.waitForExistence(timeout: 10), "La barre d'onglets doit apparaître")
        XCTAssertEqual(tabBar.buttons.count, 5, "5 onglets attendus")
    }

    /// Chaque onglet est navigable sans crash et garde la barre d'onglets visible.
    func testNavigateEveryTab() {
        let tabBar = app.tabBars.firstMatch
        XCTAssertTrue(tabBar.waitForExistence(timeout: 10))

        for index in 0..<tabBar.buttons.count {
            let tab = tabBar.buttons.element(boundBy: index)
            tab.tap()
            XCTAssertTrue(tab.waitForExistence(timeout: 5),
                          "L'onglet \(index) doit rester accessible après tap")
        }
    }

    /// Action clé : ouvrir le formulaire d'ajout de chat depuis l'onglet Chats.
    func testOpenAddCatForm() {
        let tabBar = app.tabBars.firstMatch
        XCTAssertTrue(tabBar.waitForExistence(timeout: 10))

        // Onglet "Mes chats" = 2e position.
        tabBar.buttons.element(boundBy: 1).tap()

        let addButton = app.buttons["addCatButton"]
        XCTAssertTrue(addButton.waitForExistence(timeout: 5), "Le bouton + doit être présent")
        addButton.tap()

        // Le formulaire présente un champ texte (nom du chat).
        let nameField = app.textFields.firstMatch
        XCTAssertTrue(nameField.waitForExistence(timeout: 5), "Le formulaire d'ajout doit s'ouvrir")
    }

    /// Flux complet : créer un chat, l'ouvrir, atteindre le tableau de bord santé.
    /// Valide la navigation par valeur (CatRoute) des sous-écrans.
    func testCreateCatThenOpenHealthDashboard() {
        let tabBar = app.tabBars.firstMatch
        XCTAssertTrue(tabBar.waitForExistence(timeout: 10))
        tabBar.buttons.element(boundBy: 1).tap()

        // Créer un chat nommé "Minou".
        app.buttons["addCatButton"].tap()
        let nameField = app.textFields.firstMatch
        XCTAssertTrue(nameField.waitForExistence(timeout: 5))
        nameField.tap()
        nameField.typeText("Minou")
        app.buttons["saveCatButton"].tap()

        // La ligne du chat apparaît ; on l'ouvre.
        let catRow = app.staticTexts["Minou"]
        XCTAssertTrue(catRow.waitForExistence(timeout: 5), "Le chat créé doit apparaître dans la liste")
        catRow.tap()

        // Depuis la fiche, atteindre le tableau de bord santé (NavigationLink par valeur).
        let healthLink = app.buttons["Tableau de bord santé"]
        XCTAssertTrue(healthLink.waitForExistence(timeout: 5), "La fiche chat doit s'ouvrir")
        healthLink.tap()

        XCTAssertTrue(app.staticTexts["Suivi du poids"].waitForExistence(timeout: 5),
                      "Le tableau de bord santé doit s'afficher")
    }
}
