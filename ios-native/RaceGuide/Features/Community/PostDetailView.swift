import SwiftUI

struct PostDetailView: View {
    let post: CommunityPost

    @Environment(AppEnvironment.self) private var environment
    @State private var commentText: String = ""
    @FocusState private var commentFocused: Bool

    private var comments: [CommunityComment] {
        environment.community.commentsFor(postId: post.id)
    }

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 0) {
                postHeader
                    .padding(.horizontal, 16)
                    .padding(.top, 16)

                Text(post.content)
                    .foregroundStyle(AppTheme.textSecondary)
                    .padding(.horizontal, 16)
                    .padding(.top, 12)

                likeRow
                    .padding(.horizontal, 16)
                    .padding(.top, 10)

                Divider()
                    .background(AppTheme.border)
                    .padding(.vertical, 16)

                commentsSection
                    .padding(.horizontal, 16)
            }
        }
        .safeAreaInset(edge: .bottom) {
            commentInput
        }
        .purrlyScreenBackground()
        .navigationTitle(String(localized: "community.post.title"))
        .navigationBarTitleDisplayMode(.inline)
    }

    // MARK: - Sub-views

    private var postHeader: some View {
        HStack(spacing: 12) {
            initialsCircle(name: post.authorName, size: 44)

            VStack(alignment: .leading, spacing: 2) {
                Text(post.authorName)
                    .font(.headline)
                    .foregroundStyle(AppTheme.ivory)
                Text(post.createdAt, style: .relative)
                    .font(.caption)
                    .foregroundStyle(AppTheme.textMuted)
            }
            Spacer()
        }
    }

    private var likeRow: some View {
        Button {
            environment.community.toggleLike(postId: post.id)
        } label: {
            let current = environment.community.posts.first(where: { $0.id == post.id }) ?? post
            Label("\(current.likes)", systemImage: current.isLiked ? "heart.fill" : "heart")
                .foregroundStyle(current.isLiked ? AppTheme.heart : AppTheme.textMuted)
                .font(.subheadline.weight(.semibold))
        }
        .frame(minHeight: AppTheme.minTouch, alignment: .leading)
        .accessibilityLabel({
            let current = environment.community.posts.first(where: { $0.id == post.id }) ?? post
            return current.isLiked ? "Retirer le j'aime" : "Aimer"
        }())
    }

    private var commentsSection: some View {
        VStack(alignment: .leading, spacing: 16) {
            Text(comments.isEmpty
                 ? "Commentaires"
                 : "Commentaires (\(comments.count))")
                .font(.headline)
                .foregroundStyle(AppTheme.ivory)

            if comments.isEmpty {
                Text("Soyez le premier à commenter")
                    .font(.subheadline)
                    .foregroundStyle(AppTheme.textMuted)
                    .padding(.bottom, 8)
            } else {
                ForEach(comments) { comment in
                    commentRow(comment)
                }
            }
        }
        .padding(.bottom, 16)
    }

    private func commentRow(_ comment: CommunityComment) -> some View {
        HStack(alignment: .top, spacing: 10) {
            initialsCircle(name: comment.authorName, size: 32)
            VStack(alignment: .leading, spacing: 2) {
                Text(comment.authorName)
                    .font(.subheadline.weight(.semibold))
                    .foregroundStyle(AppTheme.ivory)
                Text(comment.text)
                    .font(.subheadline)
                    .foregroundStyle(AppTheme.textSecondary)
                Text(comment.createdAt, style: .relative)
                    .font(.caption)
                    .foregroundStyle(AppTheme.textMuted)
            }
            Spacer()
        }
    }

    private var commentInput: some View {
        HStack(spacing: 10) {
            TextField("Ajouter un commentaire...", text: $commentText, axis: .vertical)
                .lineLimit(1...4)
                .focused($commentFocused)
                .padding(.horizontal, 14)
                .padding(.vertical, 10)
                .background(AppTheme.backgroundCard, in: RoundedRectangle(cornerRadius: 20))
                .overlay(
                    RoundedRectangle(cornerRadius: 20)
                        .stroke(AppTheme.border, lineWidth: 1)
                )
                .foregroundStyle(AppTheme.ivory)
                .tint(AppTheme.primary)

            Button {
                submitComment()
            } label: {
                Image(systemName: "paperplane.fill")
                    .foregroundStyle(commentText.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty
                                     ? AppTheme.textMuted : AppTheme.primary)
            }
            .frame(width: 44, height: 44)
            .disabled(commentText.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty)
        }
        .padding(.horizontal, 16)
        .padding(.vertical, 10)
        .background(AppTheme.background.ignoresSafeArea(edges: .bottom))
        .overlay(alignment: .top) {
            Divider().background(AppTheme.border)
        }
    }

    // MARK: - Actions

    private func submitComment() {
        let trimmed = commentText.trimmingCharacters(in: .whitespacesAndNewlines)
        guard !trimmed.isEmpty else { return }
        let authorName = environment.auth.currentUser?.name ?? "Vous"
        environment.community.addComment(postId: post.id, text: trimmed, authorName: authorName)
        commentText = ""
        commentFocused = false
    }

    // MARK: - Helpers

    private func initialsCircle(name: String, size: CGFloat) -> some View {
        ZStack {
            Circle()
                .fill(AppTheme.primary.opacity(0.25))
                .frame(width: size, height: size)
            Text(String(name.prefix(1)).uppercased())
                .font(size >= 40 ? .title3.weight(.bold) : .caption.weight(.bold))
                .foregroundStyle(AppTheme.primary)
        }
    }
}
