import SwiftUI

struct NewDiscussionView: View {
    @Environment(AppEnvironment.self) private var environment
    @Environment(\.dismiss) private var dismiss
    @State private var title = ""
    @State private var firstMessage = ""

    var body: some View {
        NavigationStack {
            Form {
                Section("Titre") {
                    TextField("Ex: Mon chat ne mange plus…", text: $title)
                }
                .listRowBackground(AppTheme.backgroundCard)

                Section("Premier message") {
                    TextField("Décris ta situation…", text: $firstMessage, axis: .vertical)
                        .lineLimit(4...8)
                }
                .listRowBackground(AppTheme.backgroundCard)
            }
            .scrollContentBackground(.hidden)
            .background(AppTheme.background)
            .navigationTitle("Nouveau sujet")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button("Annuler") { dismiss() }
                }
                ToolbarItem(placement: .confirmationAction) {
                    Button("Publier") {
                        let trimmedTitle = title.trimmingCharacters(in: .whitespaces)
                        let trimmedMessage = firstMessage.trimmingCharacters(in: .whitespaces)
                        guard !trimmedTitle.isEmpty, !trimmedMessage.isEmpty else { return }
                        environment.discussions.addThread(
                            title: trimmedTitle,
                            firstMessage: trimmedMessage,
                            authorName: environment.auth.currentUser?.name ?? "Anonyme")
                        dismiss()
                    }
                    .tint(AppTheme.primary)
                    .disabled(title.trimmingCharacters(in: .whitespaces).isEmpty ||
                              firstMessage.trimmingCharacters(in: .whitespaces).isEmpty)
                }
            }
        }
    }
}
