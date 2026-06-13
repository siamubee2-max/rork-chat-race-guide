import SwiftUI

private let categoryMeta: [(key: String, label: String, symbol: String, color: Color)] = [
    ("food",        "Nourriture",   "fork.knife",           .green),
    ("health",      "Santé",        "cross.case",           Color(hex: 0x2196F3)),
    ("accessories", "Accessoires",  "tag",                  Color(hex: 0xFF9800)),
    ("other",       "Autre",        "circle.grid.2x2",      AppTheme.textMuted),
]

struct ShoppingView: View {
    @Environment(AppEnvironment.self) private var environment

    @State private var newName = ""
    @State private var newCategory = "other"
    @State private var newQuantity = ""

    private var unchecked: [ShoppingItem] { environment.shopping.items.filter { !$0.isChecked } }
    private var checked: [ShoppingItem]   { environment.shopping.items.filter(\.isChecked) }

    var body: some View {
        List {
            addSection

            if !unchecked.isEmpty {
                Section("A acheter (\(unchecked.count))") {
                    ForEach(unchecked) { item in
                        ShoppingRow(item: item)
                            .onTapGesture { environment.shopping.toggle(id: item.id) }
                            .swipeActions(edge: .trailing, allowsFullSwipe: true) {
                                Button(role: .destructive) {
                                    environment.shopping.delete(id: item.id)
                                } label: {
                                    Label("Supprimer", systemImage: "trash")
                                }
                            }
                    }
                }
                .listRowBackground(AppTheme.backgroundCard)
            }

            if !checked.isEmpty {
                Section {
                    ForEach(checked) { item in
                        ShoppingRow(item: item)
                            .onTapGesture { environment.shopping.toggle(id: item.id) }
                            .swipeActions(edge: .trailing, allowsFullSwipe: true) {
                                Button(role: .destructive) {
                                    environment.shopping.delete(id: item.id)
                                } label: {
                                    Label("Supprimer", systemImage: "trash")
                                }
                            }
                    }
                } header: {
                    HStack {
                        Text("Acheté (\(checked.count))")
                            .foregroundStyle(AppTheme.textMuted)
                        Spacer()
                        Button("Vider le panier") {
                            environment.shopping.clearChecked()
                        }
                        .font(.caption.weight(.semibold))
                        .foregroundStyle(AppTheme.error)
                    }
                }
                .listRowBackground(AppTheme.backgroundCard)
            }

            if environment.shopping.items.isEmpty {
                Section {
                    VStack(spacing: 12) {
                        Image(systemName: "cart")
                            .font(.system(size: 44))
                            .foregroundStyle(AppTheme.textMuted)
                        Text("Liste vide")
                            .font(.headline)
                            .foregroundStyle(AppTheme.ivory)
                        Text("Ajoutez des articles pour ne rien oublier lors de vos courses")
                            .font(.footnote)
                            .foregroundStyle(AppTheme.textMuted)
                            .multilineTextAlignment(.center)
                    }
                    .frame(maxWidth: .infinity)
                    .padding(.vertical, 36)
                }
                .listRowBackground(Color.clear)
            }
        }
        .listStyle(.insetGrouped)
        .scrollContentBackground(.hidden)
        .navigationTitle("Courses")
        .navigationBarTitleDisplayMode(.large)
        .purrlyScreenBackground()
    }

    private var addSection: some View {
        Section("Ajouter un article") {
            HStack(spacing: 10) {
                TextField("Nom de l'article", text: $newName)
                    .foregroundStyle(AppTheme.ivory)
                TextField("Qté", text: $newQuantity)
                    .frame(width: 44)
                    .foregroundStyle(AppTheme.ivory)
                    .keyboardType(.numberPad)
                    .multilineTextAlignment(.center)
                Button {
                    addItem()
                } label: {
                    Image(systemName: "plus.circle.fill")
                        .font(.system(size: 24))
                        .foregroundStyle(newName.trimmingCharacters(in: .whitespaces).isEmpty ? AppTheme.textMuted : AppTheme.primary)
                }
                .disabled(newName.trimmingCharacters(in: .whitespaces).isEmpty)
            }

            // Category chips
            ScrollView(.horizontal, showsIndicators: false) {
                HStack(spacing: 8) {
                    ForEach(categoryMeta, id: \.key) { meta in
                        Button {
                            newCategory = meta.key
                        } label: {
                            Label(meta.label, systemImage: meta.symbol)
                                .font(.caption.weight(.semibold))
                                .foregroundStyle(newCategory == meta.key ? meta.color : AppTheme.textMuted)
                                .padding(.horizontal, 10)
                                .padding(.vertical, 6)
                                .background(
                                    newCategory == meta.key
                                        ? meta.color.opacity(0.15)
                                        : AppTheme.backgroundSecondary,
                                    in: Capsule()
                                )
                                .overlay(
                                    Capsule()
                                        .strokeBorder(
                                            newCategory == meta.key ? meta.color.opacity(0.4) : Color.clear,
                                            lineWidth: 1
                                        )
                                )
                        }
                        .buttonStyle(.plain)
                    }
                }
                .padding(.vertical, 4)
            }
        }
        .listRowBackground(AppTheme.backgroundCard)
    }

    private func addItem() {
        let trimmed = newName.trimmingCharacters(in: .whitespaces)
        guard !trimmed.isEmpty else { return }
        let qty = newQuantity.trimmingCharacters(in: .whitespaces).isEmpty ? "1" : newQuantity
        environment.shopping.add(
            ShoppingItem.create(name: trimmed, quantity: qty, category: newCategory)
        )
        newName = ""
        newQuantity = ""
    }
}

private struct ShoppingRow: View {
    let item: ShoppingItem

    private var meta: (label: String, symbol: String, color: Color) {
        categoryMeta.first(where: { $0.key == item.category })
            .map { ($0.label, $0.symbol, $0.color) }
            ?? ("Autre", "circle.grid.2x2", AppTheme.textMuted)
    }

    var body: some View {
        HStack(spacing: 12) {
            Image(systemName: item.isChecked ? "checkmark.circle.fill" : "circle")
                .font(.system(size: 22))
                .foregroundStyle(item.isChecked ? AppTheme.success : AppTheme.textMuted)

            Circle()
                .fill(meta.color)
                .frame(width: 8, height: 8)

            VStack(alignment: .leading, spacing: 2) {
                Text(item.name)
                    .font(.body.weight(.semibold))
                    .foregroundStyle(item.isChecked ? AppTheme.textMuted : AppTheme.ivory)
                    .strikethrough(item.isChecked, color: AppTheme.textMuted)
                if item.quantity != "1" {
                    Text("Qté: \(item.quantity)")
                        .font(.caption)
                        .foregroundStyle(AppTheme.textMuted)
                }
            }

            Spacer()

            Text(meta.label)
                .font(.caption2.weight(.semibold))
                .foregroundStyle(meta.color)
                .padding(.horizontal, 7)
                .padding(.vertical, 3)
                .background(meta.color.opacity(0.15), in: RoundedRectangle(cornerRadius: 6))
        }
        .padding(.vertical, 3)
        .opacity(item.isChecked ? 0.6 : 1)
    }
}
