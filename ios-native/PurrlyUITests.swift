
/// Reproduction du refus App Review 2.1(a) « No action was taken after entering
/// the demo account and tapping the Sign in button » : parcours RÉEL (réseau
/// production, sans -uiTesting) avec le compte démo déclaré dans ASC.
@MainActor
final class ReviewerSignInTests: XCTestCase {

    func testDemoAccountSignInReachesMainTabs() {
        let app = XCUIApplication()
        app.launch() // PAS de -uiTesting : vrai backend

        // 1) Écran de langue (première installation)
        let french = app.buttons.containing(NSPredicate(format: "label CONTAINS 'Français'")).firstMatch
        if french.waitForExistence(timeout: 8) { french.tap() }

        // 2) Formulaire de connexion
        let email = app.textFields.firstMatch
        XCTAssertTrue(email.waitForExistence(timeout: 10), "Champ e-mail introuvable")
        email.tap()
        email.typeText("review@purrly.app")

        let password = app.secureTextFields.firstMatch
        XCTAssertTrue(password.waitForExistence(timeout: 5), "Champ mot de passe introuvable")
        password.tap()
        password.typeText("AppReview2026!")

        // 3) Se connecter
        let signIn = app.buttons["Se connecter"].firstMatch
        XCTAssertTrue(signIn.waitForExistence(timeout: 5), "Bouton Se connecter introuvable")
        signIn.tap()

        // 4) La barre d'onglets doit apparaître (connexion réussie)
        let tabBar = app.tabBars.firstMatch
        let ok = tabBar.waitForExistence(timeout: 25)

        // Capture d'état pour diagnostic quel que soit le résultat
        let shot = XCTAttachment(screenshot: app.screenshot())
        shot.lifetime = .keepAlways
        add(shot)

        XCTAssertTrue(ok, "Après connexion démo, la barre d'onglets n'apparaît pas — bug reviewer reproduit")
    }
}
