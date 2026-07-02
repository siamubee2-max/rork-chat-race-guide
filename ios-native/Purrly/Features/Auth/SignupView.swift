import SwiftUI

struct SignupView: View {
    @Environment(\.dismiss) private var dismiss
    @Environment(AppEnvironment.self) private var environment
    @State private var name = ""
    @State private var email = ""
    @State private var password = ""
    @State private var isBusy = false
    @State private var formError: String?

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(spacing: 16) {
                    GlassChrome.card {
                        VStack(spacing: 12) {
                            TextField(String(localized: "auth.name"), text: $name)
                                .foregroundStyle(AppTheme.ivory)
                            TextField(String(localized: "auth.email"), text: $email)
                                .textContentType(.emailAddress)
                                .keyboardType(.emailAddress)
                                .textInputAutocapitalization(.never)
                                .foregroundStyle(AppTheme.ivory)
                            SecureField(String(localized: "auth.password"), text: $password)
                                .textContentType(.newPassword)
                                .foregroundStyle(AppTheme.ivory)
                        }
                    }

                    // Indice toujours visible : exigence du mot de passe.
                    HStack(spacing: 6) {
                        Image(systemName: password.count >= 8 ? "checkmark.circle.fill" : "circle")
                            .font(.caption2)
                            .foregroundStyle(password.count >= 8 ? Color.green : AppTheme.textMuted)
                        Text("Mot de passe : 8 caractères minimum")
                            .font(.caption)
                            .foregroundStyle(AppTheme.textMuted)
                        Spacer()
                    }
                    .padding(.horizontal, 4)

                    if let error = formError ?? environment.auth.lastError {
                        Text(error)
                            .font(.footnote)
                            .foregroundStyle(AppTheme.error)
                            .padding(.horizontal, 4)
                            .frame(maxWidth: .infinity, alignment: .leading)
                    }

                    Button {
                        Task { await signUp() }
                    } label: {
                        if isBusy {
                            ProgressView().tint(AppTheme.background)
                        } else {
                            Text(String(localized: "auth.signup.action"))
                        }
                    }
                    .buttonStyle(GlassPrimaryButtonStyle())
                    .disabled(isBusy)   // toujours cliquable : on valide au tap avec un message clair
                }
                .padding(24)
                .purrlyReadableWidth(480)
            }
            .purrlyScreenBackground()
            .navigationTitle(String(localized: "auth.signup.title"))
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button(String(localized: "common.cancel")) { dismiss() }
                }
            }
        }
    }

    private func signUp() async {
        formError = nil
        let trimmedName = name.trimmingCharacters(in: .whitespaces)
        let trimmedEmail = email.trimmingCharacters(in: .whitespaces)
        guard !trimmedName.isEmpty else { formError = "Entrez votre nom."; return }
        guard trimmedEmail.contains("@"), trimmedEmail.contains(".") else {
            formError = "Entrez une adresse e-mail valide."; return
        }
        guard password.count >= 8 else {
            formError = "Le mot de passe doit contenir au moins 8 caractères."; return
        }

        isBusy = true
        defer { isBusy = false }
        let ok = await environment.auth.signUp(email: trimmedEmail, password: password, name: trimmedName)
        if ok {
            await environment.refreshSubscriberIdentity()
            dismiss()
        }
        // Si échec, environment.auth.lastError est affiché (ex. e-mail déjà utilisé).
    }
}
