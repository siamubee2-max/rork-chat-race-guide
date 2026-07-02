import SwiftUI

/// Palette Purrly — alignée sur `expo/constants/colors.ts`
enum AppTheme {
    static let background = Color(hex: 0x0C0A09)
    static let backgroundSecondary = Color(hex: 0x171412)
    static let backgroundCard = Color(hex: 0x1C1917)
    static let primary = Color(hex: 0xD4A05C)
    static let primaryLight = Color(hex: 0xF7D596)
    static let ivory = Color(hex: 0xFDF9EF)
    static let textSecondary = Color(hex: 0xD6D3D1)
    static let textMuted = Color(hex: 0x78716C)
    static let border = Color.white.opacity(0.12)
    static let success = Color(hex: 0x10B981)
    static let error = Color(hex: 0xEF4444)
    static let heart = Color(hex: 0xEF4444)

    static let heroGradient = LinearGradient(
        colors: [.clear, Color(hex: 0x0C0A09).opacity(0.35), AppTheme.background],
        startPoint: .top,
        endPoint: .bottom
    )

    static let minTouch: CGFloat = 44
}

extension Color {
    init(hex: UInt32, opacity: Double = 1) {
        let r = Double((hex >> 16) & 0xFF) / 255
        let g = Double((hex >> 8) & 0xFF) / 255
        let b = Double(hex & 0xFF) / 255
        self.init(.sRGB, red: r, green: g, blue: b, opacity: opacity)
    }
}
