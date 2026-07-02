import SwiftUI

struct CommunityPostWithImageView: View {
    let image: UIImage
    @Environment(AppEnvironment.self) private var environment
    @Environment(\.dismiss) private var dismiss

    @State private var caption = ""
    @State private var isPosting = false

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(spacing: 20) {
                    // Image preview
                    Image(uiImage: image)
                        .resizable()
                        .scaledToFit()
                        .frame(maxHeight: 300)
                        .clipShape(RoundedRectangle(cornerRadius: 16))

                    // Caption
                    GlassChrome.card {
                        TextField("Ajouter une légende… 🐱", text: $caption, axis: .vertical)
                            .lineLimit(3...6)
                            .foregroundStyle(AppTheme.ivory)
                    }

                    // Post button
                    Button {
                        post()
                    } label: {
                        if isPosting {
                            ProgressView().tint(AppTheme.background)
                        } else {
                            Label("Publier dans la communauté", systemImage: "paperplane.fill")
                                .frame(maxWidth: .infinity, minHeight: AppTheme.minTouch)
                        }
                    }
                    .buttonStyle(GlassPrimaryButtonStyle())
                    .disabled(isPosting)
                }
                .padding(16)
            }
            .scrollContentBackground(.hidden)
            .background(AppTheme.background)
            .navigationTitle("Partager")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button("Annuler") { dismiss() }
                }
            }
        }
    }

    private func post() {
        isPosting = true
        let imageNote = "[📸 Photo Booth]"
        let content = [imageNote, caption].filter { !$0.isEmpty }.joined(separator: "\n")
        let authorName = environment.auth.currentUser?.name ?? "Anonyme"
        environment.community.addPost(content: content, authorName: authorName)

        DispatchQueue.main.asyncAfter(deadline: .now() + 0.5) {
            dismiss()
        }
    }
}
