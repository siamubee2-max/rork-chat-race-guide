import SwiftUI

struct LoginView: View {
    @Environment(AppEnvironment.self) private var environment
    @State private var email = ""
    @State private var password = ""
    @State private var isBusy = false
    @State private var showSignup = false
    @State private var showForgotPassword = false
    @State private var inlineError: String?

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 20) {
                header
                form
                if let error = inlineError ?? environment.auth.lastError {
                    Label(error, systemImage: "exclamationmark.triangle.fill")
                        .font(.callout.weight(.semibold))
                        .foregroundStyle(AppTheme.error)
                        .padding(.horizontal, 14)
                        .padding(.vertical, 10)
                        .frame(maxWidth: .infinity, alignment: .leading)
                        .background(AppTheme.error.opacity(0.12), in: RoundedRectangle(cornerRadius: 12))
                        .accessibilityLabel("Erreur : \(error)")
                }
                actions
            }
            .padding(24)
            .purrlyReadableWidth(480)
        }
        .purrlyScreenBackground()
        .sheet(isPresented: $showSignup) {
            SignupView()
        }
        .sheet(isPresented: $showForgotPassword) {
            ForgotPasswordView()
        }
    }

    private var header: some View {
        VStack(alignment: .leading, spacing: 8) {
            Label("Purrly", systemImage: "crown.fill")
                .font(.title2.weight(.black))
                .foregroundStyle(AppTheme.primary)
            Text(String(localized: "auth.login.title"))
                .font(.title.weight(.bold))
                .foregroundStyle(AppTheme.ivory)
            Text(String(localized: "auth.login.subtitle"))
                .foregroundStyle(AppTheme.textSecondary)
        }
    }

    private var form: some View {
        // Chaque champ dans sa PROPRE carte bordée : App Review a refusé une
        // version où les deux champs partageaient une carte « glass » et le
        // SecureField s'y rendait invisible — le reviewer ne voyait qu'un champ
        // e-mail, ne pouvait pas saisir de mot de passe, et « Sign In » restait
        // sans effet. Bordure + fond opaques garantissent la visibilité partout.
        VStack(spacing: 14) {
            fieldContainer {
                TextField(String(localized: "auth.email"), text: $email)
                    .textContentType(.emailAddress)
                    .keyboardType(.emailAddress)
                    .textInputAutocapitalization(.never)
                    .autocorrectionDisabled()
                    .foregroundStyle(AppTheme.ivory)
                    .accessibilityIdentifier("auth.email")
            }
            fieldContainer {
                SecureField(String(localized: "auth.password"), text: $password)
                    .textContentType(.password)
                    .foregroundStyle(AppTheme.ivory)
                    .accessibilityIdentifier("auth.password")
            }
        }
    }

    /// Conteneur de champ opaque et bordé, lisible sur tous les appareils
    /// (indépendant du rendu Liquid Glass).
    private func fieldContainer<Content: View>(@ViewBuilder _ content: () -> Content) -> some View {
        content()
            .font(.body)
            .frame(minHeight: 30)
            .padding(.horizontal, 16)
            .padding(.vertical, 14)
            .background(AppTheme.backgroundCard, in: RoundedRectangle(cornerRadius: 16))
            .overlay(RoundedRectangle(cornerRadius: 16).stroke(AppTheme.border, lineWidth: 1))
    }

    private var actions: some View {
        VStack(spacing: 12) {
            Button {
                Task { await signIn() }
            } label: {
                if isBusy {
                    ProgressView().tint(AppTheme.background)
                } else {
                    Text(String(localized: "auth.login.action"))
                }
            }
            .buttonStyle(GlassPrimaryButtonStyle())
            // Disable only while a sign-in is in flight. Validate the fields when
            // tapped instead of disabling the button — App Review rejected an
            // earlier build with "app did not respond when we tapped on Sign In"
            // because the button looked enabled but did nothing when the form was
            // empty.
            .disabled(isBusy)

            Button(String(localized: "auth.signup.link")) {
                showSignup = true
            }
            .font(.subheadline.weight(.semibold))
            .foregroundStyle(AppTheme.primaryLight)
            .frame(minHeight: AppTheme.minTouch)

            Button("Mot de passe oublié ?") { showForgotPassword = true }
                .font(.caption)
                .foregroundStyle(AppTheme.textMuted)

            #if DEBUG
            Button("Compte démo") {
                email = AppConfiguration.demoEmail
                password = "Demo1234!"
                Task { await signIn() }
            }
            .font(.caption)
            .foregroundStyle(AppTheme.textMuted)
            #endif
        }
    }

    private func signIn() async {
        let trimmedEmail = email.trimmingCharacters(in: .whitespacesAndNewlines)
        guard !trimmedEmail.isEmpty, !password.isEmpty else {
            inlineError = String(localized: "auth.login.fields_required")
            return
        }
        inlineError = nil
        isBusy = true
        defer { isBusy = false }
        _ = await environment.auth.signIn(email: trimmedEmail, password: password)
        await environment.refreshSubscriberIdentity()
    }
}
