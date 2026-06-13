import SwiftUI
import Photos

struct CatAlbumView: View {
    @State private var photos: [IdentifiableImage] = []
    @State private var showBooth = false
    @State private var selectedPhoto: IdentifiableImage?

    let columns = [
        GridItem(.flexible(), spacing: 2),
        GridItem(.flexible(), spacing: 2),
        GridItem(.flexible(), spacing: 2),
    ]

    var body: some View {
        Group {
            if photos.isEmpty {
                VStack(spacing: 16) {
                    Image(systemName: "photo.on.rectangle.angled")
                        .font(.system(size: 56))
                        .foregroundStyle(AppTheme.textMuted)
                    Text("Album vide")
                        .font(.headline)
                        .foregroundStyle(AppTheme.ivory)
                    Text("Crée tes premières photos avec le Photo Booth !")
                        .foregroundStyle(AppTheme.textSecondary)
                        .multilineTextAlignment(.center)
                    Button { showBooth = true } label: {
                        Label("Ouvrir le Photo Booth", systemImage: "camera.filters")
                            .frame(minHeight: AppTheme.minTouch)
                    }
                    .buttonStyle(GlassPrimaryButtonStyle())
                }
                .padding(32)
                .frame(maxWidth: .infinity, maxHeight: .infinity)
            } else {
                ScrollView {
                    LazyVGrid(columns: columns, spacing: 2) {
                        ForEach(photos) { item in
                            Image(uiImage: item.image)
                                .resizable()
                                .scaledToFill()
                                .frame(
                                    width: UIScreen.main.bounds.width / 3 - 2,
                                    height: UIScreen.main.bounds.width / 3 - 2
                                )
                                .clipped()
                                .onTapGesture { selectedPhoto = item }
                        }
                    }
                }
            }
        }
        .navigationTitle("Mon album 🐱")
        .toolbar {
            ToolbarItem(placement: .primaryAction) {
                Button { showBooth = true } label: {
                    Image(systemName: "camera.filters").tint(AppTheme.primary)
                }
            }
        }
        .sheet(isPresented: $showBooth) { CatPhotoBoothView() }
        .fullScreenCover(item: $selectedPhoto) { item in
            PhotoFullscreenView(image: item.image)
        }
        .purrlyScreenBackground()
        .onAppear { loadRecentPhotos() }
    }

    private func loadRecentPhotos() {
        let options = PHFetchOptions()
        options.sortDescriptors = [NSSortDescriptor(key: "creationDate", ascending: false)]
        options.fetchLimit = 30
        let result = PHAsset.fetchAssets(with: .image, options: options)
        var loaded: [IdentifiableImage] = []
        let manager = PHImageManager.default()
        let imgOptions = PHImageRequestOptions()
        imgOptions.isSynchronous = true
        imgOptions.deliveryMode = .fastFormat
        result.enumerateObjects { asset, _, _ in
            manager.requestImage(
                for: asset,
                targetSize: CGSize(width: 300, height: 300),
                contentMode: .aspectFill,
                options: imgOptions
            ) { img, _ in
                if let img {
                    loaded.append(IdentifiableImage(image: img))
                }
            }
        }
        photos = loaded
    }
}

// MARK: - Wrapper to avoid retroactive Identifiable conformance on UIImage

struct IdentifiableImage: Identifiable {
    let id = UUID()
    let image: UIImage
}

// MARK: - Fullscreen photo viewer

struct PhotoFullscreenView: View {
    let image: UIImage
    @Environment(\.dismiss) private var dismiss

    var body: some View {
        ZStack {
            Color.black.ignoresSafeArea()
            Image(uiImage: image)
                .resizable()
                .scaledToFit()
        }
        .onTapGesture { dismiss() }
    }
}
