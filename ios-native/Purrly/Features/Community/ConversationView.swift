import SwiftUI

struct ConversationView: View {
    let otherUserName: String
    let otherUserId: String

    @Environment(AppEnvironment.self) private var environment
    @State private var inputText = ""
    @FocusState private var inputFocused: Bool

    /// Messages lus depuis le store (livrés au serveur ; survit à la fermeture
    /// de la vue — red-team H3 : avant, ils vivaient dans @State et disparaissaient).
    private var localMessages: [DirectMessage] {
        environment.community.messages(with: otherUserId)
    }

    var body: some View {
        VStack(spacing: 0) {
            ScrollViewReader { proxy in
                ScrollView {
                    LazyVStack(spacing: 12) {
                        if localMessages.isEmpty {
                            Text("Commencez la conversation avec \(otherUserName)")
                                .foregroundStyle(AppTheme.textMuted)
                                .font(.subheadline)
                                .multilineTextAlignment(.center)
                                .padding(24)
                        }
                        ForEach(localMessages) { msg in
                            MessageBubble(
                                message: msg,
                                isMe: msg.authorId == (environment.auth.currentUser?.id ?? "me")
                            )
                            .id(msg.id)
                        }
                    }
                    .padding(16)
                }
                .onChange(of: localMessages.count) { _, _ in
                    if let last = localMessages.last {
                        withAnimation(.easeOut(duration: 0.2)) {
                            proxy.scrollTo(last.id, anchor: .bottom)
                        }
                    }
                }
            }

            if let error = environment.community.lastSyncError {
                // Honnêteté : l'échec d'envoi est affiché, pas prétendu réussi (H3).
                Text(error)
                    .font(.caption)
                    .foregroundStyle(AppTheme.heart)
                    .frame(maxWidth: .infinity, alignment: .leading)
                    .padding(.horizontal, 16)
                    .padding(.vertical, 6)
            }

            Divider()
                .background(AppTheme.border)

            HStack(spacing: 12) {
                TextField("Message…", text: $inputText, axis: .vertical)
                    .lineLimit(1...4)
                    .focused($inputFocused)
                    .padding(.horizontal, 14)
                    .padding(.vertical, 10)
                    .background(AppTheme.backgroundCard, in: RoundedRectangle(cornerRadius: 20))
                    .foregroundStyle(AppTheme.ivory)
                    .tint(AppTheme.primary)

                Button { send() } label: {
                    Image(systemName: "arrow.up.circle.fill")
                        .font(.system(size: 30))
                        .foregroundStyle(
                            inputText.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty
                                ? AppTheme.textMuted
                                : AppTheme.primary
                        )
                }
                .disabled(inputText.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty)
                .accessibilityLabel("Envoyer")
            }
            .padding(.horizontal, 16)
            .padding(.vertical, 12)
            .background(AppTheme.backgroundSecondary.ignoresSafeArea(edges: .bottom))
        }
        .navigationTitle(otherUserName)
        .navigationBarTitleDisplayMode(.inline)
        .purrlyScreenBackground()
    }

    // MARK: - Actions

    private func send() {
        let text = inputText.trimmingCharacters(in: .whitespacesAndNewlines)
        guard !text.isEmpty else { return }

        let currentId = environment.auth.currentUser?.id ?? "me"
        let currentName = environment.auth.currentUser?.name ?? "Moi"

        environment.community.sendMessage(
            to: otherUserId,
            participantName: otherUserName,
            text: text,
            fromId: currentId,
            fromName: currentName
        )
        inputText = ""
    }
}

// MARK: - MessageBubble

private struct MessageBubble: View {
    let message: DirectMessage
    let isMe: Bool

    var body: some View {
        HStack(alignment: .bottom, spacing: 8) {
            if isMe { Spacer() }

            VStack(alignment: isMe ? .trailing : .leading, spacing: 4) {
                if !isMe {
                    Text(message.authorName)
                        .font(.caption.weight(.bold))
                        .foregroundStyle(AppTheme.textMuted)
                }
                Text(message.content)
                    .font(.subheadline)
                    .foregroundStyle(AppTheme.ivory)
                    .padding(.horizontal, 12)
                    .padding(.vertical, 8)
                    .background(
                        isMe
                            ? AppTheme.primary.opacity(0.35)
                            : AppTheme.backgroundCard,
                        in: RoundedRectangle(cornerRadius: 16)
                    )
                Text(message.createdAt, style: .time)
                    .font(.caption2)
                    .foregroundStyle(AppTheme.textMuted)
            }

            if !isMe { Spacer() }
        }
    }
}
