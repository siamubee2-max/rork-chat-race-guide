import SwiftUI

struct ScanResultView: View {
    let imageData: Data
    @Environment(AppEnvironment.self) private var environment
    @Environment(\.dismiss) private var dismiss

    @State private var result: BreedScanService.ScanResult?
    @State private var isLoading = true
    @State private var errorText: String?
    @State private var navigateToBreed: BreedProfile?

    private let service = BreedScanService()

    var body: some View {
        ScrollView {
            VStack(spacing: 24) {

                // Cat photo
                if let uiImage = UIImage(data: imageData) {
                    Image(uiImage: uiImage)
                        .resizable()
                        .scaledToFill()
                        .frame(maxWidth: .infinity)
                        .frame(height: 280, alignment: .top)
                        .clipped()
                        .clipShape(RoundedRectangle(cornerRadius: 20))
                        .overlay(
                            RoundedRectangle(cornerRadius: 20)
                                .stroke(AppTheme.border, lineWidth: 1)
                        )
                }

                if isLoading {
                    loadingView
                } else if let error = errorText {
                    errorView(message: error)
                } else if let r = result {
                    resultContent(r)
                }
            }
            .padding(20)
        }
        .scrollIndicators(.hidden)
        .navigationTitle("Résultat du scan")
        .navigationBarTitleDisplayMode(.inline)
        .purrlyScreenBackground()
        .navigationDestination(item: $navigateToBreed) { breed in
            BreedDetailView(breed: breed)
        }
        .task { await identify() }
    }

    // MARK: - Sub-views

    private var loadingView: some View {
        VStack(spacing: 20) {
            ZStack {
                Circle()
                    .stroke(AppTheme.primary.opacity(0.15), lineWidth: 3)
                    .frame(width: 72, height: 72)
                ProgressView()
                    .tint(AppTheme.primary)
                    .scaleEffect(1.4)
            }
            Text("Identification en cours…")
                .font(.subheadline.weight(.medium))
                .foregroundStyle(AppTheme.textSecondary)
            Text("Notre IA analyse les caractéristiques de votre chat")
                .font(.caption)
                .foregroundStyle(AppTheme.textMuted)
                .multilineTextAlignment(.center)
        }
        .frame(maxWidth: .infinity)
        .padding(40)
    }

    private func errorView(message: String) -> some View {
        VStack(spacing: 16) {
            Image(systemName: "exclamationmark.triangle.fill")
                .font(.system(size: 44))
                .foregroundStyle(AppTheme.error)

            Text("Analyse impossible")
                .font(.headline)
                .foregroundStyle(AppTheme.ivory)

            Text(message)
                .font(.subheadline)
                .foregroundStyle(AppTheme.textSecondary)
                .multilineTextAlignment(.center)

            Button("Réessayer") {
                Task { await identify() }
            }
            .buttonStyle(GlassPrimaryButtonStyle())
            .frame(maxWidth: 200)
        }
        .frame(maxWidth: .infinity)
        .padding(24)
    }

