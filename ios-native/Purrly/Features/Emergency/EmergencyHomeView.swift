import SwiftUI

struct EmergencyHomeView: View {
    @Environment(AppEnvironment.self) private var environment
    @State private var showCreate = false

    private var store: EmergencyStore { environment.emergency }

    var body: some View {
        Group {
            if store.alerts.isEmpty {
                emptyState
            } else {
                List {
                    ForEach(store.alerts) { alert in
                        AlertRow(alert: alert)
                            .listRowBackground(AppTheme.backgroundCard)
                            .listRowSeparatorTint(AppTheme.border)
                            .swipeActions(edge: .trailing) {
                                Button(role: .destructive) {
                                    store.delete(id: alert.id)
                                } label: {
                                    Label("Supprimer", systemImage: "trash")
                                }
                                if !alert.isResolved {
                                    Button { store.resolve(id: alert.id) } label: {
                                        Label("Résolu", systemImage: "checkmark.circle")
                                    }
                                    .tint(.green)
                                }
                            }
                    }
                }
                .listStyle(.plain)
                .scrollContentBackground(.hidden)
            }
        }
        .navigationTitle(String(localized: "emergency.title"))
        .toolbar {
            ToolbarItem(placement: .primaryAction) {
                Button { showCreate = true } label: {
                    Image(systemName: "plus")
                }
                .tint(AppTheme.primary)
                .accessibilityIdentifier("createAlertButton")
            }
        }
        .sheet(isPresented: $showCreate) { CreateAlertView() }
        .purrlyScreenBackground()
    }

    private var emptyState: some View {
        VStack(spacing: 16) {
            Image(systemName: "cross.circle")
                .font(.system(size: 52))
                .foregroundStyle(AppTheme.textMuted)
            Text(String(localized: "emergency.empty.title"))
                .font(.headline)
                .foregroundStyle(AppTheme.ivory)
            Text(String(localized: "emergency.empty.body"))
                .font(.subheadline)
                .foregroundStyle(AppTheme.textSecondary)
                .multilineTextAlignment(.center)
            Button { showCreate = true } label: {
                Label(String(localized: "emergency.createAlert"), systemImage: "plus")
                    .frame(minHeight: AppTheme.minTouch)
            }
            .buttonStyle(GlassPrimaryButtonStyle())
            .padding(.top, 8)
        }
        .padding(32)
        .frame(maxWidth: .infinity, maxHeight: .infinity)
    }
}

private struct AlertRow: View {
    let alert: EmergencyAlert

    var body: some View {
        HStack(spacing: 12) {
            Circle()
                .fill(Color(hex: UInt32(alert.type.colorHex, radix: 16) ?? 0xFF6B6B))
                .frame(width: 10, height: 10)
            VStack(alignment: .leading, spacing: 2) {
                HStack {
                    Text(alert.catName)
                        .font(.headline)
                        .foregroundStyle(AppTheme.ivory)
                    if alert.isResolved {
                        Text("Résolu")
                            .font(.caption)
                            .foregroundStyle(.green)
                            .padding(.horizontal, 6)
                            .padding(.vertical, 2)
                            .background(.green.opacity(0.15), in: Capsule())
                    }
                }
                Text(alert.type.label)
                    .font(.caption)
                    .foregroundStyle(AppTheme.textMuted)
                Text(alert.location)
                    .font(.subheadline)
                    .foregroundStyle(AppTheme.textSecondary)
            }
            Spacer()
            Text(alert.createdAt, style: .relative)
                .font(.caption2)
                .foregroundStyle(AppTheme.textMuted)
        }
        .padding(.vertical, 4)
    }
}
