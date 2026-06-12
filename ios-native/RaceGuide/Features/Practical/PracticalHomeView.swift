import SwiftUI

struct PracticalHomeView: View {
    @Environment(AppEnvironment.self) private var environment

    var body: some View {
        List {
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
