import UIKit

/// Stocke les photos de chats comme fichiers JPEG dans Documents.
/// On ne garde qu'un nom de fichier dans `CatProfile.imageUri` — jamais de
/// base64 dans UserDefaults (qui ferait gonfler le blob `cats_data` et ramer
/// chaque load/save).
enum CatImageStore {

    // Cache mémoire : `load()` est appelé depuis `body` (CatRow, CatDetailView),
    // ré-évalué à chaque rendu/scroll. Sans cache, on relit + redécode le JPEG
    // disque sur le main thread à chaque passe → jank. Le cache rend les appels
    // répétés quasi-gratuits.
    // NSCache est thread-safe en interne ; nonisolated(unsafe) satisfait Swift 6.
    nonisolated(unsafe) private static let cache = NSCache<NSString, UIImage>()

    private static var documents: URL {
        FileManager.default.urls(for: .documentDirectory, in: .userDomainMask)[0]
    }

    private static func url(for fileName: String) -> URL {
        documents.appendingPathComponent(fileName)
    }

    /// Redimensionne, compresse et écrit l'image. Retourne le nom de fichier à
    /// stocker dans `imageUri`, ou nil en cas d'échec.
    static func save(_ image: UIImage, catId: String) -> String? {
        let resized = downscale(image, maxDimension: 512)
        guard let data = resized.jpegData(compressionQuality: 0.8) else { return nil }
        let fileName = "cat-\(catId).jpg"
        do {
            try data.write(to: url(for: fileName), options: .atomic)
            cache.setObject(resized, forKey: fileName as NSString)  // garde le cache cohérent
            return fileName
        } catch {
            return nil
        }
    }

    /// Charge l'image depuis son nom de fichier (valeur de `imageUri`).
    /// Sûr à appeler depuis `body` : sert le cache mémoire après le 1er décodage.
    static func load(_ fileName: String?) -> UIImage? {
        guard let fileName, !fileName.isEmpty else { return nil }
        let key = fileName as NSString
        if let cached = cache.object(forKey: key) { return cached }
        guard let image = UIImage(contentsOfFile: url(for: fileName).path) else { return nil }
        cache.setObject(image, forKey: key)
        return image
    }

    static func delete(_ fileName: String?) {
        guard let fileName, !fileName.isEmpty else { return }
        cache.removeObject(forKey: fileName as NSString)
        try? FileManager.default.removeItem(at: url(for: fileName))
    }

    private static func downscale(_ image: UIImage, maxDimension: CGFloat) -> UIImage {
        let longest = max(image.size.width, image.size.height)
        guard longest > maxDimension else { return image }
        let scale = maxDimension / longest
        let newSize = CGSize(width: image.size.width * scale, height: image.size.height * scale)
        let renderer = UIGraphicsImageRenderer(size: newSize)
        return renderer.image { _ in image.draw(in: CGRect(origin: .zero, size: newSize)) }
    }
}
