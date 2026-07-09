import SwiftUI
import MapKit

extension MKMapItem: @retroactive Identifiable {
    public var id: String { self.name ?? self.placemark.title ?? UUID().uuidString }
}

struct VetsView: View {
    @State private var position: MapCameraPosition = .userLocation(fallback: .automatic)
    @State private var results: [MKMapItem] = []
    @State private var selected: MKMapItem?
    @State private var category: VetCategory = .veterinaire

    enum VetCategory: String, CaseIterable {
        case veterinaire = "vétérinaire"
        case clinique    = "clinique vétérinaire"
        case pharmacie   = "pharmacie vétérinaire"

        var label: String {
            switch self {
            case .veterinaire: String(localized: "Vétérinaires")
            case .clinique:    String(localized: "Cliniques")
            case .pharmacie:   String(localized: "Pharmacies")
            }
        }

        var symbol: String {
            switch self {
            case .veterinaire: "stethoscope"
            case .clinique:    "building.2"
            case .pharmacie:   "pills"
            }
        }
    }

    var body: some View {
        Map(position: $position, selection: $selected) {
            UserAnnotation()
            ForEach(results, id: \.self) { item in
                Marker(item.name ?? "Vétérinaire",
                       systemImage: "cross.circle.fill",
                       coordinate: item.placemark.coordinate)
                    .tint(AppTheme.primary)
                    .tag(item)
            }
        }
        .mapControls {
            MapUserLocationButton()
            MapCompass()
        }
        .safeAreaInset(edge: .top) { categoryPicker }
        .sheet(item: $selected) { item in
            VetDetailSheet(item: item)
                .presentationDetents([.medium])
        }
        .task(id: category) { await search() }
        .navigationTitle(String(localized: "vets.title"))
        .purrlyScreenBackground()
    }

    private var categoryPicker: some View {
        ScrollView(.horizontal, showsIndicators: false) {
            HStack(spacing: 10) {
                ForEach(VetCategory.allCases, id: \.self) { cat in
                    Button {
                        category = cat
                    } label: {
                        Label(cat.label, systemImage: cat.symbol)
                            .font(.subheadline.weight(.semibold))
                            .padding(.horizontal, 14)
                            .padding(.vertical, 8)
                            .background(
                                category == cat ? AppTheme.primary : AppTheme.backgroundCard,
                                in: Capsule()
                            )
                            .foregroundStyle(category == cat ? AppTheme.background : AppTheme.textSecondary)
                    }
                }
            }
            .padding(.horizontal, 16)
            .padding(.vertical, 8)
        }
        .background(.ultraThinMaterial)
    }

    private func search() async {
        let request = MKLocalSearch.Request()
        request.naturalLanguageQuery = category.rawValue
        request.resultTypes = .pointOfInterest
        do {
            let response = try await MKLocalSearch(request: request).start()
            results = response.mapItems
        } catch {
            results = []
        }
    }
}
