import SwiftUI

struct EventDetailView: View {
    let event: CommunityEvent
    @Environment(AppEnvironment.self) private var environment
    @State private var isAttending = false

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 20) {
                // Header card
                GlassChrome.card(tint: AppTheme.primary.opacity(0.1)) {
                    VStack(alignment: .leading, spacing: 12) {
                        HStack(spacing: 12) {
                            Text(eventTypeEmoji(event.type))
                                .font(.system(size: 36))
                            VStack(alignment: .leading, spacing: 4) {
                                Text(event.title)
                                    .font(.title3.weight(.bold))
                                    .foregroundStyle(AppTheme.ivory)
                                Text(eventTypeLabel(event.type))
                                    .font(.caption.weight(.semibold))
                                    .foregroundStyle(AppTheme.primary)
                                    .padding(.horizontal, 8)
                                    .padding(.vertical, 3)
                                    .background(AppTheme.primary.opacity(0.15), in: Capsule())
                            }
                            Spacer()
                        }
                        if !event.description.isEmpty {
                            Text(event.description)
                                .font(.subheadline)
                                .foregroundStyle(AppTheme.textSecondary)
                        }
                    }
                }

                // Details card
                GlassChrome.card {
                    VStack(spacing: 12) {
                        detailRow("calendar", "Date", "\(event.date) à \(event.time)")
                        detailRow("mappin", "Lieu", event.location)
                        if !event.address.isEmpty {
                            detailRow("map", "Adresse", event.address)
                        }
                        if !event.price.isEmpty {
                            detailRow("eurosign.circle", "Prix", "\(event.price) €")
                        } else {
                            detailRow("eurosign.circle", "Prix", "Gratuit")
                        }
                        detailRow("person.2", "Participants",
                                  "\(event.attendees.count)/\(event.maxAttendees)")
                    }
                }

                // Attend button
                Button {
                    isAttending.toggle()
                } label: {
                    Label(
                        isAttending ? "✓ Je participe" : "Participer",
                        systemImage: isAttending ? "checkmark.circle.fill" : "plus.circle"
                    )
                    .frame(maxWidth: .infinity, minHeight: AppTheme.minTouch)
                }
                .buttonStyle(GlassPrimaryButtonStyle())
                .accessibilityLabel(isAttending ? "Se désinscrire de l'événement" : "Participer à l'événement")
            }
            .padding(16)
        }
        .navigationTitle(event.title)
        .navigationBarTitleDisplayMode(.inline)
        .purrlyScreenBackground()
    }

    // MARK: - Sub-views

    private func detailRow(_ icon: String, _ label: String, _ value: String) -> some View {
        HStack(spacing: 12) {
            Image(systemName: icon)
                .foregroundStyle(AppTheme.primary)
                .frame(width: 20)
            Text(label)
                .foregroundStyle(AppTheme.textMuted)
                .font(.subheadline)
            Spacer()
            Text(value)
                .foregroundStyle(AppTheme.ivory)
                .font(.subheadline.weight(.semibold))
                .multilineTextAlignment(.trailing)
        }
    }

    // MARK: - Helpers

    private func eventTypeEmoji(_ type: String) -> String {
        switch type {
        case "meetup":   return "🐱"
        case "adoption": return "🏠"
        case "show":     return "🏆"
        case "workshop": return "📚"
        case "charity":  return "❤️"
        default:         return "📅"
        }
    }

    private func eventTypeLabel(_ type: String) -> String {
        switch type {
        case "meetup":   return "Rencontre"
        case "adoption": return "Adoption"
        case "show":     return "Exposition"
        case "workshop": return "Atelier"
        case "charity":  return "Caritatif"
        default:         return "Événement"
        }
    }
}
