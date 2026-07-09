import Foundation
import UIKit

/// Identifies a cat breed from JPEG image data using the backend AI endpoint.
@MainActor
final class BreedScanService {

    // MARK: - Errors

    enum ScanError: LocalizedError {
        case noData
        case serverError(String)
        case unauthorized

        var errorDescription: String? {
            switch self {
            case .noData:           "Impossible d'analyser l'image."
            case .serverError(let m): m
            case .unauthorized:    "Connectez-vous pour utiliser le scanner."
            }
        }
    }

    // MARK: - Result model

    struct ScanResult: Codable {
        let topBreed: String
        let confidence: String  // "Très probable" | "Probable" | "Possible"
        let why: String
        let alternatives: [String]
    }

    // MARK: - Identify

    func identify(imageData: Data, accessToken: String?) async throws -> ScanResult {
        guard let token = accessToken, !token.isEmpty else {
            throw ScanError.unauthorized
        }

        // Compress to JPEG at 0.4 quality (mirrors Expo camera.tsx quality:0.4)
        let jpeg: Data
        if let uiImage = UIImage(data: imageData),
           let compressed = uiImage.jpegData(compressionQuality: 0.4) {
            jpeg = compressed
        } else {
            jpeg = imageData
        }
        let base64 = jpeg.base64EncodedString()

        // Edge Function breed-scan — sends base64 image directly to GPT-4o Vision
        var request = URLRequest(url: AppConfiguration.apiBaseURL.appending(path: "/breed-scan"))
        request.httpMethod = "POST"
        request.timeoutInterval = 45
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        request.setValue("Bearer \(token)", forHTTPHeaderField: "Authorization")

        struct ScanRequest: Encodable { let imageBase64: String }
        request.httpBody = try JSONEncoder().encode(ScanRequest(imageBase64: base64))

        let (data, response) = try await AppHTTP.session.data(for: request)
        guard let http = response as? HTTPURLResponse else {
            throw ScanError.serverError(String(localized: "Réponse réseau invalide."))
        }

        if http.statusCode == 401 { throw ScanError.unauthorized }
        guard (200...299).contains(http.statusCode) else {
            throw ScanError.serverError(
                String(data: data, encoding: .utf8) ?? "Erreur serveur \(http.statusCode)"
            )
        }

        // 1. Direct decode
        if let result = try? JSONDecoder().decode(ScanResult.self, from: data) { return result }

        // 2. AIChatService envelope: { content: "<json string>" }
        struct ContentEnvelope: Decodable { let content: String }
        if let envelope = try? JSONDecoder().decode(ContentEnvelope.self, from: data),
           let jsonData = extractJSON(from: envelope.content),
           let result = try? JSONDecoder().decode(ScanResult.self, from: jsonData) {
            return result
        }

        // 3. tRPC envelope: { result: { content: "<json string>" } }
        struct TRPCEnvelope: Decodable {
            struct R: Decodable { let content: String }
            let result: R?
        }
        if let envelope = try? JSONDecoder().decode(TRPCEnvelope.self, from: data),
           let content = envelope.result?.content,
           let jsonData = extractJSON(from: content),
           let result = try? JSONDecoder().decode(ScanResult.self, from: jsonData) {
            return result
        }

        throw ScanError.noData
    }

    // MARK: - Helpers

    /// Extracts the first JSON object `{...}` from a string that may contain prose.
    private func extractJSON(from text: String) -> Data? {
        // Try direct parse first
        if let direct = text.data(using: .utf8),
           (try? JSONDecoder().decode(ScanResult.self, from: direct)) != nil {
            return direct
        }
        // Find first `{` … last `}`
        guard let start = text.firstIndex(of: "{"),
              let end = text.lastIndex(of: "}") else { return nil }
        let slice = String(text[start...end])
        return slice.data(using: .utf8)
    }
}
