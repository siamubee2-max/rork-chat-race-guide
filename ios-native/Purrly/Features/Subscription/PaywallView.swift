import SwiftUI

enum PurrlyFeature {
    case extraCat
    case aiMessage
    case communityPost

    var title: String {
        switch self {
        case .extraCat:       String(localized: "paywall.extraCat.title")
        case .aiMessage:      String(localized: "paywall.aiMessage.title")
        case .communityPost:  String(localized: "paywall.communityPost.title")
        }
    }

    var body: String {
        switch self {
        case .extraCat:       String(localized: "paywall.extraCat.body")
        case .aiMessage:      String(localized: "paywall.aiMessage.body")
        case .communityPost:  String(localized: "paywall.communityPost.body")
        }
    }

    var icon: String {
        switch self {
        case .extraCat:       "heart.fill"
        case .aiMessage:      "sparkles"
        case .communityPost:  "person.3.fill"
        }
    }
}

struct PaywallView: View {
    let feature: PurrlyFeature
    @Environment(\.dismiss) private var dismiss

    var body: some View {
        VStack(spacing: 24) {
            RoundedRectangle(cornerRadius: 3)
                .fill(AppTheme.textMuted)
                .frame(width: 36, height: 4)
                .padding(.top, 12)

            Image(systemName: feature.icon)
                .font(.system(size: 44))
                .foregroundStyle(AppTheme.primary)

            VStack(spacing: 8) {
                Text(feature.title)
                    .font(.title2.weight(.bold))
                    .foregroundStyle(AppTheme.ivory)
                    .multilineTextAlignment(.center)

                Text(feature.body)
                    .font(.subheadline)
                    .foregroundStyle(AppTheme.textSecondary)
                    .multilineTextAlignment(.center)
            }

            VStack(spacing: 12) {
                Button {
                    // TODO: wire RevenueCat
                    dismiss()
                } label: {
                    Text(String(localized: "paywall.upgrade"))
                        .frame(maxWidth: .infinity, minHeight: AppTheme.minTouch)
                }
                .buttonStyle(GlassPrimaryButtonStyle())

                Button(String(localized: "paywall.notNow")) { dismiss() }
                    .font(.subheadline)
                    .foregroundStyle(AppTheme.textMuted)
            }

            Spacer()
        }
        .padding(.horizontal, 28)
        .background(AppTheme.backgroundSecondary)
        .presentationDetents([.medium])
        .presentationDragIndicator(.hidden)
    }
}
