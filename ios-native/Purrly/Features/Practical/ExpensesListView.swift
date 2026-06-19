import SwiftUI

struct ExpensesListView: View {
    @Environment(AppEnvironment.self) private var environment
    @State private var showForm = false

    private var store: ExpenseStore { environment.expenses }

    var body: some View {
        List {
            Section {
                HStack {
                    Text("Total").foregroundStyle(AppTheme.textSecondary)
                    Spacer()
                    Text(store.grandTotal, format: .currency(code: Locale.current.currency?.identifier ?? "EUR"))
                        .font(.headline).foregroundStyle(AppTheme.primary)
                }
            }
            .listRowBackground(AppTheme.backgroundCard)

            if store.expenses.isEmpty {
                Section {
                    Text("Aucune dépense enregistrée.")
                        .foregroundStyle(AppTheme.textMuted)
                        .font(.subheadline)
                }
                .listRowBackground(AppTheme.backgroundCard)
            } else {
                ForEach(store.expenses) { expense in
                    Section {
                        HStack {
                            Image(systemName: expense.category.symbol)
                                .foregroundStyle(AppTheme.primary)
                                .frame(width: 28)
                            VStack(alignment: .leading, spacing: 2) {
                                Text(expense.category.label).foregroundStyle(AppTheme.ivory)
                                if !expense.notes.isEmpty {
                                    Text(expense.notes).font(.caption)
                                        .foregroundStyle(AppTheme.textMuted)
                                }
                                Text(expense.date, style: .date)
                                    .font(.caption2).foregroundStyle(AppTheme.textMuted)
                            }
                            Spacer()
                            Text(expense.amount, format: .currency(code: Locale.current.currency?.identifier ?? "EUR"))
                                .font(.headline).foregroundStyle(AppTheme.ivory)
                        }
                    }
                    .listRowBackground(AppTheme.backgroundCard)
                    .swipeActions(edge: .trailing) {
                        Button(role: .destructive) { store.delete(id: expense.id) }
                            label: { Label("Supprimer", systemImage: "trash") }
                    }
                }
            }
        }
        .listStyle(.insetGrouped)
        .scrollContentBackground(.hidden)
        .navigationTitle("Dépenses")
        .toolbar {
            ToolbarItem(placement: .primaryAction) {
                Button { showForm = true } label: { Image(systemName: "plus") }
                    .tint(AppTheme.primary)
            }
        }
        .sheet(isPresented: $showForm) { ExpenseFormView() }
        .purrlyScreenBackground()
    }
}
