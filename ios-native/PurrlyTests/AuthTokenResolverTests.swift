import XCTest
@testable import Purrly

/// Régression C1 (red-team 2026-11-27) : le jeton envoyé aux Edge Functions doit
/// venir de la session du SDK (rafraîchie automatiquement), jamais d'une copie
/// Keychain figée au `signIn` qui expire au bout d'~1 h.
@MainActor
final class AuthTokenResolverTests: XCTestCase {

    func testPrefersFreshSDKTokenOverStaleKeychainCopy() {
        let token = AuthService.resolveToken(sdkToken: "fresh-sdk", keychainToken: "stale-keychain")
        XCTAssertEqual(token, "fresh-sdk")
    }

    func testFallsBackToKeychainWhenSDKHasNoSession() {
        let token = AuthService.resolveToken(sdkToken: nil, keychainToken: "keychain")
        XCTAssertEqual(token, "keychain")
    }

    func testEmptySDKTokenFallsBackToKeychain() {
        let token = AuthService.resolveToken(sdkToken: "", keychainToken: "keychain")
        XCTAssertEqual(token, "keychain")
    }

    func testReturnsNilWhenNoTokenAnywhere() {
        XCTAssertNil(AuthService.resolveToken(sdkToken: nil, keychainToken: nil))
        XCTAssertNil(AuthService.resolveToken(sdkToken: "", keychainToken: ""))
    }
}
