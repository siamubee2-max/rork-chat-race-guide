import SwiftUI

struct PracticalHomeView: View {
    @Environment(AppEnvironment.self) private var environment

    private var reminderSubtitle: String {
        let pending = environment.reminders.reminders.filter { !$0.isCompleted }.count
        return pending == 0 ? String(localized: "Aucun rappel") : String(localized: "\(pending) rappels à venir")
    }

    private var shoppingSubtitle: String {
        let count = environment.shopping.items.filter { !$0.isChecked }.count
        return count == 0 ? String(localized: "Liste vide") : String(localized: "\(count) articles à acheter")
    }

    var body: some View {
        List {
            Section {
                NavigationLink(destination: RemindersView()) {
                    PracticalRow(symbol: "bell", title: String(localized: "Rappels"),
                                 subtitle: reminderSubtitle)
                }
                NavigationLink(destination: ShoppingView()) {
                    PracticalRow(symbol: "cart", title: String(localized: "Courses"),
                                 subtitle: shoppingSubtitle)
                }
                NavigationLink(destination: FirstAidView()) {
                    PracticalRow(symbol: "cross.case", title: String(localized: "Premiers secours"),
                                 subtitle: String(localized: "Guide d'urgence"))
                }
            } header: {
                Text("Santé & Organisation").foregroundStyle(AppTheme.textMuted)
            }
            .listRowBackground(AppTheme.backgroundCard)

            Section {
                NavigationLink(destination: ExpensesListView()) {
                    PracticalRow(symbol: "creditcard", title: String(localized: "Dépenses"),
                                 subtitle: environment.expenses.grandTotal
                                     .formatted(.currency(code: Locale.current.currency?.identifier ?? "EUR")))
                }
                NavigationLink(destination: VetsView()) {
                    PracticalRow(symbol: "stethoscope", title: String(localized: "Vétérinaires"),
                                 subtitle: String(localized: "Trouver près de moi"))
                }
                NavigationLink(destination: FoodCalculatorView()) {
                    PracticalRow(symbol: "fork.knife", title: String(localized: "Calculateur alimentaire"),
                                 subtitle: String(localized: "Rations journalières"))
                }
                NavigationLink(destination: TravelView()) {
                    PracticalRow(symbol: "airplane", title: String(localized: "Checklist voyage"),
                                 subtitle: String(localized: "Préparer le départ"))
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
