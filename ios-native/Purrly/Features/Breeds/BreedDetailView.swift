import SwiftUI

struct BreedDetailView: View {
    let breed: BreedProfile

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 20) {
                AsyncImage(url: URL(string: breed.imageUri)) { phase in
                    switch phase {
                    case .success(let image):
                        image.resizable().scaledToFill()
                    default:
                        AppTheme.backgroundSecondary
                    }
                }
                .frame(height: 240)
                .clipShape(RoundedRectangle(cornerRadius: 20))
                .accessibilityLabel(breed.name)

                VStack(alignment: .leading, spacing: 8) {
                    Text(breed.name)
                        .font(.largeTitle.weight(.bold))
                        .foregroundStyle(AppTheme.ivory)
                    Text(breed.origin)
                        .foregroundStyle(AppTheme.primary)
                    Text(breed.temperament.joined(separator: " · "))
                        .font(.subheadline)
                        .foregroundStyle(AppTheme.textSecondary)
                }

                section(String(localized: "breeds.coat"), items: breed.coat.notes + [breed.coat.length, breed.coat.shedding])
                section(String(localized: "breeds.care"), items: breed.care.grooming + breed.care.habits)
                section(String(localized: "breeds.health"), items: breed.health.common + breed.health.prevention)
                section(String(localized: "breeds.diet"), items: breed.diet.recommended)
            }
            .padding(20)
        }
        .purrlyScreenBackground()
        .navigationBarTitleDisplayMode(.inline)
    }

    @ViewBuilder
    private func section(_ title: String, items: [String]) -> some View {
        GlassChrome.card {
            VStack(alignment: .leading, spacing: 10) {
                Text(title)
                    .font(.headline)
                    .foregroundStyle(AppTheme.ivory)
                ForEach(items.prefix(6), id: \.self) { item in
                    HStack(alignment: .top, spacing: 8) {
                        Circle()
                            .fill(AppTheme.primary)
                            .frame(width: 6, height: 6)
                            .padding(.top, 6)
                        Text(item)
                            .font(.subheadline)
                            .foregroundStyle(AppTheme.textSecondary)
                    }
                }
            }
        }
    }
}
