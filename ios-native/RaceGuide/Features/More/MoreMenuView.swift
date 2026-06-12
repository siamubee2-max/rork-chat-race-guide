import SwiftUI

struct MoreMenuView: View {
    @Environment(AppEnvironment.self) private var environment

    var body: some View {
        List {
            if let user = environment.auth.currentUser {
                Section {
                    VStack(alignment: .leading, spacing: 4) {
                        Text(user.name.isEmpty ? user.email : user.name)
                            .font(.headline)
                            .foregroundStyle(AppTheme.ivory)
                        Text(user.email)
                            .font(.caption)
                            .foregroundStyle(AppTheme.textMuted)
                        Text(user.subscriptionTier.rawValue.uppercased())
                            .font(.caption2.weight(.bold))
                            .foregroundStyle(AppTheme.primary)
                    }
                    .padding(.vertical, 4)
                }
                .listRowBackground(AppTheme.backgroundCard)
            }

            Section(String(localized: "more.discover")) {
                NavigationLink {
                    BreedListView()
                } label: {
                    row(icon: "book.closed.fill", title: String(localized: "more.breeds"), subtitle: String(localized: "more.breeds.sub"))
                }
            }
            .listRowBackground(AppTheme.backgroundCard)

            Section(String(localized: "more.account")) {
                Button(role: .destructive) {
                    Task { await environment.auth.signOut() }
                } label: {
                    Label(String(localized: "auth.logout"), systemImage: "rectangle.portrait.and.arrow.right")
                }
            }
            .listRowBackground(AppTheme.backgroundCard)
        }
        .listStyle(.insetGrouped)
        .scrollContentBackground(.hidden)
        .purrlyScreenBackground()
        .navigationTitle(String(localized: "tab.more"))
    }

    private func row(icon: String, title: String, subtitle: String) -> some View {
        HStack(spacing: 12) {
            Image(systemName: icon)
                .foregroundStyle(AppTheme.primary)
                .frame(width: 28)
            VStack(alignment: .leading, spacing: 2) {
                Text(title).foregroundStyle(AppTheme.ivory)
                Text(subtitle).font(.caption).foregroundStyle(AppTheme.textMuted)
            }
        }
        .frame(minHeight: AppTheme.minTouch)
    }
}
