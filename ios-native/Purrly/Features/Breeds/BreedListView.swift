import SwiftUI

struct BreedListView: View {
    @Environment(AppEnvironment.self) private var environment
    @State private var query = ""

    private var results: [BreedProfile] {
        environment.breeds.search(query)
    }

    var body: some View {
        List {
            if let error = environment.breeds.loadError {
                Text(error).foregroundStyle(AppTheme.error)
            }
            ForEach(results) { breed in
                NavigationLink(value: breed) {
                    BreedRow(breed: breed)
                }
                .listRowBackground(AppTheme.backgroundCard)
            }
        }
        .listStyle(.plain)
        .scrollContentBackground(.hidden)
        .searchable(text: $query, prompt: String(localized: "breeds.search"))
        .navigationTitle(String(localized: "breeds.title"))
        .navigationDestination(for: BreedProfile.self) { breed in
            BreedDetailView(breed: breed)
        }
        .purrlyScreenBackground()
        .onAppear { environment.breeds.loadIfNeeded() }
    }
}

private struct BreedRow: View {
    let breed: BreedProfile

    var body: some View {
        HStack(spacing: 12) {
            AsyncImage(url: URL(string: breed.imageUri)) { phase in
                switch phase {
                case .success(let image):
                    image.resizable().scaledToFill()
                default:
                    AppTheme.backgroundSecondary
                }
            }
            .frame(width: 52, height: 52)
            .clipShape(RoundedRectangle(cornerRadius: 12))

            VStack(alignment: .leading, spacing: 4) {
                Text(breed.name)
                    .font(.headline)
                    .foregroundStyle(AppTheme.ivory)
                Text(breed.origin)
                    .font(.caption)
                    .foregroundStyle(AppTheme.textMuted)
            }
        }
        .padding(.vertical, 4)
        .accessibilityElement(children: .combine)
    }
}
