import SwiftUI

struct ExpenseFormView: View {
    @Environment(AppEnvironment.self) private var environment
    @Environment(\.dismiss) private var dismiss

    @State private var category: ExpenseCategory = .vet
    @State private var amountText = ""
    @State private var date = Date()
    @State private var notes = ""
    @State private var errorMessage: String?

    var body: some View {
        NavigationStack {
            Form {
                Section("Catégorie") {
                    Picker("Catégorie", selection: $category) {
                        ForEach(ExpenseCategory.allCases, id: \.self) { cat in
                            Label(cat.label, systemImage: cat.symbol).tag(cat)
                        }
                    }
                }
                .listRowBackground(AppTheme.backgroundCard)

                Section("Montant") {
                    TextField("0,00", text: $amountText)
                        .keyboardType(.decimalPad)
                    DatePicker("Date", selection: $date, displayedComponents: .date)
                        .tint(AppTheme.primary)
                }
                .listRowBackground(AppTheme.backgroundCard)

                Section("Notes (optionnel)") {
                    TextField("Notes", text: $notes, axis: .vertical).lineLimit(2...4)
                }
                .listRowBackground(AppTheme.backgroundCard)

                if let err = errorMessage {
                    Section {
                        Text(err).foregroundStyle(AppTheme.error).font(.footnote)
                    }
                    .listRowBackground(AppTheme.backgroundCard)
                }
            }
            .scrollContentBackground(.hidden)
            .background(AppTheme.background)
            .navigationTitle("Nouvelle dépense")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button("Annuler") { dismiss() }
                }
                ToolbarItem(placement: .confirmationAction) {
                    Button("Ajouter") { submit() }.tint(AppTheme.primary)
                }
            }
        }
    }

    private func submit() {
        let cleaned = amountText.replacingOccurrences(of: ",", with: ".")
        guard let amount = Double(cleaned), amount > 0 else {
            errorMessage = "Montant invalide."
            return
        }
        environment.expenses.add(
            Expense.create(category: category, amount: amount, date: date, notes: notes))
        dismiss()
    }
}
