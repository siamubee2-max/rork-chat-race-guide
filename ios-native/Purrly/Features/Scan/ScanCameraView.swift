import SwiftUI
import AVFoundation

struct ScanCameraView: View {
    @Environment(\.dismiss) private var dismiss
    var onCapture: (Data) -> Void

    @State private var flashOn = false
    @StateObject private var camera = CameraModel()

    var body: some View {
        ZStack {
            CameraPreviewView(session: camera.session)
                .ignoresSafeArea()

            // Overlay
            VStack {
                HStack {
                    Button { dismiss() } label: {
                        Image(systemName: "xmark")
                            .font(.title2.weight(.semibold))
                            .foregroundStyle(.white)
                            .padding(12)
                            .background(.black.opacity(0.5), in: Circle())
                    }
                    Spacer()
                    Button {
                        flashOn.toggle()
                        camera.toggleFlash(flashOn)
                    } label: {
                        Image(systemName: flashOn ? "bolt.fill" : "bolt.slash.fill")
                            .font(.title2.weight(.semibold))
                            .foregroundStyle(flashOn ? AppTheme.primary : .white)
                            .padding(12)
                            .background(
                                flashOn ? AppTheme.primary.opacity(0.2) : .black.opacity(0.5),
                                in: Circle()
                            )
                    }
                }
                .padding(.horizontal, 20)
                .padding(.top, 60)

                Spacer()

                // Viewfinder hint
                Text("Cadrez votre chat dans le viseur")
                    .font(.caption.weight(.semibold))
                    .foregroundStyle(.white)
                    .padding(.horizontal, 16)
                    .padding(.vertical, 8)
                    .background(.black.opacity(0.55), in: Capsule())

                // Corner-bracket viewfinder
                ZStack {
                    RoundedRectangle(cornerRadius: 20)
                        .stroke(.clear, lineWidth: 0)
                        .frame(width: 260, height: 260)

                    // Corners
                    ViewfinderCorners()
                        .frame(width: 260, height: 260)
                }
                .padding(.top, 12)

                Spacer()

                // Camera flip + shutter row
                HStack {
                    Spacer()
                        .frame(width: 50)

                    Spacer()

                    // Shutter
                    Button {
                        camera.capture { data in
                            if let data { onCapture(data) }
                            dismiss()
                        }
                    } label: {
                        ZStack {
                            Circle()
                                .stroke(.white.opacity(0.5), lineWidth: 4)
                                .frame(width: 84, height: 84)
                            Circle()
                                .fill(.white)
                                .frame(width: 72, height: 72)
                        }
                    }

                    Spacer()

                    // Flip camera
                    Button {
                        camera.flipCamera()
                    } label: {
                        Image(systemName: "arrow.triangle.2.circlepath.camera")
                            .font(.title2)
                            .foregroundStyle(.white)
                            .frame(width: 50, height: 50)
                            .background(.white.opacity(0.15), in: Circle())
                    }
                }
                .padding(.horizontal, 40)
                .padding(.bottom, 48)
            }
        }
        .onAppear { camera.start() }
        .onDisappear { camera.stop() }
        .navigationBarHidden(true)
    }
}

// MARK: - Corner bracket shape

private struct ViewfinderCorners: View {
    var body: some View {
        GeometryReader { geo in
            let w = geo.size.width
            let h = geo.size.height
            let arm: CGFloat = 36
            let r: CGFloat = 12
            let lw: CGFloat = 3
            let c = AppTheme.primary

            // TL
            Path { p in
                p.move(to: CGPoint(x: r, y: 0))
                p.addLine(to: CGPoint(x: arm, y: 0))
                p.move(to: CGPoint(x: 0, y: r))
                p.addLine(to: CGPoint(x: 0, y: arm))
                p.move(to: CGPoint(x: 0, y: r))
                p.addQuadCurve(to: CGPoint(x: r, y: 0), control: CGPoint(x: 0, y: 0))
            }
            .stroke(c, lineWidth: lw)

            // TR
            Path { p in
                p.move(to: CGPoint(x: w - arm, y: 0))
                p.addLine(to: CGPoint(x: w - r, y: 0))
                p.move(to: CGPoint(x: w, y: r))
                p.addLine(to: CGPoint(x: w, y: arm))
                p.move(to: CGPoint(x: w - r, y: 0))
                p.addQuadCurve(to: CGPoint(x: w, y: r), control: CGPoint(x: w, y: 0))
            }
            .stroke(c, lineWidth: lw)

            // BL
            Path { p in
                p.move(to: CGPoint(x: 0, y: h - arm))
                p.addLine(to: CGPoint(x: 0, y: h - r))
                p.move(to: CGPoint(x: r, y: h))
                p.addLine(to: CGPoint(x: arm, y: h))
                p.move(to: CGPoint(x: 0, y: h - r))
                p.addQuadCurve(to: CGPoint(x: r, y: h), control: CGPoint(x: 0, y: h))
            }
            .stroke(c, lineWidth: lw)

            // BR
            Path { p in
                p.move(to: CGPoint(x: w, y: h - arm))
                p.addLine(to: CGPoint(x: w, y: h - r))
                p.move(to: CGPoint(x: w - arm, y: h))
                p.addLine(to: CGPoint(x: w - r, y: h))
                p.move(to: CGPoint(x: w, y: h - r))
                p.addQuadCurve(to: CGPoint(x: w - r, y: h), control: CGPoint(x: w, y: h))
            }
            .stroke(c, lineWidth: lw)
        }
    }
}

