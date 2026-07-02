import XCTest

/// Génère les captures d'écran App Store via fastlane snapshot.
/// Lancé par `fastlane screenshots` (Snapfile cible PurrlyUITests/PurrlyScreenshots).
/// Utilise l'état de test déterministe (`-uiTesting` : connecté Pro, sans réseau).
///
/// Robuste iPhone + iPad : sur iPhone la TabView est une barre du bas (tabBar),
/// sur iPadOS 18 c'est une barre du haut que XCUITest n'expose pas comme `tabBars`.
/// On cible donc les onglets par leur libellé (FR ou EN selon la locale du run).
@MainActor
final class PurrlyScreenshots: XCTestCase {

    private let app = XCUIApplication()

    override func setUp() {
        super.setUp()
        continueAfterFailure = false
    }

    /// Bouton d'onglet par libellé — fonctionne pour la barre du bas (iPhone)
    /// comme pour la barre du haut (iPad).
    private func tab(_ fr: String, _ en: String) -> XCUIElement {
        // `.firstMatch` : sur la floating tab bar iPad, chaque onglet matche
        // plusieurs éléments imbriqués → on prend le premier pour pouvoir taper.
        for label in [fr, en] {
            let b = app.buttons[label].firstMatch
            if b.exists { return b }
            let t = app.tabBars.buttons[label].firstMatch
            if t.exists { return t }
        }
        return app.buttons[fr].firstMatch
    }

    func testCaptureAppStoreScreenshots() {
        setupSnapshot(app)
        // -uiTesting : état connecté déterministe (règles acceptées, pas de réseau).
        // -screenshots : masque les boutons debug pour des visuels App Store propres.
        app.launchArguments += ["-uiTesting", "-screenshots"]
        app.launch()

        // L'app est prête quand l'onglet Accueil est présent (barre du bas ou du haut).
        let home = tab("Accueil", "Home")
        XCTAssertTrue(home.waitForExistence(timeout: 25), "L'app doit atteindre la barre d'onglets")

        // 01 — Accueil / Scanner
        home.tap()
        snapshot("01Scan")

        // 02 — Catalogue de races
        let browse = app.buttons["browseBreedsButton"]
        if browse.waitForExistence(timeout: 5) {
            browse.tap()
            snapshot("02Breeds")
            if app.navigationBars.buttons.firstMatch.exists {
                app.navigationBars.buttons.firstMatch.tap()
            }
        }

        // Seed un chat pour une capture "Mes chats" parlante
        tab("Mes Chats", "My Cats").tap()
        if app.buttons["addCatButton"].waitForExistence(timeout: 5) {
            app.buttons["addCatButton"].tap()
            let nameField = app.textFields.firstMatch
            if nameField.waitForExistence(timeout: 5) {
                nameField.tap()
                nameField.typeText("Whiskers")
                if app.buttons["saveCatButton"].exists {
                    app.buttons["saveCatButton"].tap()
                }
            }
        }

        // 03 — Mes chats
        tab("Mes Chats", "My Cats").tap()
        snapshot("03MyCats")

        // 04 — Urgence
        tab("Urgence", "Emergency").tap()
        snapshot("04Emergency")

        // 05 — Communauté
        tab("Social", "Social").tap()
        snapshot("05Community")

        // 06 — Fonctionnalités (menu Plus)
        tab("Plus", "More").tap()
        snapshot("06Features")
    }
}
