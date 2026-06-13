import SwiftUI

struct SheltersView: View {
    var body: some View {
        VStack(spacing: 16) {
            Image(systemName: "house.heart.fill")
                .font(.system(size: 52))
                .foregroundStyle(AppTheme.primary)
            Text("Annuaire des refuges")
                .font(.title2.weight(.bold))
                .foregroundStyle(AppTheme.ivory)
            Text("Bientôt disponible")
                .foregroundStyle(AppTheme.textMuted)
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity)
        .purrlyScreenBackground()
        .navigationTitle("Refuges")
    }
}
