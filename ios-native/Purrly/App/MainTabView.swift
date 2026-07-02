import SwiftUI

enum MainTab: String, CaseIterable, Identifiable {
    case home
    case cats
    case emergency
    case social
    case more

    var id: String { rawValue }

    var title: String {
        switch self {
        case .home:      String(localized: "tab.home")
        case .cats:      String(localized: "tab.cats")
        case .emergency: String(localized: "tab.emergency")
        case .social:    String(localized: "tab.social")
        case .more:      String(localized: "tab.more")
        }
    }

    var symbol: String {
        switch self {
        case .home:      "house.fill"
        case .cats:      "heart.fill"
        case .emergency: "cross.circle.fill"
        case .social:    "person.3.fill"
        case .more:      "square.grid.2x2.fill"
        }
    }
}

struct MainTabView: View {
    @Bindable private var router = AppRouter.shared
    @Environment(AppEnvironment.self) private var environment

    var body: some View {
        TabView(selection: $router.selectedTab) {
            NavigationStack { ScanHomeView() }
                .tag(MainTab.home)
                .tabItem { Label(MainTab.home.title, systemImage: MainTab.home.symbol) }

            NavigationStack { CatsListView() }
                .tag(MainTab.cats)
                .tabItem { Label(MainTab.cats.title, systemImage: MainTab.cats.symbol) }

            NavigationStack { EmergencyHomeView() }
                .tag(MainTab.emergency)
                .tabItem { Label(MainTab.emergency.title, systemImage: MainTab.emergency.symbol) }

            NavigationStack { CommunityHubView() }
                .tag(MainTab.social)
                .tabItem { Label(MainTab.social.title, systemImage: MainTab.social.symbol) }

            NavigationStack { MoreMenuView() }
                .tag(MainTab.more)
                .tabItem { Label(MainTab.more.title, systemImage: MainTab.more.symbol) }
        }
        .tint(AppTheme.primaryLight)
        .accessibilityIdentifier("mainTabView")
        .toolbarBackground(.ultraThinMaterial, for: .tabBar)
        .toolbarBackground(.visible, for: .tabBar)
        // Guideline 1.2 — règles communautaires acceptées avant tout accès à l'app.
        .fullScreenCover(isPresented: Binding(
            get: { !environment.moderation.hasAcceptedTerms },
            set: { _ in }
        )) {
            CommunityRulesGate()
        }
        // Confirmation unique après un signalement / blocage, où qu'il survienne.
        .alert("Information", isPresented: Binding(
            get: { environment.moderation.lastActionMessage != nil },
            set: { if !$0 { environment.moderation.lastActionMessage = nil } }
        )) {
            Button("OK") { environment.moderation.lastActionMessage = nil }
        } message: {
            Text(environment.moderation.lastActionMessage ?? "")
        }
    }
}
