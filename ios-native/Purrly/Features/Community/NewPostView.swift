import SwiftUI

struct NewPostView: View {
    @Environment(AppEnvironment.self) private var environment
    @Environment(\.dismiss) private var dismiss

    @State private var content: String = ""
    @FocusState private var contentFocused: Bool

    private var canPublish: Bool {
        !content.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty
    }

    var body: some View {
        NavigationStack {
            VStack(alignment: .leading, spacing: 20) {
                authorRow
                    .padding(.horizontal, 16)
                    .padding(.top, 16)

                TextEditor(text: $content)
                    .focused($contentFocused)
                    .frame(minHeight: 120, maxHeight: 260)
                    .padding(12)
                    .background(AppTheme.backgroundCard, in: RoundedRectangle(cornerRadius: 16))
                    .overlay(
                        RoundedRectangle(cornerRadius: 16)
                            .stroke(AppTheme.border, lineWidth: 1)
                    )
                    .foregroundStyle(AppTheme.ivory)
                    .tint(AppTheme.primary)
                    .scrollContentBackground(.hidden)
                    .padding(.horizontal, 16)
                    .overlay(alignment: .topLeading) {
                        if content.isEmpty {
                            Text("Quoi de neuf avec votre chat ?")
                                .foregroundStyle(AppTheme.textMuted)
                                .padding(.horizontal, 28)
                                .padding(.top, 20)
                                .allowsHitTesting(false)
                        }
                    }

                Spacer()

                Button("Publier") {
                    publishPost()
                }
                .buttonStyle(GlassPrimaryButtonStyle())
                .disabled(!canPublish)
                .padding(.horizontal, 16)
                .padding(.bottom, 24)
            }
            .purrlyScreenBackground()
            .navigationTitle(String(localized: "community.newpost.title"))
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button(String(localized: "action.cancel")) {
                        dismiss()
                    }
                    .foregroundStyle(AppTheme.textMuted)
                }
            }
            .onAppear { contentFocused = true }
        }
    }

    // MARK: - Sub-views

    private var authorRow: some View {
        HStack(spacing: 12) {
            let name = environment.auth.currentUser?.name ?? "Vous"
            ZStack {
                Circle()
                    .fill(AppTheme.primary.opacity(0.25))
                    .frame(width: 44, height: 44)
                Text(String(name.prefix(1)).uppercased())
                    .font(.title3.weight(.bold))
                    .foregroundStyle(AppTheme.primary)
            }
            Text(name)
                .font(.headline)
                .foregroundStyle(AppTheme.ivory)
            Spacer()
        }
    }

    // MARK: - Actions

    private func publishPost() {
        let trimmed = content.trimmingCharacters(in: .whitespacesAndNewlines)
        guard !trimmed.isEmpty else { return }
        let authorName = environment.auth.currentUser?.name ?? "Vous"
        environment.community.addPost(content: trimmed, authorName: authorName)
        dismiss()
    }
}
