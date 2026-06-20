import Foundation

/// Session HTTP partagée par les services réseau. En temps normal c'est
/// `URLSession.shared` ; sous tests UI (`-uiTesting`, builds DEBUG) elle est
/// remplacée par une session qui intercepte les requêtes via `StubURLProtocol`
/// pour rendre les flux (chat IA, KIE…) déterministes et hors-réseau.
enum AppHTTP {
    static let session: URLSession = {
        #if DEBUG
        if ProcessInfo.processInfo.arguments.contains("-uiTesting") {
            let config = URLSessionConfiguration.ephemeral
            config.protocolClasses = [StubURLProtocol.self]
            return URLSession(configuration: config)
        }
        #endif
        return .shared
    }()
}
