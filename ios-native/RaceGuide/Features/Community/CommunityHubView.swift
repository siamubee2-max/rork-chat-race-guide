import SwiftUI

struct CommunityHubView: View {
    @Environment(AppEnvironment.self) private var environment
    @State private var segment: Segment = .feed

    enum Segment: String, CaseIterable {
        case feed, events, messages
    }

    var body: some View {
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
        .purrlyScreenBackground()
        .navigationTitle(String(localized: "tab.community"))
        .onAppear { environment.community.loadSampleIfNeeded() }
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
