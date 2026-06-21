import SwiftUI
import PhotosUI
import UIKit

struct ScanHomeView: View {
    @Environment(AppEnvironment.self) private var environment
    @Environment(\.horizontalSizeClass) private var horizontalSizeClass
    @State private var router = AppRouter.shared
    @State private var pickerItem: PhotosPickerItem?
    @State private var showCamera = false
    @State private var showBreeds = false
    @State private var scannedImageData: Data?

    private let heroURL = URL(string: "https://images.unsplash.com/photo-1495360010541-f48722b34f7d?auto=format&fit=crop&w=1200&q=80")!

    var body: some View {
        ScrollView {
            VStack(spacing: 0) {
                hero
                content
                    .purrlyReadableWidth()
            }
        }
        .scrollIndicators(.hidden)
        .purrlyScreenBackground()
        .navigationTitle(String(localized: "tab.home"))
        .navigationBarTitleDisplayMode(.inline)
        .navigationDestination(isPresented: $showBreeds) {
            BreedListView()
        }
        .navigationDestination(item: $scannedImageData) { data in
            ScanResultView(imageData: data)
        }
        .fullScreenCover(isPresented: $showCamera) {
            ScanCameraView { data in
                // Camera dismissed itself; now navigate to result
                scannedImageData = data
            }
        }
        .onChange(of: pickerItem) { _, item in
            guard let item else { return }
            Task { await handlePhoto(item) }
        }
        // Déclenchement externe (Siri/Spotlight « scanne mon chat », widget).
        .onChange(of: router.pendingScan) { _, pending in
            if pending {
                showCamera = true
                router.pendingScan = false
            }
        }
        .onAppear {
            if router.pendingScan {
                showCamera = true
                router.pendingScan = false
            }
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
            // Cadrage ancré en haut : la tête du chat (partie supérieure) reste
            // toujours visible, même sur les formats larges/courts (iPad).
            .frame(maxWidth: .infinity, height: horizontalSizeClass == .regular ? 460 : 320, alignment: .top)
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

            #if DEBUG
            // Hook tests UI : seed une image et déclenche le scan sans PhotosPicker.
            // Masqué en mode captures (`-screenshots`) pour des visuels App Store propres.
            if ProcessInfo.processInfo.arguments.contains("-uiTesting"),
               !ProcessInfo.processInfo.arguments.contains("-screenshots") {
                Button("UITest Scan") {
                    let renderer = UIGraphicsImageRenderer(size: CGSize(width: 64, height: 64))
                    let img = renderer.image { ctx in
                        UIColor.gray.setFill()
                        ctx.fill(CGRect(x: 0, y: 0, width: 64, height: 64))
                    }
                    scannedImageData = img.jpegData(compressionQuality: 0.8)
                }
                .accessibilityIdentifier("uiTestScanButton")
            }
            #endif

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
        scannedImageData = data
    }
}

