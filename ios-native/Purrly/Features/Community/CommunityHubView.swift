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
                        case .feed:     feed
                        case .events:   events
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
        let me = environment.auth.currentUser?.name ?? ""
        let visiblePosts = environment.community.posts.filter {
            !environment.moderation.isHidden(id: $0.id, author: $0.authorName)
        }
        ForEach(visiblePosts) { post in
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
            .moderationContextMenu(author: post.authorName, itemId: post.id, currentUserName: me)
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
        case "meetup":   return "🐱"
        case "adoption": return "🏠"
        case "show":     return "🏆"
        case "workshop": return "📚"
        case "charity":  return "❤️"
        default:         return "📅"
        }
    }
}
