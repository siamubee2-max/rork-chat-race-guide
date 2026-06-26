import XCTest

/// Génère les captures d'écran App Store via fastlane snapshot.
/// Lancé par `fastlane screenshots` (Snapfile cible PurrlyUITests/PurrlyScreenshots).
/// Utilise l'état de test déterministe (`-uiTesting` : connecté Pro, sans réseau).
@MainActor
final class PurrlyScreenshots: XCTestCase {

    override func setUp() {
        super.setUp()
        continueAfterFailure = false
    }

    func testCaptureAppStoreScreenshots() {
        let app = XCUIApplication()
        setupSnapshot(app)
        // -uiTesting : état connecté déterministe. -screenshots : masque les
        // boutons debug (UITest Scan/KIE) pour des visuels App Store propres.
        app.launchArguments += ["-uiTesting", "-screenshots"]
        app.launch()

        let tabBar = app.tabBars.firstMatch
        XCTAssertTrue(tabBar.waitForExistence(timeout: 20), "L'app doit atteindre la barre d'onglets")

        // 01 — Accueil / Scanner
        tabBar.buttons.element(boundBy: 0).tap()
        snapshot("01Scan")

        // 02 — Catalogue de races
        let browse = app.buttons["browseBreedsButton"]
        if browse.waitForExistence(timeout: 5) {
            browse.tap()
            snapshot("02Breeds")
            // Retour à l'accueil
            if app.navigationBars.buttons.firstMatch.exists {
                app.navigationBars.buttons.firstMatch.tap()
            }
        }

        // Seed un chat pour une capture "Mes chats" parlante
        tabBar.buttons.element(boundBy: 1).tap()
        if app.buttons["addCatButton"].waitForExistence(timeout: 5) {
            app.buttons["addCatButton"].tap()
            let nameField = app.textFields.firstMatch
            if nameField.waitForExistence(timeout: 5) {
                nameField.tap()
                nameField.typeText("Whiskers")
                app.buttons["saveCatButton"].tap()
            }
        }

        // 03 — Mes chats
        tabBar.buttons.element(boundBy: 1).tap()
        snapshot("03MyCats")

        // 04 — Urgence
        tabBar.buttons.element(boundBy: 2).tap()
        snapshot("04Emergency")

        // 05 — Communauté
        tabBar.buttons.element(boundBy: 3).tap()
        snapshot("05Community")

        // 06 — Fonctionnalités (menu Plus)
        tabBar.buttons.element(boundBy: 4).tap()
        snapshot("06Features")
    }
}
