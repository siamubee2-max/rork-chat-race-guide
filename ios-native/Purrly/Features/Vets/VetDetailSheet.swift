import SwiftUI
import MapKit

struct VetDetailSheet: View {
    let item: MKMapItem
    @Environment(\.dismiss) private var dismiss

    var body: some View {
        VStack(alignment: .leading, spacing: 20) {
            RoundedRectangle(cornerRadius: 3)
                .fill(AppTheme.textMuted)
                .frame(width: 36, height: 4)
                .frame(maxWidth: .infinity)
                .padding(.top, 12)

            VStack(alignment: .leading, spacing: 4) {
                Text(item.name ?? "Vétérinaire")
                    .font(.title3.weight(.bold))
                    .foregroundStyle(AppTheme.ivory)
                if let addr = item.placemark.title {
                    Text(addr)
                        .font(.subheadline)
                        .foregroundStyle(AppTheme.textSecondary)
                }
            }
            .padding(.horizontal, 24)

            HStack(spacing: 12) {
                if let phone = item.phoneNumber,
                   let url = URL(string: "tel:\(phone.filter { $0.isNumber })") {
                    Link(destination: url) {
                        Label("Appeler", systemImage: "phone.fill")
                            .frame(maxWidth: .infinity, minHeight: AppTheme.minTouch)
                    }
                    .buttonStyle(GlassPrimaryButtonStyle())
                }

                Button {
                    item.openInMaps(launchOptions: [
                        MKLaunchOptionsDirectionsModeKey: MKLaunchOptionsDirectionsModeWalking
                    ])
                } label: {
                    Label("Itinéraire", systemImage: "arrow.triangle.turn.up.right.circle.fill")
                        .frame(maxWidth: .infinity, minHeight: AppTheme.minTouch)
                }
                .buttonStyle(GlassPrimaryButtonStyle())
            }
            .padding(.horizontal, 24)

            Spacer()
        }
        .background(AppTheme.backgroundSecondary)
    }
}
