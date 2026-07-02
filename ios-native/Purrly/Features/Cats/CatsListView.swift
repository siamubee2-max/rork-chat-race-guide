import SwiftUI

struct CatsListView: View {
    @Environment(AppEnvironment.self) private var environment
    @State private var showForm = false

    var body: some View {
        Group {
            if environment.cats.cats.isEmpty {
                empty
            } else {
                list
            }
        }
        // navigationDestination DOIT être sur un conteneur stable, pas dans la List
        // (lazy) — sinon navigation bloquée/instable.
        .navigationDestination(for: CatProfile.self) { cat in
            CatDetailView(cat: cat)
        }
        // Routes des sous-écrans (santé, poids, logs…) — navigation par valeur.
        .navigationDestination(for: CatRoute.self) { route in
            switch route {
            case .health(let c):      CatHealthDashboardView(cat: c)
            case .weightChart(let c): WeightChartView(cat: c)
            case .dailyLogs(let c):   DailyLogsView(cat: c)
            case .recordForm(let c):  RecordFormView(cat: c)
            case .weightForm(let c):  WeightFormView(cat: c)
            }
        }
        .purrlyScreenBackground()
        .navigationTitle(String(localized: "cats.title"))
        .toolbar {
            ToolbarItem(placement: .primaryAction) {
                Button {
                    showForm = true
                } label: {
                    Image(systemName: "plus")
                }
                .accessibilityLabel(String(localized: "cats.add"))
                .accessibilityIdentifier("addCatButton")
            }
        }
        .sheet(isPresented: $showForm) {
            CatFormView(cat: nil)
        }
    }

    private var empty: some View {
        VStack(spacing: 16) {
            Image(systemName: "cat.fill")
                .font(.system(size: 48))
                .foregroundStyle(AppTheme.textMuted)
            Text(String(localized: "cats.empty.title"))
                .font(.title3.weight(.bold))
                .foregroundStyle(AppTheme.ivory)
            Text(String(localized: "cats.empty.body"))
                .multilineTextAlignment(.center)
                .foregroundStyle(AppTheme.textSecondary)
                .padding(.horizontal, 32)
            Button(String(localized: "cats.add")) { showForm = true }
                .buttonStyle(GlassPrimaryButtonStyle())
                .padding(.horizontal, 40)
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity)
    }

    private var list: some View {
        List {
            ForEach(environment.cats.cats) { cat in
                NavigationLink(value: cat) {
                    CatRow(cat: cat, breedName: environment.breeds.breed(id: cat.breedId)?.name)
                }
                .listRowBackground(AppTheme.backgroundCard)
            }
            .onDelete(perform: delete)
        }
        .listStyle(.plain)
        .scrollContentBackground(.hidden)
    }

    private func delete(at offsets: IndexSet) {
        for index in offsets {
            let cat = environment.cats.cats[index]
            CatImageStore.delete(cat.imageUri)
            environment.cats.delete(id: cat.id)
        }
    }
}

private struct CatRow: View {
    let cat: CatProfile
    let breedName: String?

    var body: some View {
        HStack(spacing: 12) {
            ZStack {
                RoundedRectangle(cornerRadius: 14)
                    .fill(AppTheme.backgroundSecondary)
                    .frame(width: 56, height: 56)
                if let photo = CatImageStore.load(cat.imageUri) {
                    Image(uiImage: photo)
                        .resizable()
                        .scaledToFill()
                        .frame(width: 56, height: 56, alignment: .top)
                        .clipShape(RoundedRectangle(cornerRadius: 14))
                } else {
                    Image(systemName: "cat.fill")
                        .foregroundStyle(AppTheme.textMuted)
                }
            }
            VStack(alignment: .leading, spacing: 4) {
                Text(cat.name)
                    .font(.headline)
                    .foregroundStyle(AppTheme.ivory)
                Text(breedName ?? String(localized: "cats.mixed"))
                    .font(.caption)
                    .foregroundStyle(AppTheme.textMuted)
            }
        }
        .padding(.vertical, 4)
    }
}
