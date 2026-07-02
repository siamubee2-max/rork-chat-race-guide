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
                    Text(error)
                        .font(.footnote)
                        .foregroundStyle(AppTheme.error)
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
        GlassChrome.card {
            VStack(spacing: 14) {
                TextField(String(localized: "auth.email"), text: $email)
                    .textContentType(.emailAddress)
                    .keyboardType(.emailAddress)
                    .textInputAutocapitalization(.never)
                    .autocorrectionDisabled()
                    .foregroundStyle(AppTheme.ivory)
                SecureField(String(localized: "auth.password"), text: $password)
                    .textContentType(.password)
                    .foregroundStyle(AppTheme.ivory)
            }
        }
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
