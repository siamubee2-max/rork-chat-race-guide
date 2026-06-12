import SwiftUI

struct SignupView: View {
    @Environment(\.dismiss) private var dismiss
    @Environment(AppEnvironment.self) private var environment
    @State private var name = ""
    @State private var email = ""
    @State private var password = ""
    @State private var isBusy = false

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
                    .disabled(isBusy || name.isEmpty || email.isEmpty || password.count < 8)
                }
                .padding(24)
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
        isBusy = true
        defer { isBusy = false }
        let ok = await environment.auth.signUp(email: email, password: password, name: name)
        if ok { dismiss() }
    }
}
