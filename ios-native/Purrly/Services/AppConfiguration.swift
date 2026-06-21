import Foundation

/// Configuration chargée depuis Secrets.xcconfig → Info.plist (jamais de secrets en dur).
enum AppConfiguration {
    static var supabaseURL: URL? {
        guard let raw = Bundle.main.object(forInfoDictionaryKey: "SUPABASE_URL") as? String,
              !raw.isEmpty,
              !raw.contains("placeholder"),
              let url = URL(string: raw) else { return nil }
        return url
    }

    static var supabaseAnonKey: String? {
        guard let key = Bundle.main.object(forInfoDictionaryKey: "SUPABASE_ANON_KEY") as? String,
              !key.isEmpty,
              !key.contains("placeholder") else { return nil }
        return key
    }

    static var apiBaseURL: URL {
        let raw = Bundle.main.object(forInfoDictionaryKey: "RORK_API_BASE_URL") as? String
            ?? "http://localhost:3000"
        return URL(string: raw) ?? URL(string: "http://localhost:3000")!
    }

    static var vipEmails: Set<String> {
        let raw = Bundle.main.object(forInfoDictionaryKey: "VIP_EMAILS") as? String ?? ""
        return Set(
            raw.split(separator: ",")
                .map { $0.trimmingCharacters(in: .whitespacesAndNewlines).lowercased() }
                .filter { !$0.isEmpty }
        )
    }

    static var demoEmail: String {
        (Bundle.main.object(forInfoDictionaryKey: "DEMO_EMAIL") as? String) ?? "demo@purrly.app"
    }

    static var isSupabaseConfigured: Bool {
        supabaseURL != nil && supabaseAnonKey != nil
    }

    static var kieApiKey: String? {
        guard let key = Bundle.main.object(forInfoDictionaryKey: "KIE_API_KEY") as? String,
              !key.isEmpty,
              key != "your_kie_api_key_here" else { return nil }
        return key
    }

    // Proxy backend disponible dès qu'on a une URL d'API — la clé reste côté serveur
    static var isKieConfigured: Bool { true }

    /// Clé SDK publique iOS RevenueCat (préfixe `appl_`). Sûre côté client.
    static var revenueCatIOSKey: String? {
        guard let key = Bundle.main.object(forInfoDictionaryKey: "REVENUECAT_IOS_API_KEY") as? String,
              !key.isEmpty,
              key.hasPrefix("appl_") else { return nil }
        return key
    }

    static var isRevenueCatConfigured: Bool { revenueCatIOSKey != nil }
}
