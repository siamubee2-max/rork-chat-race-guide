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
            VStack(spacing: 28) {
                VStack(spacing: 12) {
                    Image(systemName: "cat.fill")
                        .font(.system(size: 64))
                        .foregroundStyle(AppTheme.primary)
                        .accessibilityHidden(true)
                    Text("Purrly")
                        .font(.largeTitle.weight(.black))
                        .foregroundStyle(AppTheme.ivory)
                    Text(String(localized: "language.subtitle"))
                        .foregroundStyle(AppTheme.textSecondary)
                        .multilineTextAlignment(.center)
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
            .purrlyReadableWidth(520)
            .frame(maxWidth: .infinity)
            .containerRelativeFrame(.vertical, alignment: .center)
        }
        .purrlyScreenBackground()
    }

    private func select(_ code: String) {
        // Applique la langue À CHAUD (swizzle du bundle) — pas seulement au
        // prochain lancement. Corrige le refus 2.1(a) « app affichée dans une
        // autre langue que celle sélectionnée ».
        LanguageManager.shared.select(code)
        environment.hasSelectedLanguage = true
    }
}
