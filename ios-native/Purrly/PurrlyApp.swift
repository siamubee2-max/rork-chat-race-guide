import SwiftUI

@main
struct PurrlyApp: App {
    @State private var environment = AppEnvironment()

    var body: some Scene {
        WindowGroup {
            RootView()
                .environment(environment)
                .preferredColorScheme(.dark)
                .onOpenURL { url in
                    // purrly://scan — déclenché par le widget d'accueil.
                    if url.scheme == "purrly", url.host == "scan" {
                        AppRouter.shared.requestScan()
                    }
                }
        }
    }
}
