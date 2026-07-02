# Community Detail Views Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add EventDetailView, NewEventView, ConversationView, and UserProfileView to Purrly's iOS community feature, wiring them into CommunityHubView with navigation.

**Architecture:** Expand `CommunityEvent` in `UserProfile.swift` (where all community models live), add `DirectMessage`/`Conversation` types, add `addEvent` + conversation storage to `CommunityStore`, create four new SwiftUI views in the Community feature folder, and wire navigation/sheets into `CommunityHubView`.

**Tech Stack:** Swift 6.0, SwiftUI, iOS 26, `@Observable`, `GlassChrome`, `AppTheme`, `GlassPrimaryButtonStyle`, `purrlyScreenBackground()`

---

## File Map

| Action | Path | Responsibility |
|--------|------|----------------|
| Modify | `RaceGuide/Models/UserProfile.swift` | Expand `CommunityEvent`; add `DirectMessage`, `Conversation` |
| Modify | `RaceGuide/Services/CommunityStore.swift` | Add `addEvent(_:)`, `conversations` array, `sendMessage(to:text:)` |
| Create | `RaceGuide/Features/Community/EventDetailView.swift` | Read-only event detail + attend toggle |
| Create | `RaceGuide/Features/Community/NewEventView.swift` | Form to create a new event |
| Create | `RaceGuide/Features/Community/ConversationView.swift` | 1-to-1 DM thread |
| Create | `RaceGuide/Features/Community/UserProfileView.swift` | User profile with posts, follow, message CTA |
| Modify | `RaceGuide/Features/Community/CommunityHubView.swift` | Wire NavigationLinks for events + messages tab |

---

### Task 1: Expand Community Models

**Files:**
- Modify: `RaceGuide/Models/UserProfile.swift`

Key changes:
- Replace minimal `CommunityEvent` (id/title/location/date) with a richer struct that has description, time string, address, type, maxAttendees, price, attendees array, createdAt.
- Add `DirectMessage` and `Conversation` value types.
- All new types conform to `Codable, Identifiable, Hashable` (matching existing patterns).

- [ ] **Step 1: Replace CommunityEvent and add DM models in UserProfile.swift**

Replace the existing `CommunityEvent` struct (lines 30–35) and append the two new types:

```swift
// In RaceGuide/Models/UserProfile.swift
// Replace existing CommunityEvent struct with:

struct CommunityEvent: Codable, Identifiable, Hashable {
    var id: String
    var title: String
    var description: String
    var date: String       // "YYYY-MM-DD"
    var time: String       // "HH:MM"
    var location: String
    var address: String
    var type: String       // meetup | adoption | show | workshop | charity
    var maxAttendees: Int
    var price: String      // "" means free
    var attendees: [String] // user IDs
    var createdAt: Date
}

// Append after CommunityComment:

struct DirectMessage: Codable, Identifiable, Hashable {
    var id: String
    var authorId: String
    var authorName: String
    var content: String
    var createdAt: Date
}

struct Conversation: Codable, Identifiable, Hashable {
    var id: String
    var participants: [String]
    var participantNames: [String: String]
    var messages: [DirectMessage]
    var lastActivity: Date
}
```

- [ ] **Step 2: Verify the file compiles in isolation (no xcodebuild yet)**

```bash
swiftc -parse /Volumes/EVO/rork-chat-race-guide/ios-native/RaceGuide/Models/UserProfile.swift 2>&1 | head -10
```

