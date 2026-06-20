import UIKit

/// Stocke les photos de chats comme fichiers JPEG dans Documents.
/// On ne garde qu'un nom de fichier dans `CatProfile.imageUri` — jamais de
/// base64 dans UserDefaults (qui ferait gonfler le blob `cats_data` et ramer
/// chaque load/save).
enum CatImageStore {

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
            return fileName
        } catch {
            return nil
        }
    }

    /// Charge l'image depuis son nom de fichier (valeur de `imageUri`).
    static func load(_ fileName: String?) -> UIImage? {
        guard let fileName, !fileName.isEmpty else { return nil }
        return UIImage(contentsOfFile: url(for: fileName).path)
    }

    static func delete(_ fileName: String?) {
        guard let fileName, !fileName.isEmpty else { return }
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
