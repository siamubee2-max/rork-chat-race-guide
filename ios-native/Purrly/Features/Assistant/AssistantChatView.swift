import SwiftUI

struct AssistantChatView: View {
    @Environment(AppEnvironment.self) private var environment
    @State private var input = ""
    @State private var messages: [ChatMessage] = AssistantChatView.loadHistory()
    @State private var isLoading = false
    @State private var errorText: String?
    @FocusState private var focused: Bool

    private let quickPrompts = [
        "Pourquoi mon chat ronronne ?",
        "Quels signes indiquent qu'il est malade ?",
        "Combien de nourriture par jour ?",
        "Mon chat ne mange plus, que faire ?",
    ]

    var body: some View {
        VStack(spacing: 0) {
            if messages.isEmpty {
                welcome
            } else {
                transcript
            }
            VetDisclaimerBanner()
            composer
        }
        .purrlyScreenBackground()
        .navigationTitle(String(localized: "tab.assistant"))
        .navigationBarTitleDisplayMode(.inline)
    }

    private var welcome: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 16) {
                GlassChrome.card(tint: AppTheme.primary.opacity(0.25)) {
                    VStack(alignment: .leading, spacing: 8) {
                        Label("Purrly IA", systemImage: "sparkles")
                            .font(.headline)
                            .foregroundStyle(AppTheme.ivory)
                        Text(String(localized: "assistant.welcome"))
                            .foregroundStyle(AppTheme.textSecondary)
                    }
                }
                Text(String(localized: "assistant.quick"))
                    .font(.subheadline.weight(.semibold))
                    .foregroundStyle(AppTheme.textMuted)
                FlowLayout(spacing: 8) {
                    ForEach(quickPrompts, id: \.self) { prompt in
                        Button(prompt) { send(prompt) }
                            .font(.caption.weight(.semibold))
                            .foregroundStyle(AppTheme.ivory)
                            .padding(.horizontal, 12)
                            .padding(.vertical, 10)
                            .background(AppTheme.backgroundCard, in: Capsule())
                            .overlay(Capsule().stroke(AppTheme.border))
                            .frame(minHeight: AppTheme.minTouch)
                    }
                }
            }
            .padding(16)
        }
    }

    private var transcript: some View {
        ScrollViewReader { proxy in
            ScrollView {
                LazyVStack(spacing: 12) {
                    ForEach(messages) { message in
                        bubble(message)
                            .id(message.id)
                    }
                    if isLoading {
                        ProgressView()
                            .tint(AppTheme.primary)
                            .padding()
                    }
                }
                .padding(16)
            }
            .onChange(of: messages.count) { _, _ in
                if let last = messages.last {
                    withAnimation { proxy.scrollTo(last.id, anchor: .bottom) }
                }
            }
        }
    }

    private func bubble(_ message: ChatMessage) -> some View {
        HStack {
            if message.role == .user { Spacer(minLength: 40) }
            Text(message.content)
                .font(.body)
                .foregroundStyle(message.role == .user ? AppTheme.background : AppTheme.ivory)
                .padding(12)
                .background(
                    message.role == .user ? AppTheme.primary : AppTheme.backgroundCard,
                    in: RoundedRectangle(cornerRadius: 16)
                )
            if message.role == .assistant { Spacer(minLength: 40) }
        }
        // Expose le rôle ET le contenu (sinon VoiceOver ne lit pas le message).
        .accessibilityElement(children: .ignore)
        .accessibilityLabel("\(message.role == .user ? "Vous" : "Assistant") : \(message.content)")
    }

    private var composer: some View {
        VStack(spacing: 8) {
            if let errorText {
                Text(errorText)
                    .font(.caption)
                    .foregroundStyle(AppTheme.error)
                    .padding(.horizontal)
            }
            HStack(spacing: 8) {
                TextField(String(localized: "assistant.placeholder"), text: $input, axis: .vertical)
                    .lineLimit(1 ... 4)
                    .focused($focused)
                    .accessibilityIdentifier("assistantComposer")
                    .foregroundStyle(AppTheme.ivory)
                    .padding(12)
                    .background(AppTheme.backgroundCard, in: RoundedRectangle(cornerRadius: 14))
                Button {
                    send(input)
                } label: {
                    Image(systemName: "paperplane.fill")
                        .frame(width: AppTheme.minTouch, height: AppTheme.minTouch)
                }
                .buttonStyle(GlassPrimaryButtonStyle())
                .disabled(input.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty || isLoading)
                .accessibilityLabel(String(localized: "assistant.send"))
                .accessibilityIdentifier("assistantSendButton")
            }
            .padding(.horizontal, 12)
            .padding(.bottom, 8)
        }
        .background(.ultraThinMaterial)
    }

    // MARK: – Persistence

    private static let historyKey = "assistant_chat_history"

    private static func loadHistory() -> [ChatMessage] {
        guard let data = UserDefaults.standard.data(forKey: historyKey),
              let messages = try? JSONDecoder().decode([ChatMessage].self, from: data)
        else { return [] }
        return messages
    }

    private static func saveHistory(_ messages: [ChatMessage]) {
        let trimmed = Array(messages.suffix(50))
        if let data = try? JSONEncoder().encode(trimmed) {
            UserDefaults.standard.set(data, forKey: historyKey)
        }
    }

    private func send(_ text: String) {
        let trimmed = text.trimmingCharacters(in: .whitespacesAndNewlines)
        guard !trimmed.isEmpty else { return }

        // Garde UX (le vrai gate est serveur) : limite quotidienne gratuite.
        guard environment.limits.canSendAIMessage else {
            errorText = "Limite gratuite atteinte (\(UsageLimits.freeAILimit) messages/jour). Passe Pro pour continuer."
            return
        }

        input = ""
        errorText = nil

        let userMessage = ChatMessage(
            id: UUID().uuidString,
            role: .user,
            content: trimmed,
            createdAt: Date()
        )
        messages.append(userMessage)
        AssistantChatView.saveHistory(messages)
        isLoading = true

        Task {
            do {
                let token = KeychainStore.read(.accessToken)
                let system = buildSystemPrompt()
                let reply = try await environment.aiChat.send(
                    messages: messages,
                    systemPrompt: system,
                    accessToken: token
                )
                messages.append(
                    ChatMessage(
                        id: UUID().uuidString,
                        role: .assistant,
                        content: reply,
                        createdAt: Date()
                    )
                )
                AssistantChatView.saveHistory(messages)
                environment.limits.recordAIMessage()  // met à jour le compteur "messages restants"
            } catch {
                errorText = error.localizedDescription
                messages.append(
                    ChatMessage(
                        id: UUID().uuidString,
                        role: .assistant,
                        content: String(localized: "assistant.offline"),
                        createdAt: Date()
                    )
                )
                AssistantChatView.saveHistory(messages)
            }
            isLoading = false
        }
    }

    private func buildSystemPrompt() -> String {
        let cats = environment.cats.cats
        if cats.isEmpty {
            return "Tu es Purrly, assistant expert en chats. Réponds en français, de façon concise."
        }
        let names = cats.map(\.name).joined(separator: ", ")
        return "Tu es Purrly, assistant expert en chats. L'utilisateur a : \(names). Réponds en français."
    }
}

