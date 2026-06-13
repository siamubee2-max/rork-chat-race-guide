import SwiftUI
import PhotosUI

// MARK: - Sticker model

struct StickerItem: Identifiable {
    let id = UUID()
    var emoji: String
    var position: CGPoint
    var scale: CGFloat = 1.0
    var rotation: Angle = .zero
    var size: CGFloat = 60
}

// MARK: - Sticker categories

struct StickerCategory: Identifiable {
    let id: String
    let name: String
    let icon: String
    let stickers: [String]
}

let stickerCategories: [StickerCategory] = [
    StickerCategory(id: "hats", name: "Chapeaux", icon: "🎩", stickers: [
        "🎩", "👒", "🪖", "👑", "🎓", "⛑️", "🎪", "🪅",
    ]),
    StickerCategory(id: "glasses", name: "Lunettes", icon: "🕶️", stickers: [
        "🕶️", "👓", "🥽", "🔭", "🪄", "✨", "💫", "⭐",
    ]),
    StickerCategory(id: "cute", name: "Mignon", icon: "🎀", stickers: [
        "🎀", "🌈", "💖", "🌸", "🌺", "🍀", "🦋", "🌟",
    ]),
    StickerCategory(id: "paws", name: "Pattes", icon: "🐾", stickers: [
        "🐾", "🐱", "🐟", "🐭", "🎮", "🏆", "💎", "🎵",
    ]),
    StickerCategory(id: "party", name: "Fête", icon: "🎉", stickers: [
        "🎉", "🎊", "🎈", "🥳", "🍰", "🎂", "🪄", "🎆",
    ]),
    StickerCategory(id: "frames", name: "Cadres", icon: "🖼️", stickers: [
        "💛", "❤️", "💜", "💙", "🩵", "🩶", "🤍", "🖤",
    ]),
]

// MARK: - Main view

struct CatPhotoBoothView: View {
    @Environment(AppEnvironment.self) private var environment
    @Environment(\.dismiss) private var dismiss

    @State private var selectedPhoto: UIImage?
    @State private var pickerItem: PhotosPickerItem?
    @State private var stickers: [StickerItem] = []
    @State private var selectedCategory = "hats"
    @State private var selectedStickerId: UUID?
    @State private var exportedImage: UIImage?
    @State private var showSaved = false
    @State private var canvasSize: CGSize = .zero
    @State private var showCommunityPost = false

