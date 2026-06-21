import Foundation
import Observation

/// Routeur de navigation global, partagé entre l'app et les App Intents / widgets.
///
/// Les App Intents s'exécutent hors du cycle de vue : ils déposent une intention
/// ici (onglet cible, demande de scan), que `MainTabView` / `ScanHomeView`
/// observent pour réagir au prochain rendu.
@Observable
@MainActor
final class AppRouter {
    static let shared = AppRouter()

    /// Onglet actuellement sélectionné.
    var selectedTab: MainTab = .home

    /// Passe à `true` quand un déclencheur externe (Siri, widget, Spotlight)
    /// demande l'ouverture du scanner. `ScanHomeView` le consomme puis le remet à `false`.
    var pendingScan = false

    private init() {}

    /// Demande l'ouverture du scanner sur l'onglet d'accueil.
    func requestScan() {
        selectedTab = .home
        pendingScan = true
    }
}
