import Foundation
import Supabase

@MainActor
final class AuthService: ObservableObject {
    @Published private(set) var currentUser: UserProfile?
    @Published private(set) var isLoading = true
    @Published var lastError: String?

    private var client: SupabaseClient?

    init() {
        if AppConfiguration.isSupabaseConfigured,
           let url = AppConfiguration.supabaseURL,
           let key = AppConfiguration.supabaseAnonKey {
            client = SupabaseClient(supabaseURL: url, supabaseKey: key)
        }
    }

    var isAuthenticated: Bool { currentUser != nil }

    func bootstrap() async {
        defer { isLoading = false }
        guard let client else {
            // Mode démo hors-ligne si Supabase non configuré
            if let email = KeychainStore.read(.accessToken), !email.isEmpty {
                currentUser = UserProfile(
                    id: "local-demo",
                    email: email,
                    name: "Utilisateur",
                    subscriptionTier: .premium,
                    subscriptionExpiry: nil
                )
            }
            return
        }

        do {
            let session = try await client.auth.session
            await loadProfile(userId: session.user.id, email: session.user.email ?? "")
        } catch {
            KeychainStore.clearSession()
            currentUser = nil
        }
    }

    func signIn(email: String, password: String) async -> Bool {
        lastError = nil
        let normalized = email.trimmingCharacters(in: .whitespacesAndNewlines).lowercased()

        guard let client else {
            // Auth locale de secours pour développement
            try? KeychainStore.save(normalized, for: .accessToken)
            currentUser = UserProfile(
                id: "local-\(normalized)",
                email: normalized,
                name: normalized.components(separatedBy: "@").first ?? "Utilisateur",
                subscriptionTier: AppConfiguration.vipEmails.contains(normalized) ? .pro : .premium,
                subscriptionExpiry: nil
            )
            return true
        }

        do {
            let session = try await client.auth.signIn(email: normalized, password: password)
            try KeychainStore.save(session.accessToken, for: .accessToken)
            await loadProfile(userId: session.user.id, email: normalized)
            return currentUser != nil
        } catch {
            lastError = error.localizedDescription
            return false
        }
    }

    func signUp(email: String, password: String, name: String) async -> Bool {
        lastError = nil
        guard let client else {
            lastError = "Inscription indisponible sans Supabase configuré."
            return false
        }
        let normalized = email.trimmingCharacters(in: .whitespacesAndNewlines).lowercased()
        do {
            _ = try await client.auth.signUp(email: normalized, password: password)
            return await signIn(email: normalized, password: password)
        } catch {
            lastError = error.localizedDescription
            return false
        }
    }

    func signOut() async {
        if let client {
            try? await client.auth.signOut()
        }
        KeychainStore.clearSession()
        currentUser = nil
    }

    private func loadProfile(userId: UUID, email: String) async {
        guard let client else { return }
        let isVIP = AppConfiguration.vipEmails.contains(email.lowercased())

        if isVIP {
            _ = try? await client
                .from("profiles")
                .update(["subscription_tier": "pro", "subscription_expiry": "2125-01-01T00:00:00Z"])
                .eq("id", value: userId.uuidString)
                .execute()
        }

        do {
            let rows: [ProfileRow] = try await client
                .from("profiles")
                .select()
                .eq("id", value: userId.uuidString)
                .execute()
                .value

            guard let row = rows.first else {
                currentUser = UserProfile(
                    id: userId.uuidString,
                    email: email,
                    name: email.components(separatedBy: "@").first ?? "",
                    subscriptionTier: isVIP ? .pro : .free,
                    subscriptionExpiry: nil
                )
                return
            }
            currentUser = UserProfile(
                id: row.id,
                email: row.email,
                name: row.name ?? "",
                subscriptionTier: SubscriptionTier(rawValue: row.subscription_tier ?? "free") ?? .free,
                subscriptionExpiry: row.subscription_expiry.flatMap { ISO8601DateFormatter().date(from: $0) }
            )
        } catch {
            currentUser = UserProfile(
                id: userId.uuidString,
                email: email,
                name: email.components(separatedBy: "@").first ?? "",
                subscriptionTier: isVIP ? .pro : .free,
                subscriptionExpiry: nil
            )
        }
    }

    private struct ProfileRow: Decodable {
        let id: String
        let email: String
        let name: String?
        let subscription_tier: String?
        let subscription_expiry: String?
    }
}
