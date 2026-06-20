import Foundation
import UIKit

/// Client pour l'API kie.ai — génération d'images IA (ajout d'accessoires sur photos de chats).
/// Doc: https://docs.kie.ai/
///
/// SECURITY TODO: Migrate to the backend proxy (kie.generate tRPC mutation) so the
/// KIE_API_KEY is served from the server environment instead of the app bundle.
/// Until then, AppConfiguration.kieApiKey must NOT be committed (gitignored via Secrets.xcconfig).
@MainActor
final class KieAIService {

    // MARK: - Types

    enum KieError: LocalizedError {
        case notConfigured
        case uploadFailed
        case taskFailed(String)
        case timeout
        case invalidResponse

        var errorDescription: String? {
            switch self {
            case .notConfigured:    return "Clé API kie.ai non configurée. Ajoute KIE_API_KEY dans Secrets.xcconfig."
            case .uploadFailed:     return "Échec de l'upload de l'image."
            case .taskFailed(let m): return "kie.ai : \(m)"
            case .timeout:          return "Délai dépassé — réessaie."
            case .invalidResponse:  return "Réponse inattendue de kie.ai."
            }
        }
    }

    /// Preset d'accessoire — chaque preset a un prompt optimisé
    enum AccessoryPreset: String, CaseIterable, Identifiable {
        case cowboyHat    = "cowboy_hat"
        case crown        = "crown"
        case witchHat     = "witch_hat"
        case sunglasses   = "sunglasses"
        case partyHat     = "party_hat"
        case bowtie       = "bowtie"
        case flowerWreath = "flower_wreath"
        case superhero    = "superhero"
        case pirate       = "pirate"
        case princess     = "princess"

        var id: String { rawValue }

        var label: String {
            switch self {
            case .cowboyHat:    return "Chapeau cowboy"
            case .crown:        return "Couronne royale"
            case .witchHat:     return "Chapeau de sorcière"
            case .sunglasses:   return "Lunettes de soleil"
            case .partyHat:     return "Chapeau de fête"
            case .bowtie:       return "Nœud papillon"
            case .flowerWreath: return "Couronne de fleurs"
            case .superhero:    return "Super-héros"
            case .pirate:       return "Pirate"
            case .princess:     return "Princesse"
            }
        }

        var emoji: String {
            switch self {
            case .cowboyHat:    return "🤠"
            case .crown:        return "👑"
            case .witchHat:     return "🧙"
            case .sunglasses:   return "🕶️"
            case .partyHat:     return "🎉"
            case .bowtie:       return "🎀"
            case .flowerWreath: return "🌸"
            case .superhero:    return "🦸"
            case .pirate:       return "☠️"
            case .princess:     return "👸"
            }
        }

        /// Prompt optimisé pour GPT-4o image edit
        var prompt: String {
            switch self {
            case .cowboyHat:
                return "Add a realistic brown cowboy hat on top of this cat's head. Keep the cat exactly as-is, only add the hat. Photorealistic, fun."
            case .crown:
                return "Place a golden royal crown on this cat's head. The cat stays the same, only add the crown. Photorealistic, regal look."
            case .witchHat:
                return "Add a classic black witch hat on this cat's head. Keep the cat unchanged, only add the hat. Photorealistic, Halloween style."
            case .sunglasses:
                return "Put stylish sunglasses on this cat's face over its eyes. The cat stays the same, only add the sunglasses. Photorealistic, cool look."
            case .partyHat:
                return "Place a colorful party cone hat on this cat's head. Keep the cat unchanged, only add the party hat. Fun, photorealistic."
            case .bowtie:
                return "Add a cute bow tie around this cat's neck. Keep the cat unchanged, only add the bow tie. Elegant, photorealistic."
            case .flowerWreath:
                return "Place a beautiful flower wreath crown on this cat's head. Keep the cat unchanged, only add the flowers. Photorealistic, natural look."
            case .superhero:
                return "Dress this cat as a superhero with a small cape and mask. Keep the cat's face visible. Fun, photorealistic superhero costume."
            case .pirate:
                return "Add a pirate hat and eyepatch to this cat. Keep the cat unchanged. Fun photorealistic pirate style."
            case .princess:
                return "Add a princess tiara and a small sparkly collar to this cat. Keep the cat unchanged. Cute, photorealistic princess look."
            }
        }
    }

    // MARK: - Constants

    private static let uploadURL = URL(string: "https://kieai.redpandaai.co/api/file-stream-upload")!
    private static let createTaskURL = URL(string: "https://api.kie.ai/api/v1/jobs/createTask")!
    private static let recordInfoBase = "https://api.kie.ai/api/v1/jobs/recordInfo"

    // MARK: - Public API

    /// Génère une photo de chat avec un accessoire IA.
    /// - Parameters:
    ///   - image: Photo originale du chat
    ///   - preset: Accessoire à ajouter
    ///   - progressHandler: Appelé avec 0.0→1.0 pendant le polling
    func generate(
        image: UIImage,
        preset: AccessoryPreset,
        progressHandler: ((Double) -> Void)? = nil
    ) async throws -> UIImage {
        guard let apiKey = AppConfiguration.kieApiKey else {
            throw KieError.notConfigured
        }

        progressHandler?(0.1)

        // 1. Upload the image
        let imageURL = try await upload(image: image, apiKey: apiKey)
        progressHandler?(0.25)

        // 2. Submit task
        let taskId = try await createTask(imageURL: imageURL, preset: preset, apiKey: apiKey)
        progressHandler?(0.35)

        // 3. Poll until done
        let resultURL = try await pollTask(taskId: taskId, apiKey: apiKey, progressHandler: progressHandler)
        progressHandler?(0.95)

        // 4. Download result
        let resultImage = try await downloadImage(from: resultURL)
        progressHandler?(1.0)

        return resultImage
    }

