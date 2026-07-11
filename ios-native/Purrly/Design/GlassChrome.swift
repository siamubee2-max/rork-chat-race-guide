import SwiftUI

/// Liquid Glass (iOS 26) — wrappers avec repli matériau pour accessibilité.
enum GlassChrome {
    @ViewBuilder
    static func card<Content: View>(
        tint: Color = AppTheme.primary.opacity(0.15),
        interactive: Bool = false,
        @ViewBuilder content: () -> Content
    ) -> some View {
        if #available(iOS 26.0, *) {
            content()
                .padding(16)
                .glassEffect(
                    interactive
                        ? .regular.tint(tint).interactive()
                        : .regular.tint(tint),
                    in: .rect(cornerRadius: 20)
                )
        } else {
            content()
                .padding(16)
                .background(.ultraThinMaterial, in: RoundedRectangle(cornerRadius: 20))
                .overlay(
                    RoundedRectangle(cornerRadius: 20)
                        .stroke(AppTheme.border, lineWidth: 1)
                )
        }
    }

}

struct GlassPrimaryButtonStyle: ButtonStyle {
    @Environment(\.accessibilityReduceMotion) private var reduceMotion

    func makeBody(configuration: Configuration) -> some View {
        // Fond opaque UNIQUEMENT — pas de glassEffect(.interactive()) ici.
        // App Review (iPad Air M3, iPadOS 26.5.x) a refusé 3 builds pour des
        // éléments de cet habillage glass qui ne répondaient pas ou ne se
        // rendaient pas sur leur appareil (2.1a) ; le bouton d'action principal
        // doit fonctionner partout, sans dépendre du rendu Liquid Glass.
        configuration.label
            .font(.headline.weight(.bold))
            .foregroundStyle(AppTheme.background)
            .frame(maxWidth: .infinity, minHeight: AppTheme.minTouch)
            .background(AppTheme.primary, in: RoundedRectangle(cornerRadius: 18))
            .contentShape(RoundedRectangle(cornerRadius: 18))
        .scaleEffect(reduceMotion ? 1 : (configuration.isPressed ? 0.98 : 1))
        .opacity(configuration.isPressed ? 0.92 : 1)
        .animation(reduceMotion ? nil : .easeOut(duration: 0.15), value: configuration.isPressed)
    }
}

struct GlassSecondaryButtonStyle: ButtonStyle {
    func makeBody(configuration: Configuration) -> some View {
        Group {
            if #available(iOS 26.0, *) {
                configuration.label
                    .font(.headline.weight(.semibold))
                    .foregroundStyle(AppTheme.ivory)
                    .frame(maxWidth: .infinity, minHeight: AppTheme.minTouch)
                    .glassEffect(.regular.tint(AppTheme.primary.opacity(0.12)).interactive(), in: .rect(cornerRadius: 18))
            } else {
                configuration.label
                    .font(.headline.weight(.semibold))
                    .foregroundStyle(AppTheme.ivory)
                    .frame(maxWidth: .infinity, minHeight: AppTheme.minTouch)
                    .background(AppTheme.backgroundCard, in: RoundedRectangle(cornerRadius: 18))
                    .overlay(RoundedRectangle(cornerRadius: 18).stroke(AppTheme.border))
            }
        }
        .opacity(configuration.isPressed ? 0.85 : 1)
    }
}

extension View {
    func purrlyScreenBackground() -> some View {
        background(AppTheme.background.ignoresSafeArea())
    }

    /// Borne la largeur du contenu sur les écrans larges (iPad / size class regular)
    /// en le centrant, pour éviter la mise en page iPhone étirée. Sans effet sur iPhone.
    func purrlyReadableWidth(_ maxWidth: CGFloat = 680) -> some View {
        modifier(ReadableWidthModifier(maxWidth: maxWidth))
    }
}

private struct ReadableWidthModifier: ViewModifier {
    @Environment(\.horizontalSizeClass) private var horizontalSizeClass
    let maxWidth: CGFloat

    func body(content: Content) -> some View {
        content
            .frame(maxWidth: horizontalSizeClass == .regular ? maxWidth : .infinity)
            .frame(maxWidth: .infinity) // centre la colonne bornée dans l'espace disponible
    }
}
