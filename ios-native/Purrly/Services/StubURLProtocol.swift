#if DEBUG
import Foundation
import UIKit

/// Intercepte les requêtes réseau pendant les tests UI et renvoie des réponses
/// canoniques selon le chemin de l'URL. Activé uniquement via `AppHTTP.session`
/// sous l'argument `-uiTesting` (jamais en production).
final class StubURLProtocol: URLProtocol {

    override class func canInit(with request: URLRequest) -> Bool { true }
    override class func canonicalRequest(for request: URLRequest) -> URLRequest { request }

    override func startLoading() {
        let url = request.url?.absoluteString ?? ""
        let (status, data, contentType) = StubResponses.make(for: url)

        if let response = HTTPURLResponse(
            url: request.url!, statusCode: status, httpVersion: "HTTP/1.1",
            headerFields: ["Content-Type": contentType]
        ) {
            client?.urlProtocol(self, didReceive: response, cacheStoragePolicy: .notAllowed)
        }
        client?.urlProtocol(self, didLoad: data)
        client?.urlProtocolDidFinishLoading(self)
    }

    override func stopLoading() {}
}

/// Réponses canoniques par chemin d'URL.
enum StubResponses {

    static func make(for url: String) -> (status: Int, data: Data, contentType: String) {
        // Endpoints réels = Edge Functions Supabase (voir AIChatService /ai-chat,
        // BreedScanService /breed-scan, KieProxyService /kie-generate).
        if url.contains("/ai-chat") {
            // AIChatService décode ChatResponse { content }.
            return (200, json(#"{"content":"Réponse de test IA."}"#), "application/json")
        }
        if url.contains("/breed-scan") {
            // BreedScanService décode ScanResult directement.
            let body = #"{"topBreed":"Européen","confidence":"Très probable","why":"Analyse de test.","alternatives":["Maine Coon"]}"#
            return (200, json(body), "application/json")
        }
        if url.contains("/kie-generate") {
            return (200, json(#"{"resultUrl":"https://stub.invalid/cat.png"}"#), "application/json")
        }
        if url.contains("stub.invalid/cat.png") {
            return (200, onePixelPNG(), "image/png")
        }
        return (200, json("{}"), "application/json")
    }

    private static func json(_ s: String) -> Data { Data(s.utf8) }

    private static func onePixelPNG() -> Data {
        let renderer = UIGraphicsImageRenderer(size: CGSize(width: 1, height: 1))
        let image = renderer.image { ctx in
            UIColor.systemPink.setFill()
            ctx.fill(CGRect(x: 0, y: 0, width: 1, height: 1))
        }
        return image.pngData() ?? Data()
    }
}
#endif
