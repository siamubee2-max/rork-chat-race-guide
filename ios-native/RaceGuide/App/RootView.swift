import SwiftUI

struct RootView: View {
    @Environment(AppEnvironment.self) private var environment
    @State private var didBootstrap = false

    var body: some View {
        Group {
            if !didBootstrap || environment.auth.isLoading {
                LaunchLoadingView()
            } else if !environment.hasSelectedLanguage {
                LanguageSelectView()
            } else if !environment.auth.isAuthenticated {
                LoginView()
            } else {
                MainTabView()
            }
        }
        .purrlyScreenBackground()
        .task {
            guard !didBootstrap else { return }
            await environment.bootstrap()
            didBootstrap = true
        }
    }
}

private struct LaunchLoadingView: View {
    var body: some View {
        VStack(spacing: 16) {
            Image(systemName: "cat.fill")
                .font(.system(size: 56))
                .foregroundStyle(AppTheme.primary)
                .accessibilityHidden(true)
            ProgressView()
                .tint(AppTheme.primary)
            Text("Purrly")
                .font(.title2.weight(.bold))
                .foregroundStyle(AppTheme.ivory)
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity)
        .accessibilityElement(children: .combine)
        .accessibilityLabel("Chargement de Purrly")
    }
}
