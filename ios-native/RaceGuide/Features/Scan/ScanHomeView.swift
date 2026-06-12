import SwiftUI
import PhotosUI

struct ScanHomeView: View {
    @Environment(AppEnvironment.self) private var environment
    @State private var pickerItem: PhotosPickerItem?
    @State private var showCamera = false
    @State private var showBreeds = false

    private let heroURL = URL(string: "https://images.unsplash.com/photo-1495360010541-f48722b34f7d?auto=format&fit=crop&w=1200&q=80")!

    var body: some View {
        ScrollView {
            VStack(spacing: 0) {
                hero
                content
            }
        }
        .scrollIndicators(.hidden)
        .purrlyScreenBackground()
        .navigationTitle(String(localized: "tab.home"))
        .navigationBarTitleDisplayMode(.inline)
        .navigationDestination(isPresented: $showBreeds) {
            BreedListView()
        }
        .navigationDestination(isPresented: $showCamera) {
            ScanCameraPlaceholderView()
        }
        .onChange(of: pickerItem) { _, item in
            guard let item else { return }
            Task { await handlePhoto(item) }
        }
    }

    private var hero: some View {
        ZStack(alignment: .bottomLeading) {
            AsyncImage(url: heroURL) { phase in
                switch phase {
                case .success(let image):
                    image.resizable().scaledToFill()
                default:
                    AppTheme.backgroundSecondary
                }
            }
            .frame(height: 320)
            .clipped()
            .accessibilityLabel(String(localized: "scan.hero.a11y"))

            AppTheme.heroGradient

            VStack(alignment: .leading, spacing: 8) {
                Text("ÉDITION LUXE")
                    .font(.caption.weight(.heavy))
                    .kerning(2)
                    .foregroundStyle(AppTheme.primary)
                Text(String(localized: "scan.hero.title"))
                    .font(.title.weight(.black))
                    .foregroundStyle(AppTheme.ivory)
                Text(String(localized: "scan.hero.subtitle"))
                    .font(.subheadline)
                    .foregroundStyle(AppTheme.textSecondary)
            }
            .padding(24)
        }
    }

    private var content: some View {
        VStack(alignment: .leading, spacing: 16) {
            HStack(spacing: 12) {
                PhotosPicker(selection: $pickerItem, matching: .images) {
                    Label(String(localized: "scan.gallery"), systemImage: "photo.on.rectangle")
                        .frame(maxWidth: .infinity, minHeight: AppTheme.minTouch)
                }
                .buttonStyle(GlassPrimaryButtonStyle())

                Button {
                    showCamera = true
                } label: {
                    Label(String(localized: "scan.camera"), systemImage: "camera.fill")
                        .frame(maxWidth: .infinity, minHeight: AppTheme.minTouch)
                }
                .buttonStyle(GlassSecondaryButtonStyle())
            }

            Button {
                showBreeds = true
            } label: {
                Label(String(localized: "scan.browseBreeds"), systemImage: "book.closed.fill")
                    .frame(maxWidth: .infinity, minHeight: AppTheme.minTouch)
            }
            .buttonStyle(GlassSecondaryButtonStyle())

            GlassChrome.card {
                VStack(alignment: .leading, spacing: 8) {
                    Label(String(localized: "scan.recognition.title"), systemImage: "sparkles")
                        .font(.headline)
                        .foregroundStyle(AppTheme.ivory)
                    Text(String(localized: "scan.recognition.body"))
                        .font(.subheadline)
                        .foregroundStyle(AppTheme.textSecondary)
                    Text(String(localized: "scan.tip"))
                        .font(.caption)
                        .foregroundStyle(AppTheme.textMuted)
                }
            }
        }
        .padding(20)
    }

    private func handlePhoto(_ item: PhotosPickerItem) async {
        guard let data = try? await item.loadTransferable(type: Data.self) else { return }
        // Analyse IA : à brancher sur tRPC `ai.identify` — navigation résultat à venir
        _ = data
    }
}

struct ScanCameraPlaceholderView: View {
    var body: some View {
        VStack(spacing: 16) {
            Image(systemName: "camera.viewfinder")
                .font(.system(size: 64))
                .foregroundStyle(AppTheme.primary)
            Text(String(localized: "scan.camera.placeholder"))
                .multilineTextAlignment(.center)
                .foregroundStyle(AppTheme.textSecondary)
                .padding(.horizontal, 32)
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity)
        .purrlyScreenBackground()
        .navigationTitle(String(localized: "scan.camera"))
    }
}
