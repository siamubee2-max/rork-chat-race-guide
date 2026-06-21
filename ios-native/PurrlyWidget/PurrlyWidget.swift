import WidgetKit
import SwiftUI

// MARK: - Palette (autonome : l'extension ne partage pas AppTheme)

private enum WidgetPalette {
    static let background = Color(red: 0.047, green: 0.039, blue: 0.035) // #0C0A09
    static let gold = Color(red: 0.83, green: 0.69, blue: 0.42)
    static let ivory = Color(red: 0.96, green: 0.95, blue: 0.93)
    static let muted = Color(red: 0.47, green: 0.44, blue: 0.40)
}

// MARK: - Timeline

struct PurrlyEntry: TimelineEntry {
    let date: Date
    let snapshot: PurrlyWidgetSnapshot
}

struct PurrlyProvider: TimelineProvider {
    func placeholder(in context: Context) -> PurrlyEntry {
        PurrlyEntry(date: Date(), snapshot: .placeholder)
    }

    func getSnapshot(in context: Context, completion: @escaping (PurrlyEntry) -> Void) {
        completion(PurrlyEntry(date: Date(), snapshot: PurrlyWidgetStore.load()))
    }

    func getTimeline(in context: Context, completion: @escaping (Timeline<PurrlyEntry>) -> Void) {
        let entry = PurrlyEntry(date: Date(), snapshot: PurrlyWidgetStore.load())
        // Les rappels/données changent rarement : rafraîchissement horaire.
        let next = Calendar.current.date(byAdding: .hour, value: 1, to: Date())
            ?? Date().addingTimeInterval(3600)
        completion(Timeline(entries: [entry], policy: .after(next)))
    }
}

// MARK: - Vues

struct PurrlyWidgetEntryView: View {
    @Environment(\.widgetFamily) private var family
    let entry: PurrlyEntry

    var body: some View {
        ZStack(alignment: .leading) {
            VStack(alignment: .leading, spacing: family == .systemSmall ? 6 : 10) {
                HStack(spacing: 6) {
                    Image(systemName: "cat.fill")
                        .foregroundStyle(WidgetPalette.gold)
                    Text("Purrly")
                        .font(.caption.weight(.heavy))
                        .foregroundStyle(WidgetPalette.gold)
                }

                Text(entry.snapshot.headline)
                    .font(family == .systemSmall ? .headline : .title3.weight(.bold))
                    .foregroundStyle(WidgetPalette.ivory)
                    .lineLimit(2)

                if let title = entry.snapshot.nextReminderTitle, let date = entry.snapshot.nextReminderDate {
                    Label {
                        Text("\(title) · \(date, format: .dateTime.day().month())")
                            .lineLimit(1)
                    } icon: {
                        Image(systemName: "bell.fill")
                    }
                    .font(.caption2)
                    .foregroundStyle(WidgetPalette.muted)
                } else {
                    Text(entry.snapshot.subtitle)
                        .font(.caption2)
                        .foregroundStyle(WidgetPalette.muted)
                        .lineLimit(2)
                }

                Spacer(minLength: 0)

                Label("Scanner une race", systemImage: "camera.viewfinder")
                    .font(.caption2.weight(.semibold))
                    .foregroundStyle(WidgetPalette.background)
                    .padding(.horizontal, 10)
                    .padding(.vertical, 5)
                    .background(WidgetPalette.gold, in: Capsule())
            }
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .topLeading)
        .containerBackground(WidgetPalette.background, for: .widget)
        .widgetURL(URL(string: "purrly://scan"))
    }
}

// MARK: - Widget

struct PurrlyWidget: Widget {
    let kind = "PurrlyWidget"

    var body: some WidgetConfiguration {
        StaticConfiguration(kind: kind, provider: PurrlyProvider()) { entry in
            PurrlyWidgetEntryView(entry: entry)
        }
        .configurationDisplayName("Purrly")
        .description("Votre chat en un coup d'œil — prochain rappel et scan rapide.")
        .supportedFamilies([.systemSmall, .systemMedium])
    }
}
