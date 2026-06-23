import Foundation
import Supabase

@Observable
@MainActor
final class AuthService{
    private(set) var currentUser: UserProfile?
    private(set) var isLoading = true
    var lastError: String?

    private var client: SupabaseClient?

    init() {
        if AppConfiguration.isSupabaseConfigured,
           let url = AppConfiguration.supabaseURL,
           let key = AppConfiguration.supabaseAnonKey {
            client = SupabaseClient(supabaseURL: url, supabaseKey: key)
        }
    }

    var isAuthenticated: Bool { currentUser != nil }

    /// Hook réservé aux tests UI (lancé via l'argument `-uiTesting`).
    /// Place l'app dans un état connecté déterministe, sans réseau.
    func enterUITestMode() {
        // Token factice : les services réseau exigent un accessToken non vide
        // (le stub StubURLProtocol répond sans le valider).
        try? KeychainStore.save("uitest-token", for: .accessToken)
        currentUser = UserProfile(
            id: "uitest-user",
            email: "uitest@purrly.app",
            name: "UITest",
            subscriptionTier: .pro,
            subscriptionExpiry: nil
        )
        isLoading = false
    }

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
            // Ne PAS détruire la session sur une erreur réseau transitoire :
            // un simple hoquet déconnecterait un utilisateur parfaitement valide.
            // On n'efface le keychain que pour une vraie erreur d'auth.
            if error is URLError {
                lastError = "Connexion impossible — réessayez."
                // currentUser reste nil pour cette session, mais les tokens sont
                // préservés : un relancement réseau OK ré-authentifiera.
            } else {
                KeychainStore.clearSession()
                currentUser = nil
            }
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
                subscriptionTier: .premium,   // démo hors-ligne uniquement (Supabase non configuré)
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
            // Mode démo hors-ligne — même comportement que signIn
            let normalized = email.trimmingCharacters(in: .whitespacesAndNewlines).lowercased()
            try? KeychainStore.save(normalized, for: .accessToken)
            currentUser = UserProfile(
                id: "local-\(normalized)",
                email: normalized,
                name: name.isEmpty ? normalized.components(separatedBy: "@").first ?? "Utilisateur" : name,
                subscriptionTier: .free,
                subscriptionExpiry: nil
            )
            return true
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

    func sendPasswordReset(email: String) async throws {
        guard let client else {
            // Demo mode: simulate success
            return
        }
        try await client.auth.resetPasswordForEmail(email)
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
        // L'abonnement (tier/expiry) est décidé EXCLUSIVEMENT côté serveur
        // (webhook RevenueCat → table `profiles`). Le client ne l'écrit jamais.
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
                    subscriptionTier: .free,
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
                subscriptionTier: .free,
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
