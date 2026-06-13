import SwiftUI

struct CommunityHubView: View {
    @Environment(AppEnvironment.self) private var environment
    @State private var segment: Segment = .feed
    @State private var showingNewPost = false

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
                        case .feed:
                            feed
                        case .events:
                            events
                        case .messages:
                            messagesPlaceholder
                        }
                    }
                    .padding(16)
                }
            }

            if segment == .feed {
                Button {
                    showingNewPost = true
                } label: {
                    Image(systemName: "plus")
                        .font(.title2.weight(.semibold))
                        .foregroundStyle(AppTheme.background)
                        .frame(width: 56, height: 56)
                        .background(AppTheme.primary, in: Circle())
                        .shadow(color: AppTheme.primary.opacity(0.4), radius: 8, y: 4)
                }
                .padding(.trailing, 20)
                .padding(.bottom, 24)
                .accessibilityLabel("Nouvelle publication")
            }
        }
        .purrlyScreenBackground()
        .navigationTitle(String(localized: "tab.community"))
        .onAppear { environment.community.loadSampleIfNeeded() }
        .navigationDestination(for: CommunityPost.self) { post in
            PostDetailView(post: post)
        }
        .sheet(isPresented: $showingNewPost) {
            NewPostView()
        }
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

    private var feed: some View {
        ForEach(environment.community.posts) { post in
            NavigationLink(value: post) {
                GlassChrome.card(interactive: true) {
                    VStack(alignment: .leading, spacing: 10) {
                        HStack {
                            Text(post.authorName)
                                .font(.headline)
                                .foregroundStyle(AppTheme.ivory)
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

    private var events: some View {
        ForEach(environment.community.events) { event in
            GlassChrome.card {
                VStack(alignment: .leading, spacing: 6) {
                    Text(event.title)
                        .font(.headline)
                        .foregroundStyle(AppTheme.ivory)
                    Label(event.location, systemImage: "mappin.and.ellipse")
                        .font(.subheadline)
                        .foregroundStyle(AppTheme.textSecondary)
                    Text(event.date, format: .dateTime.weekday(.abbreviated).day().month())
                        .font(.caption)
                        .foregroundStyle(AppTheme.primary)
                }
            }
        }
    }

    private var messagesPlaceholder: some View {
        GlassChrome.card {
            Text(String(localized: "community.messages.placeholder"))
                .foregroundStyle(AppTheme.textSecondary)
        }
    }
}
