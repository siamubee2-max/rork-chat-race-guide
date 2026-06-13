import SwiftUI

struct ForgotPasswordView: View {
    @Environment(AppEnvironment.self) private var environment
    @Environment(\.dismiss) private var dismiss
    @State private var email = ""
    @State private var isSent = false
    @State private var isBusy = false
    @State private var errorText: String?

    var body: some View {
        NavigationStack {
            VStack(spacing: 24) {
                Image(systemName: "lock.rotation")
                    .font(.system(size: 52))
                    .foregroundStyle(AppTheme.primary)
                Text("Réinitialiser le mot de passe")
                    .font(.title2.weight(.bold))
                    .foregroundStyle(AppTheme.ivory)
                Text("Saisis ton adresse email et on t'enverra un lien.")
                    .foregroundStyle(AppTheme.textSecondary)
                    .multilineTextAlignment(.center)

                if isSent {
                    VStack(spacing: 12) {
                        Image(systemName: "checkmark.circle.fill")
                            .font(.largeTitle)
                            .foregroundStyle(.green)
                        Text("Email envoyé ! Vérifie ta boîte mail.")
                            .foregroundStyle(AppTheme.textSecondary)
                            .multilineTextAlignment(.center)
                    }
                } else {
                    GlassChrome.card {
                        TextField("Email", text: $email)
                            .textContentType(.emailAddress)
                            .keyboardType(.emailAddress)
                            .textInputAutocapitalization(.never)
                            .foregroundStyle(AppTheme.ivory)
                    }

                    if let e = errorText {
                        Text(e)
                            .font(.footnote)
                            .foregroundStyle(AppTheme.error)
                    }

                    Button {
                        Task { await sendReset() }
                    } label: {
                        if isBusy {
                            ProgressView().tint(AppTheme.background)
                        } else {
                            Text("Envoyer le lien")
                                .frame(maxWidth: .infinity, minHeight: AppTheme.minTouch)
                        }
                    }
                    .buttonStyle(GlassPrimaryButtonStyle())
                    .disabled(email.isEmpty || isBusy)
                }

                Spacer()
            }
            .padding(28)
            .purrlyScreenBackground()
            .navigationTitle("Mot de passe oublié")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button("Fermer") { dismiss() }
                }
            }
        }
    }

    private func sendReset() async {
        isBusy = true
        defer { isBusy = false }
        do {
            try await environment.auth.sendPasswordReset(
                email: email.trimmingCharacters(in: .whitespaces).lowercased()
            )
            isSent = true
        } catch {
            errorText = error.localizedDescription
        }
    }
}
