import SwiftUI

struct RemindersView: View {
    @Environment(AppEnvironment.self) private var environment
    @State private var showForm = false

    private var upcoming: [Reminder] {
        environment.reminders.reminders.filter { !$0.isCompleted }
    }
    private var completed: [Reminder] {
        environment.reminders.reminders.filter(\.isCompleted)
    }

    var body: some View {
        List {
            if upcoming.isEmpty && completed.isEmpty {
                emptyState
            }

            if !upcoming.isEmpty {
                Section {
                    ForEach(upcoming) { reminder in
                        ReminderRow(reminder: reminder,
                                    catName: catName(for: reminder.catId))
                            .onTapGesture { environment.reminders.toggle(id: reminder.id) }
                            .swipeActions(edge: .trailing, allowsFullSwipe: true) {
                                Button(role: .destructive) {
                                    environment.reminders.delete(id: reminder.id)
                                } label: {
                                    Label("Supprimer", systemImage: "trash")
                                }
                            }
                    }
                } header: {
                    Text("A venir (\(upcoming.count))")
                        .foregroundStyle(AppTheme.textMuted)
                }
                .listRowBackground(AppTheme.backgroundCard)
            }

            if !completed.isEmpty {
                Section {
                    ForEach(completed) { reminder in
                        ReminderRow(reminder: reminder,
                                    catName: catName(for: reminder.catId))
                            .onTapGesture { environment.reminders.toggle(id: reminder.id) }
                            .swipeActions(edge: .trailing, allowsFullSwipe: true) {
                                Button(role: .destructive) {
                                    environment.reminders.delete(id: reminder.id)
                                } label: {
                                    Label("Supprimer", systemImage: "trash")
                                }
                            }
                    }
                } header: {
                    Text("Terminés (\(completed.count))")
                        .foregroundStyle(AppTheme.textMuted)
                }
                .listRowBackground(AppTheme.backgroundCard)
            }
        }
        .listStyle(.insetGrouped)
        .scrollContentBackground(.hidden)
        .navigationTitle("Rappels")
        .navigationBarTitleDisplayMode(.large)
        .purrlyScreenBackground()
        .toolbar {
            ToolbarItem(placement: .primaryAction) {
                Button { showForm = true } label: {
                    Image(systemName: "plus")
                        .foregroundStyle(AppTheme.primary)
                }
            }
        }
        .sheet(isPresented: $showForm) {
            ReminderFormView()
        }
    }

    private var emptyState: some View {
        Section {
            VStack(spacing: 12) {
                Image(systemName: "bell.slash")
                    .font(.system(size: 44))
                    .foregroundStyle(AppTheme.textMuted)
                Text("Aucun rappel")
                    .font(.headline)
                    .foregroundStyle(AppTheme.ivory)
                Text("Créez des rappels pour les vaccins, médicaments ou rendez-vous de votre chat")
                    .font(.footnote)
                    .foregroundStyle(AppTheme.textMuted)
                    .multilineTextAlignment(.center)
            }
            .frame(maxWidth: .infinity)
            .padding(.vertical, 40)
        }
        .listRowBackground(Color.clear)
    }

    private func catName(for catId: String?) -> String? {
        guard let catId else { return nil }
        return environment.cats.cats.first(where: { $0.id == catId })?.name
    }
}

private struct ReminderRow: View {
    let reminder: Reminder
    let catName: String?

    var body: some View {
        HStack(spacing: 12) {
            Image(systemName: reminder.isCompleted ? "checkmark.circle.fill" : "circle")
                .font(.system(size: 22))
                .foregroundStyle(reminder.isCompleted ? AppTheme.success : AppTheme.textMuted)
                .frame(width: 28)

            VStack(alignment: .leading, spacing: 3) {
                Text(reminder.title)
                    .font(.body.weight(.semibold))
                    .foregroundStyle(reminder.isCompleted ? AppTheme.textMuted : AppTheme.ivory)
                    .strikethrough(reminder.isCompleted, color: AppTheme.textMuted)

                HStack(spacing: 6) {
                    Image(systemName: "calendar")
                        .font(.caption2)
                        .foregroundStyle(reminder.date < Date() && !reminder.isCompleted ? AppTheme.error : AppTheme.textMuted)
                    Text(reminder.date.formatted(date: .abbreviated, time: .omitted))
                        .font(.caption)
                        .foregroundStyle(reminder.date < Date() && !reminder.isCompleted ? AppTheme.error : AppTheme.textMuted)

                    if reminder.frequency != .once {
                        Text("·")
                            .foregroundStyle(AppTheme.textMuted)
                        Text(reminder.frequency.label)
                            .font(.caption)
                            .foregroundStyle(AppTheme.primary)
                    }

                    if let cat = catName {
                        Text("·")
                            .foregroundStyle(AppTheme.textMuted)
                        Text(cat)
                            .font(.caption)
                            .foregroundStyle(AppTheme.textMuted)
                    }
                }

                if !reminder.notes.isEmpty {
                    Text(reminder.notes)
                        .font(.caption)
                        .foregroundStyle(AppTheme.textMuted)
                        .lineLimit(1)
                }
            }

            Spacer()

            if reminder.date < Date() && !reminder.isCompleted {
                Text("En retard")
                    .font(.caption2.weight(.semibold))
                    .foregroundStyle(AppTheme.error)
                    .padding(.horizontal, 7)
                    .padding(.vertical, 3)
                    .background(AppTheme.error.opacity(0.15), in: RoundedRectangle(cornerRadius: 6))
            }
        }
        .padding(.vertical, 4)
        .opacity(reminder.isCompleted ? 0.65 : 1)
    }
}
