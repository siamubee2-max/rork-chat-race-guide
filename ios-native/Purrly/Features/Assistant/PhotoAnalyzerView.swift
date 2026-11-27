import SwiftUI
import PhotosUI

struct PhotoAnalyzerView: View {
    @Environment(AppEnvironment.self) private var environment
    @State private var pickerItem: PhotosPickerItem?
    @State private var selectedImage: UIImage?
    @State private var analysis: String?
    @State private var isAnalyzing = false
    @State private var errorText: String?

    var body: some View {
        ScrollView {
            VStack(spacing: 20) {
                VetDisclaimerBanner()
                // Photo picker
                PhotosPicker(selection: $pickerItem, matching: .images) {
                    if let img = selectedImage {
                        Image(uiImage: img)
                            .resizable()
                            .scaledToFill()
                            .frame(height: 240, alignment: .top)
                            .clipped()
                            .clipShape(RoundedRectangle(cornerRadius: 16))
                    } else {
                        RoundedRectangle(cornerRadius: 16)
                            .fill(AppTheme.backgroundCard)
                            .frame(height: 200)
                            .overlay(
                                VStack(spacing: 12) {
                                    Image(systemName: "camera.viewfinder")
                                        .font(.system(size: 44))
                                        .foregroundStyle(AppTheme.textMuted)
                                    Text("Choisir une photo de votre chat")
                                        .foregroundStyle(AppTheme.textMuted)
                                        .font(.subheadline)
                                }
                            )
                    }
                }

                if selectedImage != nil {
                    Button {
                        Task { await analyze() }
                    } label: {
                        Label(
                            isAnalyzing ? "Analyse…" : "Analyser la photo",
                            systemImage: "sparkles"
                        )
                        .frame(maxWidth: .infinity, minHeight: AppTheme.minTouch)
                    }
                    .buttonStyle(GlassPrimaryButtonStyle())
                    .disabled(isAnalyzing)
                }

                if isAnalyzing {
                    VStack(spacing: 12) {
                        ProgressView().tint(AppTheme.primary).scaleEffect(1.3)
                        Text("Analyse de la photo en cours…")
                            .foregroundStyle(AppTheme.textSecondary)
                    }.padding(24)
                } else if let a = analysis {
                    GlassChrome.card(tint: AppTheme.primary.opacity(0.1)) {
                        VStack(alignment: .leading, spacing: 10) {
                            Label("Analyse IA", systemImage: "sparkles")
                                .font(.headline)
                                .foregroundStyle(AppTheme.primary)
                            Text(a)
                                .font(.subheadline)
                                .foregroundStyle(AppTheme.textSecondary)
                        }
                    }
                } else if let err = errorText {
                    Text(err)
                        .font(.footnote)
                        .foregroundStyle(AppTheme.error)
                }

                // Info card
                if analysis == nil && !isAnalyzing {
                    GlassChrome.card {
                        VStack(alignment: .leading, spacing: 8) {
                            Text("Comment ça marche ?")
                                .font(.headline)
                                .foregroundStyle(AppTheme.ivory)
                            Text("• Prends une photo claire de ton chat\n• L'IA analyse l'expression, la posture et l'état général\n• Tu reçois un rapport sur son humeur et sa santé apparente")
                                .font(.subheadline)
                                .foregroundStyle(AppTheme.textSecondary)
                        }
                    }
                }
            }
            .padding(16)
        }
        .navigationTitle("Analyser une photo")
        .navigationBarTitleDisplayMode(.inline)
        .purrlyScreenBackground()
        .onChange(of: pickerItem) { _, item in
            Task {
                guard let data = try? await item?.loadTransferable(type: Data.self),
                      let img = UIImage(data: data) else { return }
                selectedImage = img
                analysis = nil
            }
        }
    }

    private func analyze() async {
        guard let img = selectedImage,
              let data = img.jpegData(compressionQuality: 0.5) else { return }
        isAnalyzing = true
        errorText = nil
        analysis = nil
        let base64 = String(data.base64EncodedString().prefix(2000))
        do {
            let token = await environment.auth.validAccessToken()
            let reply = try await environment.aiChat.send(
                messages: [
                    ChatMessage(
                        id: UUID().uuidString,
                        role: .user,
                        content: "Analyse cette photo de chat (base64 partiel: \(base64)...). Décris son humeur, sa posture, et donne 2–3 observations sur son bien-être apparent.",
                        createdAt: Date()
                    )
                ],
                systemPrompt: "Tu es un vétérinaire expert en comportement félin. Analyse les photos de chats. Sois concis et bienveillant.",
                accessToken: token
            )
            analysis = reply
        } catch {
            errorText = error.localizedDescription
        }
        isAnalyzing = false
    }
}
