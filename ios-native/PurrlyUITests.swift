
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

/// Reproduit + valide le refus 2.1(a) « app affichée dans une autre langue » :
/// appareil simulé en français, on choisit English, l'écran suivant DOIT être
/// en anglais (« Sign In », pas « Se connecter »).
@MainActor
final class LanguageSwitchTests: XCTestCase {

    func testSelectingEnglishAppliesEnglishImmediately() {
        let app = XCUIApplication()
        // Simule un appareil réglé en français + repart d'un état neuf.
        app.launchArguments += ["-AppleLanguages", "(fr)", "-purrly.reset-language"]
        app.launch()

        // Écran de langue → choisir English.
        let english = app.buttons["English"].firstMatch
        XCTAssertTrue(english.waitForExistence(timeout: 12), "Bouton English introuvable")
        english.tap()

        // L'écran de connexion doit être en ANGLAIS.
        let signInEN = app.buttons["Sign In"].firstMatch
        let signInFR = app.buttons["Se connecter"].firstMatch
        let appeared = signInEN.waitForExistence(timeout: 10)

        let shot = XCTAttachment(screenshot: app.screenshot())
        shot.lifetime = .keepAlways
        add(shot)

        XCTAssertTrue(appeared, "Le bouton anglais 'Sign In' doit apparaître après avoir choisi English")
        XCTAssertFalse(signInFR.exists, "Aucun texte français ne doit rester après avoir choisi English")
    }
}