    var body: some View {
        NavigationStack {
            VStack(spacing: 0) {
                // Canvas
                canvas

                // Bottom panel
                VStack(spacing: 0) {
                    // Category tabs
                    categoryTabs
                    // Sticker grid
                    stickerGrid
                }
                .background(AppTheme.backgroundSecondary)
            }
            .navigationTitle("Photo Booth 🐱")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button("Fermer") { dismiss() }
                }
                ToolbarItem(placement: .primaryAction) {
                    if selectedPhoto != nil {
                        Menu {
                            Button {
                                exportAndSave()
                            } label: {
                                Label("Enregistrer dans Photos", systemImage: "square.and.arrow.down")
                            }
                            Button {
                                exportForCommunity()
                            } label: {
                                Label("Partager dans la communauté", systemImage: "person.3.fill")
                            }
                            Button(role: .destructive) {
                                stickers = []
                            } label: {
                                Label("Effacer les stickers", systemImage: "trash")
                            }
                        } label: {
                            Image(systemName: "square.and.arrow.up")
                                .tint(AppTheme.primary)
                        }
                    }
                }
            }
            .sheet(isPresented: $showCommunityPost) {
                if let img = exportedImage {
                    CommunityPostWithImageView(image: img)
                }
            }
            .overlay {
                if showSaved {
                    VStack(spacing: 8) {
                        Image(systemName: "checkmark.circle.fill")
                            .font(.system(size: 44))
                            .foregroundStyle(.green)
                        Text("Photo sauvegardée !")
                            .font(.headline)
                            .foregroundStyle(AppTheme.ivory)
                    }
                    .padding(24)
                    .background(.ultraThinMaterial, in: RoundedRectangle(cornerRadius: 20))
                }
            }
        }
    }

    // MARK: - Canvas

    private var canvas: some View {
        GeometryReader { geo in
            ZStack {
                // Background
                if let photo = selectedPhoto {
                    Image(uiImage: photo)
                        .resizable()
                        .scaledToFit()
                        .frame(width: geo.size.width, height: geo.size.width)
                        .clipped()
                } else {
                    // Empty state — prompt to pick photo
                    PhotosPicker(selection: $pickerItem, matching: .images) {
                        VStack(spacing: 16) {
                            Image(systemName: "camera.viewfinder")
                                .font(.system(size: 64))
                                .foregroundStyle(AppTheme.primary)
                            Text("Choisir une photo de ton chat")
                                .font(.headline)
                                .foregroundStyle(AppTheme.ivory)
                            Text("Galerie ou caméra")
                                .font(.subheadline)
                                .foregroundStyle(AppTheme.textMuted)
                        }
                        .frame(width: geo.size.width, height: geo.size.width)
                        .background(AppTheme.backgroundCard)
                    }
                }

                // Stickers
                ForEach($stickers) { $sticker in
                    StickerView(
                        sticker: $sticker,
                        isSelected: sticker.id == selectedStickerId,
                        onSelect: { selectedStickerId = sticker.id },
                        onDelete: { stickers.removeAll { $0.id == sticker.id } }
                    )
                }

                // Tap canvas to deselect
                if selectedPhoto != nil {
                    Color.clear
                        .contentShape(Rectangle())
                        .onTapGesture { selectedStickerId = nil }
                        .allowsHitTesting(selectedStickerId == nil)
                }
            }
            .frame(width: geo.size.width, height: geo.size.width)
            .onAppear { canvasSize = CGSize(width: geo.size.width, height: geo.size.width) }
        }
        .frame(height: UIScreen.main.bounds.width)
        .onChange(of: pickerItem) { _, item in
            Task {
                guard let data = try? await item?.loadTransferable(type: Data.self),
                      let img = UIImage(data: data) else { return }
                selectedPhoto = img
            }
        }
    }

    // MARK: - Category tabs

    private var categoryTabs: some View {
        ScrollView(.horizontal, showsIndicators: false) {
            HStack(spacing: 8) {
                ForEach(stickerCategories) { cat in
                    Button {
                        withAnimation(.spring(response: 0.3)) { selectedCategory = cat.id }
                    } label: {
                        VStack(spacing: 4) {
                            Text(cat.icon).font(.title2)
                            Text(cat.name).font(.caption2.weight(.semibold))
                                .foregroundStyle(selectedCategory == cat.id ? AppTheme.primary : AppTheme.textMuted)
                        }
                        .padding(.horizontal, 12).padding(.vertical, 8)
                        .background(
                            selectedCategory == cat.id
                                ? AppTheme.primary.opacity(0.15)
                                : Color.clear,
                            in: RoundedRectangle(cornerRadius: 10)
                        )
                    }
                }
            }
            .padding(.horizontal, 12).padding(.vertical, 8)
        }
    }

    // MARK: - Sticker grid

    private var stickerGrid: some View {
        let category = stickerCategories.first { $0.id == selectedCategory }
        return ScrollView(.horizontal, showsIndicators: false) {
            HStack(spacing: 12) {
                ForEach(category?.stickers ?? [], id: \.self) { emoji in
                    Button {
                        addSticker(emoji)
                    } label: {
                        Text(emoji)
                            .font(.system(size: 36))
                            .frame(width: 56, height: 56)
                            .background(AppTheme.backgroundCard, in: RoundedRectangle(cornerRadius: 12))
                    }
                }
            }
            .padding(.horizontal, 16).padding(.vertical, 12)
        }
    }

    // MARK: - Logic

    private func addSticker(_ emoji: String) {
        guard selectedPhoto != nil else { return }
        let center = CGPoint(x: canvasSize.width / 2, y: canvasSize.height / 2)
        let jitter = CGPoint(
            x: CGFloat.random(in: -40...40),
            y: CGFloat.random(in: -40...40)
        )
        let sticker = StickerItem(
            emoji: emoji,
            position: CGPoint(x: center.x + jitter.x, y: center.y + jitter.y)
        )
        stickers.append(sticker)
        selectedStickerId = sticker.id

        UIImpactFeedbackGenerator(style: .medium).impactOccurred()
    }

    private func renderCanvas() -> UIImage? {
        guard let photo = selectedPhoto else { return nil }
        let size = canvasSize
        let renderer = UIGraphicsImageRenderer(size: size)
        return renderer.image { ctx in
            // Draw photo
            photo.draw(in: CGRect(origin: .zero, size: size))
            // Draw stickers
            for sticker in stickers {
                let fontSize = sticker.size * sticker.scale
                let attrs: [NSAttributedString.Key: Any] = [
                    .font: UIFont.systemFont(ofSize: fontSize),
                ]
                let str = NSAttributedString(string: sticker.emoji, attributes: attrs)
                let strSize = str.size()
                ctx.cgContext.saveGState()
                ctx.cgContext.translateBy(x: sticker.position.x, y: sticker.position.y)
                ctx.cgContext.rotate(by: sticker.rotation.radians)
                str.draw(at: CGPoint(x: -strSize.width / 2, y: -strSize.height / 2))
                ctx.cgContext.restoreGState()
            }
        }
    }

    private func exportAndSave() {
        guard let img = renderCanvas() else { return }
        UIImageWriteToSavedPhotosAlbum(img, nil, nil, nil)
        withAnimation { showSaved = true }
        DispatchQueue.main.asyncAfter(deadline: .now() + 2) {
            withAnimation { showSaved = false }
        }
    }

    private func exportForCommunity() {
        guard let img = renderCanvas() else { return }
        exportedImage = img
        showCommunityPost = true
    }
}

