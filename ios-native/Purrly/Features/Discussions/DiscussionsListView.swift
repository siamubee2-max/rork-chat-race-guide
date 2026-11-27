import SwiftUI

struct DiscussionsListView: View {
    @Environment(AppEnvironment.self) private var environment
    @State private var showNew = false

    private var store: DiscussionsStore { environment.discussions }

    private var visibleThreads: [DiscussionThread] {
        store.threads.filter {
            !environment.moderation.isHidden(id: $0.id, author: $0.author)
        }
    }

    var body: some View {
        if visibleThreads.isEmpty {
            Text("Aucune discussion pour l'instant. Lancez la première !")
                .font(.subheadline)
                .foregroundStyle(AppTheme.textMuted)
                .frame(maxWidth: .infinity, alignment: .center)
                .padding(.vertical, 24)
        }
        List(visibleThreads) { thread in
            NavigationLink(destination: DiscussionDetailView(thread: thread)) {
                VStack(alignment: .leading, spacing: 4) {
                    Text(thread.title)
                        .font(.body.weight(.semibold))
                        .foregroundStyle(AppTheme.ivory)
                        .lineLimit(2)
                    HStack(spacing: 6) {
                        Text(thread.authorName)
                            .font(.caption).foregroundStyle(AppTheme.textMuted)
                        Text("·").foregroundStyle(AppTheme.textMuted)
                        Text("\(thread.messageCount) messages")
                            .font(.caption).foregroundStyle(AppTheme.textMuted)
                        Spacer()
                        Text(thread.createdAt, style: .relative)
                            .font(.caption2).foregroundStyle(AppTheme.textMuted)
                    }
                }
                .padding(.vertical, 4)
            }
            .listRowBackground(AppTheme.backgroundCard)
            .listRowSeparatorTint(AppTheme.border)
            .moderationContextMenu(author: thread.author, kind: .thread, itemId: thread.id)
        }
        .listStyle(.plain)
        .scrollContentBackground(.hidden)
        .navigationTitle("Forum")
        .toolbar {
            ToolbarItem(placement: .primaryAction) {
                Button { showNew = true } label: {
                    Image(systemName: "square.and.pencil")
                }
                .tint(AppTheme.primary)
            }
        }
        .sheet(isPresented: $showNew) { NewDiscussionView() }
        .purrlyScreenBackground()
    }
}
