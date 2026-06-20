import Foundation
import UIKit

/// Proxy vers l'Edge Function Supabase `kie-generate` — la clé KIE ne quitte jamais le serveur.
@MainActor
struct KieProxyService {

    enum ServiceError: LocalizedError {
        case unauthorized
        case rateLimited
        case serverError(String)
        case invalidResponse
        case downloadFailed

        var errorDescription: String? {
            switch self {
            case .unauthorized:         return "Connectez-vous pour utiliser IA Booth."
            case .rateLimited:          return "Trop de requêtes — réessaie dans une minute."
            case .serverError(let msg): return "Erreur serveur : \(msg)"
            case .invalidResponse:      return "Réponse serveur inattendue."
            case .downloadFailed:       return "Impossible de télécharger l'image générée."
            }
        }
    }

    /// Génère une photo de chat avec accessoire via le proxy backend.
    func generate(
        image: UIImage,
        preset: KieAIService.AccessoryPreset,
        accessToken: String,
        progressHandler: ((Double) -> Void)? = nil
    ) async throws -> UIImage {
        guard let jpeg = image.jpegData(compressionQuality: 0.85) else {
            throw ServiceError.invalidResponse
        }
        progressHandler?(0.1)

        let resultUrl = try await callProxy(
            imageBase64: jpeg.base64EncodedString(),
            preset: preset.rawValue,
            accessToken: accessToken
        )
        progressHandler?(0.95)

        let result = try await downloadImage(from: resultUrl)
        progressHandler?(1.0)
        return result
    }

    // MARK: - Private

    private func callProxy(
        imageBase64: String,
        preset: String,
        accessToken: String
    ) async throws -> URL {
        let url = AppConfiguration.apiBaseURL.appending(path: "/kie-generate")

        var request = URLRequest(url: url)
        request.httpMethod = "POST"
        request.timeoutInterval = 200  // génération kie.ai ≤ 3 min côté serveur
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        request.setValue("Bearer \(accessToken)", forHTTPHeaderField: "Authorization")

        // Edge Function : JSON simple {"imageBase64": ..., "preset": ...}
        let payload: [String: Any] = ["imageBase64": imageBase64, "preset": preset]
        request.httpBody = try JSONSerialization.data(withJSONObject: payload)

        let (data, response) = try await URLSession.shared.data(for: request)
        guard let http = response as? HTTPURLResponse else {
            throw ServiceError.invalidResponse
        }

        switch http.statusCode {
        case 200...299: break
        case 401: throw ServiceError.unauthorized
        case 429: throw ServiceError.rateLimited
        default:
            let msg = String(data: data, encoding: .utf8) ?? "HTTP \(http.statusCode)"
            throw ServiceError.serverError(msg)
        }

        // Réponse Edge Function : {"resultUrl":"..."}
        struct ProxyResponse: Decodable { let resultUrl: String }
        if let parsed = try? JSONDecoder().decode(ProxyResponse.self, from: data),
           let resultUrl = URL(string: parsed.resultUrl) {
            return resultUrl
        }
        throw ServiceError.invalidResponse
    }

    private func downloadImage(from url: URL) async throws -> UIImage {
        var request = URLRequest(url: url)
        request.timeoutInterval = 30
        let (data, _) = try await URLSession.shared.data(for: request)
        guard let image = UIImage(data: data) else {
            throw ServiceError.downloadFailed
        }
        return image
    }
}