// MARK: - Camera model

@MainActor
final class CameraModel: ObservableObject {
    let session = AVCaptureSession()
    private var output = AVCapturePhotoOutput()
    private var currentPosition: AVCaptureDevice.Position = .back
    private var liveDelegates: [PhotoDelegate] = []

    func start() {
        Task.detached { [weak self] in
            guard let self else { return }
            let status = AVCaptureDevice.authorizationStatus(for: .video)
            let granted: Bool
            if status == .authorized {
                granted = true
            } else {
                granted = await AVCaptureDevice.requestAccess(for: .video)
            }
            guard granted else { return }
            await self.configureSession(position: .back)
        }
    }

    func stop() {
        session.stopRunning()
    }

    func toggleFlash(_ on: Bool) {
        guard let device = AVCaptureDevice.default(for: .video), device.hasTorch else { return }
        try? device.lockForConfiguration()
        device.torchMode = on ? .on : .off
        device.unlockForConfiguration()
    }

    func flipCamera() {
        let next: AVCaptureDevice.Position = currentPosition == .back ? .front : .back
        Task.detached { [weak self] in
            guard let self else { return }
            await self.configureSession(position: next)
        }
        currentPosition = next
    }

    func capture(completion: @escaping (Data?) -> Void) {
        let settings = AVCapturePhotoSettings()
        weak var weakSelf = self
        let delegate = PhotoDelegate(completion: completion)
        liveDelegates.append(delegate)
        let capturedDelegate = delegate
        delegate.onFinished = {
            Task { @MainActor in
                weakSelf?.liveDelegates.removeAll { $0 === capturedDelegate }
            }
        }
        output.capturePhoto(with: settings, delegate: delegate)
    }

    private func configureSession(position: AVCaptureDevice.Position) {
        session.beginConfiguration()
        // Remove existing inputs
        for input in session.inputs { session.removeInput(input) }

        guard let device = AVCaptureDevice.default(.builtInWideAngleCamera, for: .video, position: position),
              let input = try? AVCaptureDeviceInput(device: device),
              session.canAddInput(input) else {
            session.commitConfiguration()
            return
        }
        session.addInput(input)

        if !session.outputs.contains(output) {
            if session.canAddOutput(output) {
                session.addOutput(output)
            }
        }

        session.commitConfiguration()
        if !session.isRunning {
            session.startRunning()
        }
    }
}

// MARK: - Photo delegate

final class PhotoDelegate: NSObject, AVCapturePhotoCaptureDelegate {
    let completion: (Data?) -> Void
    var onFinished: (() -> Void)?

    init(completion: @escaping (Data?) -> Void) { self.completion = completion }

    func photoOutput(
        _ output: AVCapturePhotoOutput,
        didFinishProcessingPhoto photo: AVCapturePhoto,
        error: Error?
    ) {
        completion(error == nil ? photo.fileDataRepresentation() : nil)
        onFinished?()
    }
}

// MARK: - Camera preview

struct CameraPreviewView: UIViewRepresentable {
    let session: AVCaptureSession

    func makeUIView(context: Context) -> PreviewUIView {
        let view = PreviewUIView()
        view.session = session
        return view
    }

    func updateUIView(_ uiView: PreviewUIView, context: Context) {}

    final class PreviewUIView: UIView {
        override class var layerClass: AnyClass { AVCaptureVideoPreviewLayer.self }
        var previewLayer: AVCaptureVideoPreviewLayer { layer as! AVCaptureVideoPreviewLayer }

        var session: AVCaptureSession? {
            didSet { previewLayer.session = session }
        }

        override func layoutSubviews() {
            super.layoutSubviews()
            previewLayer.videoGravity = .resizeAspectFill
            previewLayer.frame = bounds
        }
    }
}
