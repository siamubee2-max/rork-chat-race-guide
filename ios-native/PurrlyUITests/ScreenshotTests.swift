import XCTest

/// Génère les captures d'écran de la fiche App Store (6,9″).
/// Lance l'app en mode déterministe (`-uiTesting`), navigue les écrans clés et
/// attache chaque capture (`.keepAlways`) pour extraction via xcresulttool.
@MainActor
final class ScreenshotTests: XCTestCase {

    private var app: XCUIApplication!

    override func setUp() {
        super.setUp()
        continueAfterFailure = true
        app = XCUIApplication()
        app.launchArguments += ["-uiTesting", "-screenshots"]
        // Force le français pour les captures de la fiche App Store FR.
        app.launchArguments += ["-AppleLanguages", "(fr)", "-AppleLocale", "fr_FR"]
        app.launch()
    }

    private func snap(_ name: String) {
        let shot = XCUIScreen.main.screenshot()
        let att = XCTAttachment(screenshot: shot)
        att.name = name
        att.lifetime = .keepAlways
        add(att)
    }

    func testCaptureAppStoreScreenshots() {
        let tabBar = app.tabBars.firstMatch
        XCTAssertTrue(tabBar.waitForExistence(timeout: 20), "Tab bar attendue")
        sleep(3) // laisse l'image hero se charger
        snap("01-scan-home")

        // Parcours des races
        let browse = app.buttons["Parcourir les races"]
        if browse.waitForExistence(timeout: 4) {
            browse.tap()
            sleep(2)
            snap("02-breeds")

            // Détail d'une race (1re cellule/bouton/lien disponible)
            let candidates = [app.cells.firstMatch, app.collectionViews.cells.firstMatch]
            if let cell = candidates.first(where: { $0.waitForExistence(timeout: 2) }) {
                cell.tap()
                sleep(2)
                snap("03-breed-detail")
            }
            tabBar.buttons.element(boundBy: 0).tap()
            sleep(1)
        }

        // Onglets restants
        let tabs: [(Int, String)] = [(1, "04-cats"), (2, "05-emergency"), (3, "06-social"), (4, "07-more")]
        for (idx, name) in tabs {
            if tabBar.buttons.count > idx {
                tabBar.buttons.element(boundBy: idx).tap()
                sleep(2)
                snap(name)
            }
        }
    }
}
