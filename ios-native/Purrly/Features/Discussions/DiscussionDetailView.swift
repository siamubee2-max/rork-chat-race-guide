import SwiftUI

struct DiscussionDetailView: View {
    @Environment(AppEnvironment.self) private var environment
    let thread: DiscussionThread
    @State private var inputText = ""

    private var store: DiscussionsStore { environment.discussions }
    private var live: DiscussionThread? { store.threads.first { $0.id == thread.id } }

    /// Messages affichés : ni d'un auteur bloqué, ni signalés (un message signalé doit
    /// disparaître immédiatement — Guideline 1.2).
    private var visibleMessages: [DiscussionMessage] {
        (live?.messages ?? thread.messages).filter {
            !environment.moderation.isHidden(id: $0.id, author: $0.author)
        }
    }

    var body: some View {
        VStack(spacing: 0) {
            ScrollViewReader { proxy in
                ScrollView {
                    LazyVStack(spacing: 12) {
                        ForEach(visibleMessages) { msg in
                            MessageBubble(message: msg)
                                .id(msg.id)
                                .moderationContextMenu(author: msg.author, kind: .message, itemId: msg.id)
                        }
                    }
                    .padding(16)
                }
                .onChange(of: live?.messageCount) { _, _ in
                    if let last = live?.messages.last {
                        withAnimation { proxy.scrollTo(last.id, anchor: .bottom) }
                    }
                }
            }

            Divider().background(AppTheme.border)

            HStack(spacing: 12) {
                TextField("Répondre…", text: $inputText, axis: .vertical)
                    .lineLimit(1...4)
                    .padding(10)
                    .background(AppTheme.backgroundCard, in: RoundedRectangle(cornerRadius: 12))
                    .foregroundStyle(AppTheme.ivory)

                Button { send() } label: {
                    Image(systemName: "arrow.up.circle.fill")
                        .font(.system(size: 30))
                        .foregroundStyle(inputText.trimmingCharacters(in: .whitespaces).isEmpty
                                         ? AppTheme.textMuted : AppTheme.primary)
                }
                .disabled(inputText.trimmingCharacters(in: .whitespaces).isEmpty)
            }
            .padding(12)
            .background(AppTheme.backgroundSecondary)
        }
        .navigationTitle(thread.title)
        .navigationBarTitleDisplayMode(.inline)
        .purrlyScreenBackground()
        .toolbar {
            ToolbarItem(placement: .primaryAction) {
                ModerationToolbarMenu(author: thread.author, kind: .thread, itemId: thread.id)
            }
        }
    }

    private func send() {
        let text = inputText.trimmingCharacters(in: .whitespacesAndNewlines)
        guard !text.isEmpty else { return }
        store.addMessage(text,
                         author: environment.auth.currentUser?.name ?? "Moi",
                         authorId: environment.auth.currentUser?.id,
                         toThread: thread.id)
        inputText = ""
    }
}

private struct MessageBubble: View {
    let message: DiscussionMessage

    var body: some View {
        HStack(alignment: .top, spacing: 10) {
            Circle()
                .fill(AppTheme.primary.opacity(0.2))
                .frame(width: 32, height: 32)
                .overlay(
                    Text(String(message.authorName.prefix(1)))
                        .font(.caption.weight(.bold))
                        .foregroundStyle(AppTheme.primary)
                )
            VStack(alignment: .leading, spacing: 4) {
                HStack(spacing: 6) {
                    Text(message.authorName)
                        .font(.caption.weight(.bold))
                        .foregroundStyle(AppTheme.ivory)
                    Text(message.createdAt, style: .relative)
                        .font(.caption2).foregroundStyle(AppTheme.textMuted)
                }
                Text(message.content)
                    .font(.subheadline)
                    .foregroundStyle(AppTheme.textSecondary)
                    .fixedSize(horizontal: false, vertical: true)
            }
            Spacer()
        }
    }
}
