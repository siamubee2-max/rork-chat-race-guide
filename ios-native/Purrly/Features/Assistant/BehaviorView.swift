import SwiftUI

struct BehaviorView: View {
    @Environment(AppEnvironment.self) private var environment
    @State private var selectedCatId: String?
    @State private var analysis: String?
    @State private var isLoading = false
    @State private var errorText: String?

    private var cats: [CatProfile] { environment.cats.cats }
    private var selectedCat: CatProfile? { cats.first { $0.id == selectedCatId } }

    let behaviorTopics = [
        ("🐾", "Griffes et marquage", "Mon chat griffe les meubles, comment le corriger ?"),
        ("😴", "Sommeil", "Combien d'heures doit dormir un chat adulte ?"),
        ("🍽️", "Alimentation", "Mon chat mange trop vite, que faire ?"),
        ("😾", "Agressivité", "Mon chat est agressif parfois, pourquoi ?"),
        ("😻", "Affection", "Pourquoi mon chat ronronne-t-il ?"),
        ("🙀", "Stress", "Comment savoir si mon chat est stressé ?"),
    ]

    var body: some View {
        ScrollView {
            VStack(spacing: 20) {
                // Cat selector
                if !cats.isEmpty {
                    VStack(alignment: .leading, spacing: 8) {
                        Text("Analyser pour")
                            .font(.headline)
                            .foregroundStyle(AppTheme.ivory)
                        ScrollView(.horizontal, showsIndicators: false) {
                            HStack(spacing: 10) {
                                ForEach(cats) { cat in
                                    Button { selectedCatId = cat.id } label: {
                                        Text(cat.name)
                                            .font(.subheadline.weight(.semibold))
                                            .padding(.horizontal, 14)
                                            .padding(.vertical, 8)
                                            .background(
                                                selectedCatId == cat.id ? AppTheme.primary : AppTheme.backgroundCard,
                                                in: Capsule()
                                            )
                                            .foregroundStyle(
                                                selectedCatId == cat.id ? AppTheme.background : AppTheme.textSecondary
                                            )
                                    }
                                }
                            }
                        }
                    }
                }

                // Quick topics
                VStack(alignment: .leading, spacing: 10) {
                    Text("Sujets fréquents")
                        .font(.headline)
                        .foregroundStyle(AppTheme.ivory)
                    LazyVGrid(columns: [GridItem(.flexible()), GridItem(.flexible())], spacing: 10) {
                        ForEach(behaviorTopics, id: \.1) { topic in
                            Button { analyze(topic.2) } label: {
                                VStack(spacing: 6) {
                                    Text(topic.0).font(.title2)
                                    Text(topic.1)
                                        .font(.caption.weight(.semibold))
                                        .foregroundStyle(AppTheme.ivory)
                                        .multilineTextAlignment(.center)
                                        .lineLimit(2)
                                }
                                .frame(maxWidth: .infinity)
                                .padding(12)
                                .background(AppTheme.backgroundCard, in: RoundedRectangle(cornerRadius: 12))
                                .overlay(RoundedRectangle(cornerRadius: 12).stroke(AppTheme.border))
                            }
                        }
                    }
                }

                // Analysis result
                if isLoading {
                    VStack(spacing: 12) {
                        ProgressView().tint(AppTheme.primary).scaleEffect(1.2)
                        Text("Analyse en cours…").foregroundStyle(AppTheme.textSecondary)
                    }.padding(24)
                } else if let analysis {
                    GlassChrome.card(tint: AppTheme.primary.opacity(0.1)) {
                        VStack(alignment: .leading, spacing: 10) {
                            Label("Analyse comportementale", systemImage: "brain.head.profile")
                                .font(.headline)
                                .foregroundStyle(AppTheme.primary)
                            Text(analysis)
                                .font(.subheadline)
                                .foregroundStyle(AppTheme.textSecondary)
                        }
                    }
                } else if let error = errorText {
                    Text(error)
                        .font(.footnote)
                        .foregroundStyle(AppTheme.error)
                        .padding()
                }
            }
            .padding(16)
        }
        .navigationTitle("Comportement")
        .navigationBarTitleDisplayMode(.inline)
        .purrlyScreenBackground()
        .onAppear {
            if selectedCatId == nil { selectedCatId = cats.first?.id }
        }
    }

    private func analyze(_ question: String) {
        isLoading = true
        errorText = nil
        analysis = nil
        let catContext = selectedCat.map { "Chat: \($0.name)" } ?? ""
        Task {
            do {
                let reply = try await environment.aiChat.send(
                    messages: [
                        ChatMessage(
                            id: UUID().uuidString,
                            role: .user,
                            content: question,
                            createdAt: Date()
                        )
                    ],
                    systemPrompt: "Tu es un expert en comportement félin. \(catContext) Réponds de façon concise et pratique en français.",
                    accessToken: KeychainStore.read(.accessToken)
                )
                analysis = reply
            } catch {
                errorText = error.localizedDescription
            }
            isLoading = false
        }
    }
}
