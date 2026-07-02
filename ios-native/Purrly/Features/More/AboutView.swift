import SwiftUI

struct AboutView: View {
    var body: some View {
        ScrollView {
            VStack(spacing: 24) {
                Image(systemName: "cat.fill")
                    .font(.system(size: 64))
                    .foregroundStyle(AppTheme.primary)
                Text("Purrly")
                    .font(.largeTitle.weight(.bold))
                    .foregroundStyle(AppTheme.ivory)
                Text("Version 1.0.0")
                    .font(.subheadline)
                    .foregroundStyle(AppTheme.textMuted)
                Text("La super-app N°1 pour chats — scanner de races, assistant IA vétérinaire, communauté, urgences et suivi complet en une seule app.")
                    .font(.body)
                    .foregroundStyle(AppTheme.textSecondary)
                    .multilineTextAlignment(.center)
                    .padding(.horizontal)
            }
            .padding(32)
            .frame(maxWidth: .infinity)
        }
        .navigationTitle("À propos")
        .purrlyScreenBackground()
    }
}