// MARK: - Sticker view (draggable + pinch + rotate)

struct StickerView: View {
    @Binding var sticker: StickerItem
    let isSelected: Bool
    let onSelect: () -> Void
    let onDelete: () -> Void

    @GestureState private var dragOffset: CGSize = .zero
    @GestureState private var magnifyDelta: CGFloat = 1.0
    @GestureState private var rotateDelta: Angle = .zero

    var body: some View {
        ZStack {
            Text(sticker.emoji)
                .font(.system(size: sticker.size))
                .scaleEffect(sticker.scale * magnifyDelta)
                .rotationEffect(sticker.rotation + rotateDelta)

            if isSelected {
                Button { onDelete() } label: {
                    Image(systemName: "xmark.circle.fill")
                        .font(.system(size: 22))
                        .foregroundStyle(.red)
                        .background(Circle().fill(.white))
                }
                .offset(
                    x: sticker.size * sticker.scale * 0.6,
                    y: -sticker.size * sticker.scale * 0.6
                )
            }
        }
        .position(
            x: sticker.position.x + dragOffset.width,
            y: sticker.position.y + dragOffset.height
        )
        .gesture(
            TapGesture().onEnded { onSelect() }
        )
        .gesture(
            DragGesture()
                .updating($dragOffset) { value, state, _ in state = value.translation }
                .onEnded { value in
                    sticker.position.x += value.translation.width
                    sticker.position.y += value.translation.height
                    onSelect()
                }
        )
        .gesture(
            MagnifyGesture()
                .updating($magnifyDelta) { value, state, _ in state = value.magnification }
                .onEnded { value in sticker.scale *= value.magnification }
        )
        .gesture(
            RotateGesture()
                .updating($rotateDelta) { value, state, _ in state = value.rotation }
                .onEnded { value in sticker.rotation += value.rotation }
        )
    }
}
