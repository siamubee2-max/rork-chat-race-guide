import Foundation
import UIKit

/// Identifies a cat breed via the tRPC `ai.breedIdentify` proxy (GPT-4o Vision, server-side key).
@MainActor
final class BreedScanService {

    // MARK: - Errors

    enum ScanError: LocalizedError {
        case noData
        case serverError(String)
        case unauthorized

        var errorDescription: String? {
            switch self {
            case .noData:               "Impossible d'analyser l'image."
            case .serverError(let m):   m
            case .unauthorized:         "Connectez-vous pour utiliser le scanner."
            }
        }
    }

    // MARK: - Result model

    struct ScanResult: Codable {
        let topBreed: String
        let confidence: String      // "Très probable" | "Probable" | "Possible"
        let why: String
        let alternatives: [String]  // breed characteristics shown as secondary info
    }

    // MARK: - Identify

    func identify(imageData: Data, accessToken: String?) async throws -> ScanResult {
        guard let token = accessToken, !token.isEmpty else {
            throw ScanError.unauthorized
        }

        // Compress to JPEG (mirrors Expo camera.tsx quality:0.4)
        let jpeg: Data
        if let uiImage = UIImage(data: imageData),
           let compressed = uiImage.jpegData(compressionQuality: 0.4) {
            jpeg = compressed
        } else {
            jpeg = imageData
        }

        let url = AppConfiguration.apiBaseURL.appending(path: "/trpc/ai.breedIdentify")
        var request = URLRequest(url: url)
        request.httpMethod = "POST"
        request.timeoutInterval = 45
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        request.setValue("Bearer \(token)", forHTTPHeaderField: "Authorization")

        // tRPC v10 + superjson : {"json": <input>}
        let payload: [String: Any] = ["json": ["imageBase64": jpeg.base64EncodedString(), "language": "fr"]]
        request.httpBody = try JSONSerialization.data(withJSONObject: payload)

        let (data, response) = try await URLSession.shared.data(for: request)
        guard let http = response as? HTTPURLResponse else {
            throw ScanError.serverError("Réponse réseau invalide.")
        }

        if http.statusCode == 401 { throw ScanError.unauthorized }
        guard (200...299).contains(http.statusCode) else {
            throw ScanError.serverError(
                String(data: data, encoding: .utf8) ?? "Erreur serveur \(http.statusCode)"
            )
        }

        return try decodeTRPCResponse(data)
    }

    // MARK: - Private

    private func decodeTRPCResponse(_ data: Data) throws -> ScanResult {
        // tRPC v10 + superjson envelope: {"result":{"data":{"json":{...}}}}
        struct Output: Decodable {
            let breed: String
            let confidence: String          // "high" | "medium" | "low"
            let characteristics: [String]?  // breed traits used as secondary info
            let description: String?
        }
        struct DataWrapper: Decodable { let json: Output }
        struct ResultWrapper: Decodable { let data: DataWrapper }
        struct TRPCResponse: Decodable { let result: ResultWrapper }

        guard let parsed = try? JSONDecoder().decode(TRPCResponse.self, from: data) else {
            throw ScanError.noData
        }

        let out = parsed.result.data.json

        let confidenceLabel: String
        switch out.confidence {
        case "high":    confidenceLabel = "Très probable"
        case "medium":  confidenceLabel = "Probable"
        default:        confidenceLabel = "Possible"
        }

        return ScanResult(
            topBreed: out.breed,
            confidence: confidenceLabel,
            why: out.description ?? "",
            alternatives: out.characteristics ?? []
        )
    }
}
