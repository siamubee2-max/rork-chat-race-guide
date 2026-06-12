import SwiftUI

struct LanguageSelectView: View {
    @Environment(AppEnvironment.self) private var environment

    private let languages: [(code: String, label: String, flag: String)] = [
        ("fr", "Français", "🇫🇷"),
        ("en", "English", "🇬🇧"),
        ("es", "Español", "🇪🇸"),
        ("de", "Deutsch", "🇩🇪"),
    ]

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 24) {
                VStack(alignment: .leading, spacing: 8) {
                    Text("Purrly")
                        .font(.largeTitle.weight(.black))
                        .foregroundStyle(AppTheme.ivory)
                    Text(String(localized: "language.subtitle"))
                        .foregroundStyle(AppTheme.textSecondary)
                }

                if #available(iOS 26.0, *) {
                    GlassEffectContainer(spacing: 12) {
                        VStack(spacing: 12) {
                            ForEach(languages, id: \.code) { lang in
                                Button {
                                    select(lang.code)
                                } label: {
                                    HStack {
                                        Text(lang.flag)
                                            .font(.title2)
                                        Text(lang.label)
                                            .font(.headline)
                                            .foregroundStyle(AppTheme.ivory)
                                        Spacer()
                                        Image(systemName: "chevron.right")
                                            .foregroundStyle(AppTheme.textMuted)
                                    }
                                    .padding(.horizontal, 16)
                                    .frame(minHeight: AppTheme.minTouch)
                                }
                                .buttonStyle(.plain)
                                .glassEffect(.regular.tint(AppTheme.primary.opacity(0.1)).interactive(), in: .rect(cornerRadius: 16))
                                .accessibilityLabel(lang.label)
                            }
                        }
                    }
                } else {
                    VStack(spacing: 12) {
                        ForEach(languages, id: \.code) { lang in
                            Button(lang.label) { select(lang.code) }
                                .buttonStyle(GlassSecondaryButtonStyle())
                        }
                    }
                }
            }
            .padding(24)
        }
        .purrlyScreenBackground()
    }

    private func select(_ code: String) {
        UserDefaults.standard.set([code], forKey: "AppleLanguages")
        environment.hasSelectedLanguage = true
    }
}
