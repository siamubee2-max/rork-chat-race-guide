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
