import Foundation
import Vision
import CoreML
import UIKit

/// Classification de race **on-device** (Vision + Core ML).
///
/// Sert de fast-path / fallback hors-ligne au `BreedScanService` cloud :
/// instantané, gratuit, fonctionne sans réseau (ex. chez le vétérinaire).
///
/// Dégradation propre : si aucun modèle `CatBreedClassifier.mlmodelc` n'est
/// embarqué dans le bundle, `classify` renvoie `nil` et l'appelant retombe
/// sur son comportement habituel. On peut donc câbler le service avant même
/// d'avoir entraîné le modèle.
@MainActor
final class BreedClassifierService {

    struct Guess: Sendable {
        let label: String      // identifiant brut renvoyé par le modèle (mappé au catalogue par l'appelant)
        let confidence: Float  // 0…1
    }

    /// Nom du modèle compilé attendu dans le bundle (sans extension).
    static let modelName = "CatBreedClassifier"

    private var vnModel: VNCoreMLModel?
    private var loadAttempted = false

    /// `true` si un modèle on-device est embarqué et chargeable.
    var isAvailable: Bool {
        loadModelIfNeeded()
        return vnModel != nil
    }

    /// Classe une image et renvoie les meilleures hypothèses, ou `nil`
    /// si aucun modèle n'est disponible / l'inférence échoue.
    func classify(imageData: Data, maxResults: Int = 4) -> [Guess]? {
        loadModelIfNeeded()
        guard let vnModel,
              let cgImage = UIImage(data: imageData)?.cgImage else { return nil }

        let request = VNCoreMLRequest(model: vnModel)
        request.imageCropAndScaleOption = .centerCrop

        let handler = VNImageRequestHandler(cgImage: cgImage, options: [:])
        do {
            try handler.perform([request])
        } catch {
            return nil
        }

        let observations = (request.results as? [VNClassificationObservation]) ?? []
        let guesses = observations
            .prefix(maxResults)
            .map { Guess(label: $0.identifier, confidence: $0.confidence) }
        return guesses.isEmpty ? nil : Array(guesses)
    }

    /// Traduit une confiance Vision (0…1) dans le vocabulaire FR du scanner,
    /// cohérent avec `BreedScanService.ScanResult.confidence`.
    static func confidenceLabel(_ confidence: Float) -> String {
        switch confidence {
        case 0.8...:   "Très probable"
        case 0.5..<0.8: "Probable"
        default:        "Possible"
        }
    }

    // MARK: - Privé

    private func loadModelIfNeeded() {
        guard !loadAttempted else { return }
        loadAttempted = true

        // Cherche un modèle déjà compilé (.mlmodelc) embarqué dans le bundle.
        guard let url = Bundle.main.url(forResource: Self.modelName, withExtension: "mlmodelc") else {
            return
        }
        do {
            let configuration = MLModelConfiguration()
            configuration.computeUnits = .all // Neural Engine + GPU + CPU
            let mlModel = try MLModel(contentsOf: url, configuration: configuration)
            vnModel = try VNCoreMLModel(for: mlModel)
        } catch {
            vnModel = nil
        }
    }
}
