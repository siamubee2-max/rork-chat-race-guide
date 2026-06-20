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

    /// Onglet Plus → Assistant IA : l'écran de chat et son composer s'ouvrent.
    func testMoreMenuOpensAssistantChat() {
        let tabBar = app.tabBars.firstMatch
        XCTAssertTrue(tabBar.waitForExistence(timeout: 10))
        tabBar.buttons.element(boundBy: 4).tap() // Plus

        let assistantRow = app.staticTexts["Assistant IA"]
        XCTAssertTrue(assistantRow.waitForExistence(timeout: 5), "La ligne Assistant IA doit être listée")
        assistantRow.tap()

        XCTAssertTrue(app.textFields["assistantComposer"].waitForExistence(timeout: 5),
                      "Le composer de chat doit s'afficher")
    }

    /// Onglet Plus → Analyser une photo : l'écran d'analyse s'ouvre.
    func testMoreMenuOpensPhotoAnalyzer() {
        let tabBar = app.tabBars.firstMatch
        XCTAssertTrue(tabBar.waitForExistence(timeout: 10))
        tabBar.buttons.element(boundBy: 4).tap() // Plus

        let row = app.staticTexts["Analyser une photo"]
        XCTAssertTrue(row.waitForExistence(timeout: 5))
        row.tap()

        // PhotoAnalyzerView a pour titre "Analyser une photo".
        XCTAssertTrue(app.navigationBars["Analyser une photo"].waitForExistence(timeout: 5),
                      "L'écran d'analyse photo doit s'ouvrir")
    }

    /// Onglet Urgence → bouton + : le formulaire de création d'alerte s'ouvre.
    func testEmergencyCreateAlertSheet() {
        let tabBar = app.tabBars.firstMatch
        XCTAssertTrue(tabBar.waitForExistence(timeout: 10))
        tabBar.buttons.element(boundBy: 2).tap() // Urgence

        let addButton = app.buttons["createAlertButton"]
        XCTAssertTrue(addButton.waitForExistence(timeout: 5), "Le bouton + d'urgence doit être présent")
        addButton.tap()

        XCTAssertTrue(app.textFields.firstMatch.waitForExistence(timeout: 5),
                      "Le formulaire de création d'alerte doit s'ouvrir")
    }

    /// Onglet Accueil : l'écran de scan/édition se charge.
    func testScanHomeLoads() {
        let tabBar = app.tabBars.firstMatch
        XCTAssertTrue(tabBar.waitForExistence(timeout: 10))
        tabBar.buttons.element(boundBy: 0).tap() // Accueil

        XCTAssertTrue(app.staticTexts["ÉDITION LUXE"].waitForExistence(timeout: 5),
                      "L'écran d'accueil doit afficher la section édition")
    }

    /// Onglet Social : la bascule de segment (Fil → Événements) change le FAB.
    func testCommunitySegmentSwitch() {
        let tabBar = app.tabBars.firstMatch
        XCTAssertTrue(tabBar.waitForExistence(timeout: 10))
        tabBar.buttons.element(boundBy: 3).tap() // Social

        // En "Fil", le FAB de publication est présent.
        XCTAssertTrue(app.buttons["Nouvelle publication"].waitForExistence(timeout: 5),
                      "Le FAB de publication doit être présent en mode Fil")

        // Bascule vers "Événements".
        let segments = app.segmentedControls.firstMatch
        XCTAssertTrue(segments.waitForExistence(timeout: 5))
        segments.buttons.element(boundBy: 1).tap()

        XCTAssertTrue(app.buttons["Nouvel événement"].waitForExistence(timeout: 5),
                      "Le FAB d'événement doit apparaître après bascule de segment")
    }

    /// Flux CRUD complet : créer une alerte urgence et la voir dans la liste.
    func testEmergencyCreateAlertEndToEnd() {
        let tabBar = app.tabBars.firstMatch
        XCTAssertTrue(tabBar.waitForExistence(timeout: 10))
        tabBar.buttons.element(boundBy: 2).tap() // Urgence

        app.buttons["createAlertButton"].tap()

        let nameField = app.textFields["alertCatNameField"]
        XCTAssertTrue(nameField.waitForExistence(timeout: 5))
        nameField.tap()
        nameField.typeText("Filou-UITest")

        let locationField = app.textFields["alertLocationField"]
        locationField.tap()
        locationField.typeText("Lyon")

        app.buttons["publishAlertButton"].tap()

        // De retour sur la liste, l'alerte créée apparaît.
        XCTAssertTrue(app.staticTexts["Filou-UITest"].waitForExistence(timeout: 5),
                      "L'alerte créée doit apparaître dans la liste d'urgence")
    }

    /// Onglet Plus → Photo Booth : l'écran s'ouvre.
    func testMoreOpensPhotoBooth() {
        let tabBar = app.tabBars.firstMatch
        XCTAssertTrue(tabBar.waitForExistence(timeout: 10))
        tabBar.buttons.element(boundBy: 4).tap() // Plus

        let row = app.staticTexts["Photo Booth"]
        XCTAssertTrue(row.waitForExistence(timeout: 5))
        row.tap()

        XCTAssertTrue(app.navigationBars["Photo Booth 🐱"].waitForExistence(timeout: 5),
                      "L'écran Photo Booth doit s'ouvrir")
    }

    /// Flux profond (réseau mocké) : envoyer un message IA → la réponse s'affiche.
    func testAssistantChatReturnsReply() {
        let tabBar = app.tabBars.firstMatch
        XCTAssertTrue(tabBar.waitForExistence(timeout: 10))
        tabBar.buttons.element(boundBy: 4).tap() // Plus
        app.staticTexts["Assistant IA"].tap()

        let composer = app.textFields["assistantComposer"]
        XCTAssertTrue(composer.waitForExistence(timeout: 5))
        composer.tap()
        composer.typeText("Bonjour")
        app.buttons["assistantSendButton"].tap()

        // Le stub réseau renvoie cette réponse déterministe ; la bulle expose
        // son contenu via l'accessibilityLabel ("Assistant : <contenu>").
        let reply = app.staticTexts.containing(
            NSPredicate(format: "label CONTAINS %@", "Réponse de test IA.")
        ).firstMatch
        XCTAssertTrue(reply.waitForExistence(timeout: 8),
                      "La réponse IA mockée doit apparaître dans le fil")
    }

    /// Flux profond (réseau mocké) : scanner une photo → la race s'affiche.
    /// Le bouton "uiTestScanButton" injecte une image sans le PhotosPicker système.
    func testScanReturnsBreedResult() {
        let tabBar = app.tabBars.firstMatch
        XCTAssertTrue(tabBar.waitForExistence(timeout: 10))
        tabBar.buttons.element(boundBy: 0).tap() // Accueil

        let scanButton = app.buttons["uiTestScanButton"]
        XCTAssertTrue(scanButton.waitForExistence(timeout: 5))
        scanButton.tap()

        // Le stub /breed-scan renvoie topBreed "Européen".
        XCTAssertTrue(app.staticTexts["Européen"].waitForExistence(timeout: 8),
                      "Le résultat de scan mocké doit afficher la race")
    }
}