/// Disposition simple de puces (prompts rapides).
struct FlowLayout: Layout {
    var spacing: CGFloat = 8

    func sizeThatFits(proposal: ProposedViewSize, subviews: Subviews, cache: inout ()) -> CGSize {
        let result = arrange(proposal: proposal, subviews: subviews)
        return result.size
    }

    func placeSubviews(in bounds: CGRect, proposal: ProposedViewSize, subviews: Subviews, cache: inout ()) {
        let result = arrange(proposal: proposal, subviews: subviews)
        for (index, frame) in result.frames.enumerated() {
            subviews[index].place(
                at: CGPoint(x: bounds.minX + frame.minX, y: bounds.minY + frame.minY),
                proposal: ProposedViewSize(frame.size)
            )
        }
    }

    private func arrange(proposal: ProposedViewSize, subviews: Subviews) -> (size: CGSize, frames: [CGRect]) {
        let maxWidth = proposal.width ?? .infinity
        var x: CGFloat = 0
        var y: CGFloat = 0
        var rowHeight: CGFloat = 0
        var frames: [CGRect] = []

        for subview in subviews {
            let size = subview.sizeThatFits(.unspecified)
            if x + size.width > maxWidth, x > 0 {
                x = 0
                y += rowHeight + spacing
                rowHeight = 0
            }
            frames.append(CGRect(origin: CGPoint(x: x, y: y), size: size))
            rowHeight = max(rowHeight, size.height)
            x += size.width + spacing
        }

        return (CGSize(width: maxWidth, height: y + rowHeight), frames)
    }
}
