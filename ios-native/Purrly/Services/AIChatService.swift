import Foundation

/// Client API tRPC simplifié pour `ai.chat` (backend Expo).
struct AIChatService {
    struct ChatRequest: Encodable {
        let messages: [ChatPayload]
        let systemPrompt: String?
    }

    struct ChatPayload: Encodable {
        let role: String
        let content: String
    }

    struct ChatResponse: Decodable {
        let content: String
    }

    enum ServiceError: LocalizedError {
        case unauthorized
        case invalidResponse
        case server(String)

        var errorDescription: String? {
            switch self {
            case .unauthorized: "Connectez-vous pour utiliser l'assistant."
            case .invalidResponse: String(localized: "Réponse serveur invalide.")
            case .server(let message): message
            }
        }
    }

    func send(
        messages: [ChatMessage],
        systemPrompt: String,
        accessToken: String?
    ) async throws -> String {
        guard let accessToken, !accessToken.isEmpty else {
            throw ServiceError.unauthorized
        }

        var request = URLRequest(url: AppConfiguration.apiBaseURL.appending(path: "/ai-chat"))
        request.httpMethod = "POST"
        request.timeoutInterval = 45
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        request.setValue("Bearer \(accessToken)", forHTTPHeaderField: "Authorization")

        let body = ChatRequest(
            messages: messages.map { ChatPayload(role: $0.role.rawValue, content: $0.content) },
            systemPrompt: systemPrompt
        )
        request.httpBody = try JSONEncoder().encode(body)

        let (data, response) = try await AppHTTP.session.data(for: request)
        guard let http = response as? HTTPURLResponse else { throw ServiceError.invalidResponse }

        if http.statusCode == 401 { throw ServiceError.unauthorized }
        guard (200 ... 299).contains(http.statusCode) else {
            let message = String(data: data, encoding: .utf8) ?? "Erreur \(http.statusCode)"
            throw ServiceError.server(message)
        }

        if let decoded = try? JSONDecoder().decode(ChatResponse.self, from: data) {
            return decoded.content
        }

        // tRPC envelope
        struct TRPCEnvelope: Decodable {
            struct ResultData: Decodable {
                let content: String
            }
            let result: ResultData?
        }
        if let envelope = try? JSONDecoder().decode(TRPCEnvelope.self, from: data),
           let content = envelope.result?.content {
            return content
        }

        throw ServiceError.invalidResponse
    }
}
