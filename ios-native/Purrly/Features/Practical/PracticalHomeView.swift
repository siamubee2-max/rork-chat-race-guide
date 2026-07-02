import SwiftUI

struct PracticalHomeView: View {
    @Environment(AppEnvironment.self) private var environment

    private var reminderSubtitle: String {
        let pending = environment.reminders.reminders.filter { !$0.isCompleted }.count
        return pending == 0 ? "Aucun rappel" : "\(pending) rappel\(pending > 1 ? "s" : "") à venir"
    }

    private var shoppingSubtitle: String {
        let count = environment.shopping.items.filter { !$0.isChecked }.count
        return count == 0 ? "Liste vide" : "\(count) article\(count > 1 ? "s" : "") à acheter"
    }

    var body: some View {
        List {
            Section {
                NavigationLink(destination: RemindersView()) {
                    PracticalRow(symbol: "bell", title: "Rappels",
                                 subtitle: reminderSubtitle)
                }
                NavigationLink(destination: ShoppingView()) {
                    PracticalRow(symbol: "cart", title: "Courses",
                                 subtitle: shoppingSubtitle)
                }
                NavigationLink(destination: FirstAidView()) {
                    PracticalRow(symbol: "cross.case", title: "Premiers secours",
                                 subtitle: "Guide d'urgence")
                }
            } header: {
                Text("Santé & Organisation").foregroundStyle(AppTheme.textMuted)
            }
            .listRowBackground(AppTheme.backgroundCard)

            Section {
                NavigationLink(destination: ExpensesListView()) {
                    PracticalRow(symbol: "creditcard", title: "Dépenses",
                                 subtitle: environment.expenses.grandTotal
                                     .formatted(.currency(code: Locale.current.currency?.identifier ?? "EUR")))
                }
                NavigationLink(destination: VetsView()) {
                    PracticalRow(symbol: "stethoscope", title: "Vétérinaires",
                                 subtitle: "Trouver près de moi")
                }
                NavigationLink(destination: FoodCalculatorView()) {
                    PracticalRow(symbol: "fork.knife", title: "Calculateur alimentaire",
                                 subtitle: "Rations journalières")
                }
                NavigationLink(destination: TravelView()) {
                    PracticalRow(symbol: "airplane", title: "Checklist voyage",
                                 subtitle: "Préparer le départ")
                }
            } header: {
                Text("Outils").foregroundStyle(AppTheme.textMuted)
            }
            .listRowBackground(AppTheme.backgroundCard)
        }
        .listStyle(.insetGrouped)
        .scrollContentBackground(.hidden)
        .navigationTitle("Pratique")
        .purrlyScreenBackground()
    }
}

private struct PracticalRow: View {
    let symbol: String
    let title: String
    let subtitle: String

    var body: some View {
        HStack(spacing: 14) {
            Image(systemName: symbol)
                .font(.system(size: 20))
                .foregroundStyle(AppTheme.primary)
                .frame(width: 32)
            VStack(alignment: .leading, spacing: 2) {
                Text(title).foregroundStyle(AppTheme.ivory).font(.body.weight(.semibold))
                Text(subtitle).foregroundStyle(AppTheme.textMuted).font(.caption)
            }
        }
        .padding(.vertical, 4)
    }
}