Expected: no output (parse-only won't resolve imports but catches syntax errors).

- [ ] **Step 3: Commit**

```bash
git -C /Volumes/EVO/rork-chat-race-guide/ios-native add RaceGuide/Models/UserProfile.swift
git -C /Volumes/EVO/rork-chat-race-guide/ios-native commit -m "feat(models): expand CommunityEvent + add DirectMessage/Conversation"
```

---

### Task 2: Update CommunityStore

**Files:**
- Modify: `RaceGuide/Services/CommunityStore.swift`

Key changes:
- Fix `loadSampleIfNeeded` sample data to use the new `CommunityEvent` init (all fields required).
- Add `addEvent(_ event: CommunityEvent)`.
- Add `private(set) var conversations: [Conversation] = []`.
- Add `sendMessage(to participantId: String, participantName: String, text: String, fromId: String, fromName: String)`.

- [ ] **Step 1: Update CommunityStore.swift**

Full replacement of the file:

```swift
import Foundation

/// Données communauté locales (à brancher sur Supabase social plus tard).
@Observable
@MainActor
final class CommunityStore {
    private(set) var posts: [CommunityPost] = []
    private(set) var events: [CommunityEvent] = []
    private(set) var comments: [String: [CommunityComment]] = [:]
    private(set) var conversations: [Conversation] = []

    func loadSampleIfNeeded() {
        guard posts.isEmpty else { return }
        let now = Date()
        posts = [
            CommunityPost(
                id: "1",
                authorName: "Léa",
                content: "Mon Maine Coon vient d'adopter sa litière — des conseils pour la transition ?",
                createdAt: now.addingTimeInterval(-3600),
                likes: 12,
                isLiked: false
            ),
            CommunityPost(
                id: "2",
                authorName: "Marc",
                content: "Photo du jour : notre Bengal adore les étagères hautes 🐾",
                createdAt: now.addingTimeInterval(-86_400),
                likes: 34,
                isLiked: true
            ),
        ]
        events = [
            CommunityEvent(
                id: "e1",
                title: "Rencontre éleveurs Maine Coon",
                description: "Grande rencontre des passionnés de Maine Coon. Venez avec vos chats !",
                date: isoDate(from: now.addingTimeInterval(86_400 * 5)),
                time: "14:00",
                location: "Lyon",
                address: "Parc de la Tête d'Or, 69006 Lyon",
                type: "meetup",
                maxAttendees: 50,
                price: "",
                attendees: [],
                createdAt: now
            ),
            CommunityEvent(
                id: "e2",
                title: "Journée adoption — refuge",
                description: "Le refuge ouvre ses portes pour une journée d'adoption spéciale chats.",
                date: isoDate(from: now.addingTimeInterval(86_400 * 12)),
                time: "10:00",
                location: "Paris",
                address: "15 rue des Chats, 75012 Paris",
                type: "adoption",
                maxAttendees: 100,
                price: "",
                attendees: [],
                createdAt: now
            ),
        ]
    }

    func toggleLike(postId: String) {
        guard let index = posts.firstIndex(where: { $0.id == postId }) else { return }
        var post = posts[index]
        post.isLiked.toggle()
        post.likes += post.isLiked ? 1 : -1
        posts[index] = post
    }

    func addPost(content: String, authorName: String) {
        let post = CommunityPost(
            id: UUID().uuidString,
            authorName: authorName,
            content: content,
            createdAt: Date(),
            likes: 0,
            isLiked: false
        )
        posts.insert(post, at: 0)
    }

    func addComment(postId: String, text: String, authorName: String) {
        let comment = CommunityComment(
            id: UUID().uuidString,
            postId: postId,
            authorName: authorName,
            text: text,
            createdAt: Date()
        )
        var existing = comments[postId] ?? []
        existing.append(comment)
        comments[postId] = existing
    }

    func commentsFor(postId: String) -> [CommunityComment] {
        comments[postId] ?? []
    }

    func addEvent(_ event: CommunityEvent) {
        events.insert(event, at: 0)
    }

    func sendMessage(
        to participantId: String,
        participantName: String,
        text: String,
        fromId: String,
        fromName: String
    ) {
        let message = DirectMessage(
            id: UUID().uuidString,
            authorId: fromId,
            authorName: fromName,
            content: text,
            createdAt: Date()
        )
        if let index = conversations.firstIndex(where: { $0.participants.contains(participantId) && $0.participants.contains(fromId) }) {
            var conv = conversations[index]
            conv.messages.append(message)
            conv.lastActivity = Date()
            conversations[index] = conv
        } else {
            let conv = Conversation(
                id: UUID().uuidString,
                participants: [fromId, participantId],
                participantNames: [fromId: fromName, participantId: participantName],
                messages: [message],
                lastActivity: Date()
            )
            conversations.insert(conv, at: 0)
        }
    }

    // MARK: - Helpers

    private func isoDate(from date: Date) -> String {
        let fmt = ISO8601DateFormatter()
        fmt.formatOptions = [.withFullDate]
        return fmt.string(from: date)
    }
}
```

- [ ] **Step 2: Commit**

```bash
git -C /Volumes/EVO/rork-chat-race-guide/ios-native add RaceGuide/Services/CommunityStore.swift
git -C /Volumes/EVO/rork-chat-race-guide/ios-native commit -m "feat(store): add addEvent, conversations, sendMessage to CommunityStore"
```

---

### Task 3: Create EventDetailView.swift

**Files:**
- Create: `RaceGuide/Features/Community/EventDetailView.swift`

- [ ] **Step 1: Create the file**

```swift
import SwiftUI

struct EventDetailView: View {
    let event: CommunityEvent
    @Environment(AppEnvironment.self) private var environment
    @State private var isAttending = false

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 20) {
                // Header card
                GlassChrome.card(tint: AppTheme.primary.opacity(0.1)) {
                    VStack(alignment: .leading, spacing: 12) {
                        HStack(spacing: 12) {
                            Text(eventTypeEmoji(event.type))
                                .font(.system(size: 36))
                            VStack(alignment: .leading, spacing: 4) {
                                Text(event.title)
                                    .font(.title3.weight(.bold))
                                    .foregroundStyle(AppTheme.ivory)
                                Text(eventTypeLabel(event.type))
                                    .font(.caption.weight(.semibold))
                                    .foregroundStyle(AppTheme.primary)
                                    .padding(.horizontal, 8)
                                    .padding(.vertical, 3)
                                    .background(AppTheme.primary.opacity(0.15), in: Capsule())
                            }
                            Spacer()
                        }
                        if !event.description.isEmpty {
                            Text(event.description)
                                .font(.subheadline)
                                .foregroundStyle(AppTheme.textSecondary)
                        }
                    }
                }

                // Details card
                GlassChrome.card {
                    VStack(spacing: 12) {
                        detailRow("calendar", "Date", "\(event.date) à \(event.time)")
                        detailRow("mappin", "Lieu", event.location)
                        if !event.address.isEmpty {
                            detailRow("map", "Adresse", event.address)
                        }
                        if !event.price.isEmpty {
                            detailRow("eurosign.circle", "Prix", "\(event.price) €")
                        } else {
                            detailRow("eurosign.circle", "Prix", "Gratuit")
                        }
                        detailRow("person.2", "Participants",
                                  "\(event.attendees.count)/\(event.maxAttendees)")
                    }
                }

                // Attend button
                Button {
                    isAttending.toggle()
                } label: {
                    Label(
                        isAttending ? "✓ Je participe" : "Participer",
                        systemImage: isAttending ? "checkmark.circle.fill" : "plus.circle"
                    )
                    .frame(maxWidth: .infinity, minHeight: AppTheme.minTouch)
                }
                .buttonStyle(GlassPrimaryButtonStyle())
                .accessibilityLabel(isAttending ? "Se désinscrire de l'événement" : "Participer à l'événement")
            }
            .padding(16)
        }
        .navigationTitle(event.title)
        .navigationBarTitleDisplayMode(.inline)
        .purrlyScreenBackground()
    }

    // MARK: - Sub-views

    private func detailRow(_ icon: String, _ label: String, _ value: String) -> some View {
        HStack(spacing: 12) {
            Image(systemName: icon)
                .foregroundStyle(AppTheme.primary)
                .frame(width: 20)
            Text(label)
                .foregroundStyle(AppTheme.textMuted)
                .font(.subheadline)
            Spacer()
            Text(value)
                .foregroundStyle(AppTheme.ivory)
                .font(.subheadline.weight(.semibold))
                .multilineTextAlignment(.trailing)
        }
    }

    // MARK: - Helpers

    private func eventTypeEmoji(_ type: String) -> String {
        switch type {
        case "meetup":   return "🐱"
        case "adoption": return "🏠"
        case "show":     return "🏆"
        case "workshop": return "📚"
        case "charity":  return "❤️"
        default:         return "📅"
        }
    }

    private func eventTypeLabel(_ type: String) -> String {
        switch type {
        case "meetup":   return "Rencontre"
        case "adoption": return "Adoption"
        case "show":     return "Exposition"
        case "workshop": return "Atelier"
        case "charity":  return "Caritatif"
        default:         return "Événement"
        }
    }
}
```

- [ ] **Step 2: Commit**

```bash
git -C /Volumes/EVO/rork-chat-race-guide/ios-native add RaceGuide/Features/Community/EventDetailView.swift
git -C /Volumes/EVO/rork-chat-race-guide/ios-native commit -m "feat(community): add EventDetailView"
```

---

### Task 4: Create NewEventView.swift

**Files:**
- Create: `RaceGuide/Features/Community/NewEventView.swift`

- [ ] **Step 1: Create the file**

```swift
import SwiftUI

struct NewEventView: View {
    @Environment(AppEnvironment.self) private var environment
    @Environment(\.dismiss) private var dismiss

    @State private var title = ""
    @State private var description = ""
    @State private var type = "meetup"
    @State private var date = Date()
    @State private var location = ""
    @State private var address = ""
    @State private var maxAttendees = "20"
    @State private var price = ""
    @State private var errorMessage: String?

    private let types: [(String, String)] = [
        ("meetup",   "🐱 Rencontre"),
        ("adoption", "🏠 Adoption"),
        ("show",     "🏆 Exposition"),
        ("workshop", "📚 Atelier"),
        ("charity",  "❤️ Caritatif"),
    ]

    var body: some View {
        NavigationStack {
            Form {
                Section("Type d'événement") {
                    Picker("Type", selection: $type) {
                        ForEach(types, id: \.0) { t in
                            Text(t.1).tag(t.0)
                        }
                    }
                }
                .listRowBackground(AppTheme.backgroundCard)

                Section("Détails") {
                    TextField("Titre", text: $title)
                    TextField("Description", text: $description, axis: .vertical)
                        .lineLimit(3...5)
                    DatePicker("Date", selection: $date, displayedComponents: [.date, .hourAndMinute])
                        .tint(AppTheme.primary)
                }
                .listRowBackground(AppTheme.backgroundCard)

                Section("Lieu") {
                    TextField("Nom du lieu", text: $location)
                    TextField("Adresse complète", text: $address)
                }
                .listRowBackground(AppTheme.backgroundCard)

                Section("Participants") {
                    TextField("Max participants", text: $maxAttendees)
                        .keyboardType(.numberPad)
                    TextField("Prix (optionnel, en €)", text: $price)
                        .keyboardType(.decimalPad)
                }
                .listRowBackground(AppTheme.backgroundCard)

                if let err = errorMessage {
                    Section {
                        Text(err)
                            .foregroundStyle(AppTheme.error)
                            .font(.footnote)
                    }
                    .listRowBackground(AppTheme.backgroundCard)
                }
            }
            .scrollContentBackground(.hidden)
            .background(AppTheme.background)
            .foregroundStyle(AppTheme.ivory)
            .tint(AppTheme.primary)
            .navigationTitle("Créer un événement")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button("Annuler") { dismiss() }
                        .foregroundStyle(AppTheme.textMuted)
                }
                ToolbarItem(placement: .confirmationAction) {
                    Button("Créer") { submit() }
                        .tint(AppTheme.primary)
                }
            }
        }
    }

    // MARK: - Actions

    private func submit() {
        let trimmedTitle = title.trimmingCharacters(in: .whitespaces)
        guard !trimmedTitle.isEmpty else {
            errorMessage = "Le titre est requis."
            return
        }
        guard !location.trimmingCharacters(in: .whitespaces).isEmpty else {
            errorMessage = "Le lieu est requis."
            return
        }
        errorMessage = nil

        let isoFmt = ISO8601DateFormatter()
        isoFmt.formatOptions = [.withFullDate]
        let dateStr = isoFmt.string(from: date)

        let cal = Calendar.current
        let h = cal.component(.hour, from: date)
        let m = cal.component(.minute, from: date)
        let timeStr = String(format: "%02d:%02d", h, m)

        let event = CommunityEvent(
            id: UUID().uuidString,
            title: trimmedTitle,
            description: description.trimmingCharacters(in: .whitespacesAndNewlines),
            date: dateStr,
            time: timeStr,
            location: location.trimmingCharacters(in: .whitespaces),
            address: address.trimmingCharacters(in: .whitespacesAndNewlines),
            type: type,
            maxAttendees: Int(maxAttendees) ?? 20,
            price: price.trimmingCharacters(in: .whitespaces),
            attendees: [],
            createdAt: Date()
        )
        environment.community.addEvent(event)
        dismiss()
    }
}
```

- [ ] **Step 2: Commit**

```bash
git -C /Volumes/EVO/rork-chat-race-guide/ios-native add RaceGuide/Features/Community/NewEventView.swift
git -C /Volumes/EVO/rork-chat-race-guide/ios-native commit -m "feat(community): add NewEventView"
```

---

### Task 5: Create ConversationView.swift

**Files:**
- Create: `RaceGuide/Features/Community/ConversationView.swift`

- [ ] **Step 1: Create the file**

```swift
import SwiftUI

struct ConversationView: View {
    let otherUserName: String
    let otherUserId: String

    @Environment(AppEnvironment.self) private var environment
    @State private var inputText = ""
    @FocusState private var inputFocused: Bool

    /// Messages local to this view (not persisted to store on every keystroke).
    @State private var localMessages: [DirectMessage] = []

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

        let msg = DirectMessage(
            id: UUID().uuidString,
            authorId: currentId,
            authorName: currentName,
            content: text,
            createdAt: Date()
        )
        localMessages.append(msg)

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
```

- [ ] **Step 2: Commit**

```bash
git -C /Volumes/EVO/rork-chat-race-guide/ios-native add RaceGuide/Features/Community/ConversationView.swift
git -C /Volumes/EVO/rork-chat-race-guide/ios-native commit -m "feat(community): add ConversationView with local message state"
```

---

### Task 6: Create UserProfileView.swift

**Files:**
- Create: `RaceGuide/Features/Community/UserProfileView.swift`

- [ ] **Step 1: Create the file**

```swift
import SwiftUI

struct UserProfileView: View {
    let userName: String
    let userId: String

    @Environment(AppEnvironment.self) private var environment
    @State private var isFollowing = false
    @State private var showConversation = false

    private var userPosts: [CommunityPost] {
        environment.community.posts.filter { $0.authorName == userName }
    }

    var body: some View {
        ScrollView {
            VStack(spacing: 20) {
                // Avatar + stats
                VStack(spacing: 16) {
                    initialsCircle(name: userName, size: 80)
                    Text(userName)
                        .font(.title2.weight(.bold))
                        .foregroundStyle(AppTheme.ivory)
                    HStack(spacing: 32) {
                        statItem("\(userPosts.count)", "Publications")
                        statItem("0", "Abonnés")
                        statItem("0", "Abonnements")
                    }
                }
                .padding(.top, 8)

                // Action buttons
                HStack(spacing: 12) {
                    Button {
                        isFollowing.toggle()
                    } label: {
                        Label(
                            isFollowing ? "Abonné·e" : "Suivre",
                            systemImage: isFollowing ? "checkmark.person.fill" : "person.badge.plus"
                        )
                        .frame(maxWidth: .infinity, minHeight: AppTheme.minTouch)
                    }
                    .buttonStyle(GlassPrimaryButtonStyle())
                    .accessibilityLabel(isFollowing ? "Se désabonner" : "Suivre \(userName)")

                    Button {
                        showConversation = true
                    } label: {
                        Image(systemName: "message.fill")
                            .font(.title3)
                            .frame(width: 50, height: AppTheme.minTouch)
                            .background(AppTheme.backgroundCard, in: RoundedRectangle(cornerRadius: 12))
                            .foregroundStyle(AppTheme.primary)
                    }
                    .accessibilityLabel("Envoyer un message à \(userName)")
                }

                // Recent posts
                if !userPosts.isEmpty {
                    VStack(alignment: .leading, spacing: 10) {
                        Text("Publications")
                            .font(.headline)
                            .foregroundStyle(AppTheme.ivory)
                        ForEach(userPosts.prefix(5)) { post in
                            PostMiniRow(post: post)
                        }
                    }
                } else {
                    GlassChrome.card {
                        Text("Aucune publication pour l'instant")
                            .foregroundStyle(AppTheme.textMuted)
                            .font(.subheadline)
                            .frame(maxWidth: .infinity)
                    }
                }
            }
            .padding(16)
        }
        .navigationTitle(userName)
        .navigationBarTitleDisplayMode(.inline)
        .sheet(isPresented: $showConversation) {
            NavigationStack {
                ConversationView(otherUserName: userName, otherUserId: userId)
            }
        }
        .purrlyScreenBackground()
    }

    // MARK: - Helpers

    private func initialsCircle(name: String, size: CGFloat) -> some View {
        ZStack {
            Circle()
                .fill(AppTheme.primary.opacity(0.2))
                .frame(width: size, height: size)
            Text(String(name.prefix(1)).uppercased())
                .font(.system(size: size * 0.4, weight: .bold))
                .foregroundStyle(AppTheme.primary)
        }
    }

    private func statItem(_ value: String, _ label: String) -> some View {
        VStack(spacing: 4) {
            Text(value)
                .font(.title3.weight(.bold))
                .foregroundStyle(AppTheme.ivory)
            Text(label)
                .font(.caption)
                .foregroundStyle(AppTheme.textMuted)
        }
    }
}

// MARK: - PostMiniRow

private struct PostMiniRow: View {
    let post: CommunityPost

    var body: some View {
        HStack(spacing: 10) {
            Text(post.content)
                .font(.subheadline)
                .foregroundStyle(AppTheme.textSecondary)
                .lineLimit(2)
            Spacer()
            Label("\(post.likes)", systemImage: "heart")
                .font(.caption)
                .foregroundStyle(AppTheme.textMuted)
        }
        .padding(10)
        .background(AppTheme.backgroundCard, in: RoundedRectangle(cornerRadius: 10))
    }
}
```

- [ ] **Step 2: Commit**

```bash
git -C /Volumes/EVO/rork-chat-race-guide/ios-native add RaceGuide/Features/Community/UserProfileView.swift
git -C /Volumes/EVO/rork-chat-race-guide/ios-native commit -m "feat(community): add UserProfileView"
```

---

### Task 7: Wire Navigation in CommunityHubView

**Files:**
- Modify: `RaceGuide/Features/Community/CommunityHubView.swift`

Key changes:
1. Events tab: wrap each event card in `NavigationLink(value:)`, add `navigationDestination(for: CommunityEvent.self)`, add FAB for `NewEventView` when `segment == .events`.
2. Feed tab: make `post.authorName` tappable → `UserProfileView`. The whole-card `NavigationLink` already goes to `PostDetailView`; author name needs a separate button. Best approach: extract `authorName` tap as an `@State private var selectedAuthor: (name: String, id: String)?` and use a sheet.
3. Messages tab: replace placeholder with conversation list from `environment.community.conversations`; if empty, show prompt.
4. Add `@State private var showingNewEvent = false`.
5. Add `navigationDestination(for: CommunityEvent.self)`.

- [ ] **Step 1: Rewrite CommunityHubView.swift**

```swift
import SwiftUI

struct CommunityHubView: View {
    @Environment(AppEnvironment.self) private var environment
    @State private var segment: Segment = .feed
    @State private var showingNewPost = false
    @State private var showingNewEvent = false
    @State private var selectedAuthor: AuthorRef?

    struct AuthorRef: Identifiable {
        let id: String
        let name: String
    }

    enum Segment: String, CaseIterable {
        case feed, events, messages
    }

    var body: some View {
        ZStack(alignment: .bottomTrailing) {
            VStack(spacing: 0) {
                picker
                ScrollView {
                    VStack(spacing: 12) {
                        switch segment {
                        case .feed:    feed
                        case .events:  events
                        case .messages: messagesTab
                        }
                    }
                    .padding(16)
                }
            }

            // FAB
            if segment == .feed {
                Button { showingNewPost = true } label: { fabLabel }
                    .padding(.trailing, 20).padding(.bottom, 24)
                    .accessibilityLabel("Nouvelle publication")
            }
            if segment == .events {
                Button { showingNewEvent = true } label: { fabLabel }
                    .padding(.trailing, 20).padding(.bottom, 24)
                    .accessibilityLabel("Nouvel événement")
            }
        }
        .purrlyScreenBackground()
        .navigationTitle(String(localized: "tab.community"))
        .onAppear { environment.community.loadSampleIfNeeded() }
        .navigationDestination(for: CommunityPost.self) { post in
            PostDetailView(post: post)
        }
        .navigationDestination(for: CommunityEvent.self) { event in
            EventDetailView(event: event)
        }
        .sheet(isPresented: $showingNewPost) {
            NewPostView()
        }
        .sheet(isPresented: $showingNewEvent) {
            NewEventView()
        }
        .sheet(item: $selectedAuthor) { author in
            NavigationStack {
                UserProfileView(userName: author.name, userId: author.id)
            }
        }
    }

    // MARK: - Sub-views

    private var fabLabel: some View {
        Image(systemName: "plus")
            .font(.title2.weight(.semibold))
            .foregroundStyle(AppTheme.background)
            .frame(width: 56, height: 56)
            .background(AppTheme.primary, in: Circle())
            .shadow(color: AppTheme.primary.opacity(0.4), radius: 8, y: 4)
    }

    private var picker: some View {
        Picker("", selection: $segment) {
            Text(String(localized: "community.feed")).tag(Segment.feed)
            Text(String(localized: "community.events")).tag(Segment.events)
            Text(String(localized: "community.messages")).tag(Segment.messages)
        }
        .pickerStyle(.segmented)
        .padding(.horizontal, 16)
        .padding(.vertical, 8)
    }

    @ViewBuilder
    private var feed: some View {
        ForEach(environment.community.posts) { post in
            NavigationLink(value: post) {
                GlassChrome.card(interactive: true) {
                    VStack(alignment: .leading, spacing: 10) {
                        HStack {
                            Button {
                                selectedAuthor = AuthorRef(id: "user-\(post.authorName)", name: post.authorName)
                            } label: {
                                Text(post.authorName)
                                    .font(.headline)
                                    .foregroundStyle(AppTheme.ivory)
                            }
                            .buttonStyle(.plain)
                            Spacer()
                            Text(post.createdAt, style: .relative)
                                .font(.caption)
                                .foregroundStyle(AppTheme.textMuted)
                        }
                        Text(post.content)
                            .foregroundStyle(AppTheme.textSecondary)
                        Button {
                            environment.community.toggleLike(postId: post.id)
                        } label: {
                            Label("\(post.likes)", systemImage: post.isLiked ? "heart.fill" : "heart")
                                .foregroundStyle(post.isLiked ? AppTheme.heart : AppTheme.textMuted)
                        }
                        .frame(minHeight: AppTheme.minTouch, alignment: .leading)
                        .accessibilityLabel(post.isLiked ? "Retirer le j'aime" : "Aimer")
                    }
                }
            }
            .buttonStyle(.plain)
        }
    }

    @ViewBuilder
    private var events: some View {
        ForEach(environment.community.events) { event in
            NavigationLink(value: event) {
                GlassChrome.card(interactive: true) {
                    VStack(alignment: .leading, spacing: 6) {
                        HStack(spacing: 8) {
                            Text(eventEmoji(event.type))
                            Text(event.title)
                                .font(.headline)
                                .foregroundStyle(AppTheme.ivory)
                            Spacer()
                        }
                        Label(event.location, systemImage: "mappin.and.ellipse")
                            .font(.subheadline)
                            .foregroundStyle(AppTheme.textSecondary)
                        Text("\(event.date) à \(event.time)")
                            .font(.caption)
                            .foregroundStyle(AppTheme.primary)
                    }
                }
            }
            .buttonStyle(.plain)
        }
    }

    @ViewBuilder
    private var messagesTab: some View {
        let convs = environment.community.conversations
        if convs.isEmpty {
            GlassChrome.card {
                Text(String(localized: "community.messages.placeholder"))
                    .foregroundStyle(AppTheme.textSecondary)
            }
        } else {
            ForEach(convs) { conv in
                let currentId = environment.auth.currentUser?.id ?? "me"
                let otherId = conv.participants.first(where: { $0 != currentId }) ?? ""
                let otherName = conv.participantNames[otherId] ?? "Utilisateur"
                Button {
                    selectedAuthor = AuthorRef(id: otherId, name: otherName)
                } label: {
                    GlassChrome.card(interactive: true) {
                        HStack(spacing: 12) {
                            ZStack {
                                Circle().fill(AppTheme.primary.opacity(0.2)).frame(width: 44, height: 44)
                                Text(String(otherName.prefix(1)).uppercased())
                                    .font(.headline.weight(.bold))
                                    .foregroundStyle(AppTheme.primary)
                            }
                            VStack(alignment: .leading, spacing: 2) {
                                Text(otherName).font(.headline).foregroundStyle(AppTheme.ivory)
                                if let last = conv.messages.last {
                                    Text(last.content).font(.subheadline).foregroundStyle(AppTheme.textMuted).lineLimit(1)
                                }
                            }
                            Spacer()
                            Text(conv.lastActivity, style: .relative).font(.caption2).foregroundStyle(AppTheme.textMuted)
                        }
                    }
                }
                .buttonStyle(.plain)
            }
        }
    }

    private func eventEmoji(_ type: String) -> String {
        switch type {
        case "meetup": return "🐱"; case "adoption": return "🏠"; case "show": return "🏆"
        case "workshop": return "📚"; case "charity": return "❤️"; default: return "📅"
        }
    }
}
```

- [ ] **Step 2: Commit**

```bash
git -C /Volumes/EVO/rork-chat-race-guide/ios-native add RaceGuide/Features/Community/CommunityHubView.swift
git -C /Volumes/EVO/rork-chat-race-guide/ios-native commit -m "feat(community): wire EventDetailView, NewEventView, UserProfileView in CommunityHubView"
```

---

### Task 8: Build Verification

**Files:** None (read-only verification)

- [ ] **Step 1: Regenerate Xcode project**

```bash
cd /Volumes/EVO/rork-chat-race-guide/ios-native && xcodegen generate
```

Expected: `✓ Generated: RaceGuide.xcodeproj`

- [ ] **Step 2: Build**

```bash
xcodebuild -scheme RaceGuide \
  -destination 'generic/platform=iOS Simulator' \
  -configuration Debug \
  CODE_SIGN_IDENTITY="" CODE_SIGNING_REQUIRED=NO CODE_SIGNING_ALLOWED=NO \
  build 2>&1 | grep -E "^.*error:" | grep -v "note:" | head -30
```

Expected: no output (zero errors).

- [ ] **Step 3: Fix any errors and commit**

If errors appear, fix them (usually minor: missing `Hashable` conformance on dictionaries, Swift 6 sendability warnings, etc.) and commit:

```bash
git -C /Volumes/EVO/rork-chat-race-guide/ios-native add -A
git -C /Volumes/EVO/rork-chat-race-guide/ios-native commit -m "fix(community): resolve build errors post-integration"
```

---

## Self-Review Notes

- All four new view types (`EventDetailView`, `NewEventView`, `ConversationView`, `UserProfileView`) are covered.
- `CommunityEvent` model expansion covers all required fields (id, title, description, date, time, location, address, type, maxAttendees, price, attendees, createdAt).
- `DirectMessage` and `Conversation` types added.
- `addEvent` and `sendMessage` added to `CommunityStore`.
- `CommunityHubView` wires `navigationDestination(for: CommunityEvent.self)`, FAB for events, author tap → `UserProfileView`, messages tab shows conversation list.
- `ConversationView` takes `otherUserId` (not just name) so `sendMessage` can find/create the right conversation.
- No placeholders. All code is complete.
- Type consistency: `ConversationView(otherUserName:otherUserId:)` matches its definition in Task 5 and its usage in Task 6 (`UserProfileView`) and Task 7 (`CommunityHubView`).