    @ViewBuilder
    private func resultContent(_ r: BreedScanService.ScanResult) -> some View {
        // Top breed card
        GlassChrome.card(tint: AppTheme.primary.opacity(0.15)) {
            VStack(alignment: .leading, spacing: 14) {
                HStack(alignment: .top) {
                    VStack(alignment: .leading, spacing: 6) {
                        Text(r.topBreed)
                            .font(.title2.weight(.black))
                            .foregroundStyle(AppTheme.ivory)

                        Text(r.confidence)
                            .font(.caption.weight(.bold))
                            .foregroundStyle(AppTheme.primary)
                            .padding(.horizontal, 10)
                            .padding(.vertical, 4)
                            .background(AppTheme.primary.opacity(0.15), in: Capsule())
                    }
                    Spacer()
                    Image(systemName: "sparkles")
                        .font(.title)
                        .foregroundStyle(AppTheme.primary)
                }

                Divider().overlay(AppTheme.border)

                Text(r.why)
                    .font(.subheadline)
                    .foregroundStyle(AppTheme.textSecondary)
                    .lineLimit(nil)
            }
        }

        // Alternatives
        if !r.alternatives.isEmpty {
            VStack(alignment: .leading, spacing: 10) {
                Text("Autres possibilités")
                    .font(.headline.weight(.bold))
                    .foregroundStyle(AppTheme.ivory)

                ForEach(r.alternatives, id: \.self) { alt in
                    HStack(spacing: 10) {
                        Image(systemName: "pawprint.fill")
                            .font(.caption)
                            .foregroundStyle(AppTheme.primary.opacity(0.7))
                        Text(alt)
                            .font(.subheadline)
                            .foregroundStyle(AppTheme.textSecondary)
                        Spacer()
                    }
                    .padding(.vertical, 4)
                }
            }
            .frame(maxWidth: .infinity, alignment: .leading)
            .padding(16)
            .background(AppTheme.backgroundCard, in: RoundedRectangle(cornerRadius: 14))
            .overlay(RoundedRectangle(cornerRadius: 14).stroke(AppTheme.border))
        }

        // CTA: see breed detail if we find a match in the catalog
        breedCTAButton(topBreedName: r.topBreed)

        // Browse all breeds
        Button {
            // Pop back and let user navigate breeds themselves
            dismiss()
        } label: {
            Label("Nouvelle analyse", systemImage: "arrow.counterclockwise")
                .frame(maxWidth: .infinity, minHeight: AppTheme.minTouch)
        }
        .buttonStyle(GlassSecondaryButtonStyle())
    }

    @ViewBuilder
    private func breedCTAButton(topBreedName: String) -> some View {
        let matched = findBreed(name: topBreedName)
        if let breed = matched {
            Button {
                navigateToBreed = breed
            } label: {
                Label("Voir la fiche : \(breed.name)", systemImage: "book.closed.fill")
                    .frame(maxWidth: .infinity, minHeight: AppTheme.minTouch)
            }
            .buttonStyle(GlassPrimaryButtonStyle())
        } else {
            NavigationLink(destination: BreedListView()) {
                Label("Explorer toutes les races", systemImage: "books.vertical")
                    .frame(maxWidth: .infinity, minHeight: AppTheme.minTouch)
            }
            .buttonStyle(GlassPrimaryButtonStyle())
        }
    }

    // MARK: - Actions

    private func identify() async {
        isLoading = true
        errorText = nil
        do {
            result = try await service.identify(
                imageData: imageData,
                accessToken: KeychainStore.read(.accessToken)
            )
            environment.gamification.checkAndUnlockScan()
        } catch {
            // Fallback hors-ligne : classification on-device (réseau indisponible,
            // serveur en erreur, ou non connecté). No-op si aucun modèle embarqué.
            if let guesses = environment.breedClassifier.classify(imageData: imageData),
               let top = guesses.first {
                result = BreedScanService.ScanResult(
                    topBreed: top.label,
                    confidence: BreedClassifierService.confidenceLabel(top.confidence),
                    why: "Identifié hors-ligne sur votre appareil.",
                    alternatives: guesses.dropFirst().map(\.label)
                )
                environment.gamification.checkAndUnlockScan()
            } else {
                errorText = error.localizedDescription
            }
        }
        isLoading = false
    }

    // MARK: - Breed matching

    /// Fuzzy-matches an AI breed name to a catalog BreedProfile.
    private func findBreed(name: String) -> BreedProfile? {
        let catalog = environment.breeds.breeds
        guard !catalog.isEmpty else { return nil }

        let normalized = normalize(name)

        // 1. Exact match by ID
        if let m = catalog.first(where: { normalize($0.id.replacingOccurrences(of: "-", with: "")) == normalized }) {
            return m
        }
        // 2. Exact match by name
        if let m = catalog.first(where: { normalize($0.name) == normalized }) {
            return m
        }
        // 3. Contains (both directions)
        if let m = catalog.first(where: {
            normalize($0.name).contains(normalized) || normalized.contains(normalize($0.name))
        }) {
            return m
        }
        return nil
    }

    private func normalize(_ s: String) -> String {
        let stripped = s.lowercased().applyingTransform(.stripDiacritics, reverse: false) ?? s.lowercased()
        return stripped.replacingOccurrences(of: "[^a-z0-9]", with: "", options: .regularExpression)
    }
}