    // MARK: - Private steps

    private func upload(image: UIImage, apiKey: String) async throws -> String {
        guard let jpeg = image.jpegData(compressionQuality: 0.85) else {
            throw KieError.uploadFailed
        }

        var request = URLRequest(url: Self.uploadURL)
        request.httpMethod = "POST"
        request.timeoutInterval = 30
        request.setValue("Bearer \(apiKey)", forHTTPHeaderField: "Authorization")

        let boundary = UUID().uuidString
        request.setValue("multipart/form-data; boundary=\(boundary)", forHTTPHeaderField: "Content-Type")

        var body = Data()
        body.append("--\(boundary)\r\n".data(using: .utf8)!)
        body.append("Content-Disposition: form-data; name=\"file\"; filename=\"cat.jpg\"\r\n".data(using: .utf8)!)
        body.append("Content-Type: image/jpeg\r\n\r\n".data(using: .utf8)!)
        body.append(jpeg)
        body.append("\r\n--\(boundary)--\r\n".data(using: .utf8)!)
        request.httpBody = body

        let (data, response) = try await URLSession.shared.data(for: request)
        guard let http = response as? HTTPURLResponse, (200...299).contains(http.statusCode) else {
            throw KieError.uploadFailed
        }

        struct UploadResponse: Decodable {
            let url: String?
            let fileUrl: String?
            let data: UploadData?
            struct UploadData: Decodable { let url: String? }
        }
        if let parsed = try? JSONDecoder().decode(UploadResponse.self, from: data) {
            if let url = parsed.url ?? parsed.fileUrl ?? parsed.data?.url {
                return url
            }
        }
        // Fallback: try to extract URL from raw JSON
        if let json = try? JSONSerialization.jsonObject(with: data) as? [String: Any] {
            if let url = json["url"] as? String { return url }
            if let url = json["fileUrl"] as? String { return url }
        }
        throw KieError.uploadFailed
    }

    private func createTask(imageURL: String, preset: AccessoryPreset, apiKey: String) async throws -> String {
        var request = URLRequest(url: Self.createTaskURL)
        request.httpMethod = "POST"
        request.timeoutInterval = 15
        request.setValue("Bearer \(apiKey)", forHTTPHeaderField: "Authorization")
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")

        // Use GPT-4o image model for image editing
        let payload: [String: Any] = [
            "model": "gpt-4o-image",
            "input": [
                "prompt": preset.prompt,
                "image": imageURL,
                "action": "edit"
            ]
        ]
        request.httpBody = try JSONSerialization.data(withJSONObject: payload)

        let (data, response) = try await URLSession.shared.data(for: request)
        guard let http = response as? HTTPURLResponse, (200...299).contains(http.statusCode) else {
            throw KieError.taskFailed("HTTP \((response as? HTTPURLResponse)?.statusCode ?? 0)")
        }

        struct TaskResponse: Decodable {
            let body: Body?
            struct Body: Decodable { let taskId: String? }
        }
        if let parsed = try? JSONDecoder().decode(TaskResponse.self, from: data),
           let taskId = parsed.body?.taskId {
            return taskId
        }
        // Fallback
        if let json = try? JSONSerialization.jsonObject(with: data) as? [String: Any],
           let body = json["body"] as? [String: Any],
           let taskId = body["taskId"] as? String {
            return taskId
        }
        throw KieError.invalidResponse
    }

    private func pollTask(
        taskId: String,
        apiKey: String,
        progressHandler: ((Double) -> Void)?
    ) async throws -> URL {
        guard let url = URL(string: "\(Self.recordInfoBase)?taskId=\(taskId)") else {
            throw KieError.invalidResponse
        }
        var request = URLRequest(url: url)
        request.timeoutInterval = 10
        request.setValue("Bearer \(apiKey)", forHTTPHeaderField: "Authorization")

        let maxAttempts = 60  // 60 × 3s = 3 minutes max
        var attempt = 0

        while attempt < maxAttempts {
            try await Task.sleep(nanoseconds: 3_000_000_000)  // 3 seconds
            attempt += 1
            progressHandler?(0.35 + 0.55 * (Double(attempt) / Double(maxAttempts)))

            let (data, _) = try await URLSession.shared.data(for: request)

            struct PollResponse: Decodable {
                let body: Body?
                struct Body: Decodable {
                    let state: String?
                    let result: Result?
                    struct Result: Decodable {
                        let url: String?
                        let imageUrl: String?
                        let images: [ImageItem]?
                        struct ImageItem: Decodable { let url: String? }
                    }
                }
            }

            if let parsed = try? JSONDecoder().decode(PollResponse.self, from: data),
               let body = parsed.body {
                let state = body.state ?? ""
                if state == "success" || state == "completed" {
                    // Extract result URL
                    if let rawURL = body.result?.url ?? body.result?.imageUrl
                        ?? body.result?.images?.first?.url,
                       let resultURL = URL(string: rawURL) {
                        return resultURL
                    }
                    throw KieError.invalidResponse
                } else if state == "fail" || state == "failed" || state == "error" {
                    throw KieError.taskFailed("Génération échouée.")
                }
                // "waiting" | "generating" → continue polling
            }
        }
        throw KieError.timeout
    }

    private func downloadImage(from url: URL) async throws -> UIImage {
        var request = URLRequest(url: url)
        request.timeoutInterval = 30
        let (data, _) = try await URLSession.shared.data(for: request)
        guard let image = UIImage(data: data) else {
            throw KieError.invalidResponse
        }
        return image
    }
}
