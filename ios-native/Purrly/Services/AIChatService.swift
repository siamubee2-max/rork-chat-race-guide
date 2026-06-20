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
            case .invalidResponse: "Réponse serveur invalide."
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

        // tRPC v10 + superjson : /trpc/ai.chat
        let url = AppConfiguration.apiBaseURL.appending(path: "/trpc/ai.chat")
        var request = URLRequest(url: url)
        request.httpMethod = "POST"
        request.timeoutInterval = 45
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        request.setValue("Bearer \(accessToken)", forHTTPHeaderField: "Authorization")

        // tRPC v10 + superjson : {"json": <input>}
        let msgs = messages.map { ["role": $0.role.rawValue, "content": $0.content] }
        let payload: [String: Any] = ["json": ["messages": msgs, "systemPrompt": systemPrompt]]
        request.httpBody = try JSONSerialization.data(withJSONObject: payload)

        let (data, response) = try await URLSession.shared.data(for: request)
        guard let http = response as? HTTPURLResponse else { throw ServiceError.invalidResponse }

        if http.statusCode == 401 { throw ServiceError.unauthorized }
        guard (200 ... 299).contains(http.statusCode) else {
            let message = String(data: data, encoding: .utf8) ?? "Erreur \(http.statusCode)"
            throw ServiceError.server(message)
        }

        // tRPC v10 + superjson : {"result":{"data":{"json":{"content":"..."}}}}
        struct TRPCOutput: Decodable { let content: String }
        struct TRPCDataWrapper: Decodable { let json: TRPCOutput }
        struct TRPCResult: Decodable { let data: TRPCDataWrapper }
        struct TRPCResponse: Decodable { let result: TRPCResult }

        if let parsed = try? JSONDecoder().decode(TRPCResponse.self, from: data) {
            return parsed.result.data.json.content
        }

        throw ServiceError.invalidResponse
    }
}
