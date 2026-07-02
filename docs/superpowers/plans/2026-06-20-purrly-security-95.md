# Purrly Security 95/100 — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Élever le score de sécurité de ~79/100 à ~95/100 via trois items : logging structuré, HMAC RevenueCat, et migration KIE iOS vers proxy backend.

**Architecture:** Un `logger.ts` partagé remplace les `console.log` disparates dans `hono.ts`. Le webhook RevenueCat vérifie une signature HMAC-SHA256 plutôt qu'un Bearer statique. Un nouveau `KieProxyService.swift` appelle `POST /trpc/kie.generate` (backend) avec le token Supabase de l'utilisateur, remplaçant l'appel direct à kie.ai depuis l'appareil.

**Tech Stack:** TypeScript/Hono (backend), Swift/URLSession (iOS), node:crypto HMAC-SHA256, tRPC v10 superjson HTTP format.

## Global Constraints

- Aucune nouvelle dépendance npm — `node:crypto` est built-in Node.js
- Les noms de fonctions Swift et TypeScript doivent correspondre exactement à ceux de ce plan
- Format tRPC v10 + superjson : body POST = `{"json": <input>}`, réponse = `{"result":{"data":{"json":<output>}}}`
- Token d'authentification iOS : `KeychainStore.read(.accessToken)` (pattern identique à `AssistantChatView`)
- tRPC endpoint URL iOS : `AppConfiguration.apiBaseURL.appending(path: "/trpc/kie.generate")`
- Timeout URLSession `callProxy` : 200s (la génération KIE peut prendre jusqu'à 3 min côté serveur)

---

### Task 1 : logger.ts + middleware request logging

**Files:**
- Create: `expo/backend/lib/logger.ts`
- Modify: `expo/backend/hono.ts` (import logger, ajouter middleware, remplacer console.* dans le webhook)

**Interfaces:**
- Produces: `log(level, service, message, meta?)` — utilisé par Task 2 et par le webhook existant

- [ ] **Étape 1 : Créer `expo/backend/lib/logger.ts`**

```typescript
type Level = "info" | "warn" | "error";

export function log(
  level: Level,
  service: string,
  message: string,
  meta?: Record<string, unknown>
): void {
  const entry: Record<string, unknown> = {
    timestamp: new Date().toISOString(),
    level,
    service,
    message,
  };
  if (meta) Object.assign(entry, meta);
  console.log(JSON.stringify(entry));
}
```

- [ ] **Étape 2 : Ajouter le middleware request logging dans `hono.ts`**

Après les imports existants, ajouter :
```typescript
import { log } from "./lib/logger";
```

Après le bloc `app.use("*", cors(...))` (ligne ~49), avant le rate limiter, ajouter :
```typescript
// Request logging — doit être placé AVANT le rate limiter pour logger les 429 aussi
app.use("*", async (c, next) => {
  const start = Date.now();
  await next();
  const ms = Date.now() - start;
  const ip =
    c.req.header("x-forwarded-for")?.split(",")[0].trim() ??
    c.req.header("x-real-ip") ??
    "unknown";
  log("info", "http", `${c.req.method} ${c.req.path}`, {
    status: c.res.status,
    ms,
    ip,
  });
});
```

- [ ] **Étape 3 : Mettre à jour le rate limiter pour logger les 429**

Dans `makeRateLimit`, remplacer la ligne `return c.json(...)` par :
```typescript
log("warn", "rate-limiter", "429 Too Many Requests", { ip, path: c.req.path });
c.header("Retry-After", String(Math.ceil((entry.resetAt - now) / 1000)));
return c.json({ error: "Too many requests" }, 429);
```

- [ ] **Étape 4 : Remplacer les console.* du webhook RevenueCat**

Dans le handler `/webhooks/revenuecat`, remplacer :

| Avant | Après |
|-------|-------|
| `console.error("[RevenueCat Webhook] Missing REVENUECAT_WEBHOOK_AUTH_KEY")` | `log("error", "revenuecat", "missing REVENUECAT_WEBHOOK_AUTH_KEY")` |
| `console.warn("[RevenueCat Webhook] Invalid authorization attempt")` | `log("warn", "revenuecat", "invalid auth", { ip: c.req.header("x-forwarded-for") ?? "unknown" })` |
| `console.warn("[RevenueCat Webhook] Invalid payload structure")` | `log("warn", "revenuecat", "invalid payload structure")` |
| `console.log(\`[RevenueCat Webhook] Received event: ...\`)` | `log("info", "revenuecat", event.type, { event_id: event.event_id, app_user_id: event.app_user_id, product_id: event.product_id })` |
| `console.error("[RevenueCat Webhook] Missing Supabase configuration")` | `log("error", "revenuecat", "missing Supabase config")` |
| `console.error("[RevenueCat Webhook] Database update failed:", updateError)` | `log("error", "revenuecat", "db update failed", { error: updateError?.message })` |
| `console.log(\`[RevenueCat Webhook] Successfully processed ...\`)` | `log("info", "revenuecat", "processed", { app_user_id: appUserId, subscription_status: subscriptionStatus })` |
| `console.error("[RevenueCat Webhook] Unexpected error:", error)` | `log("error", "revenuecat", "unexpected error", { error: String(error) })` |

- [ ] **Étape 5 : Vérification manuelle**

```bash
cd /Volumes/EVO/rork-chat-race-guide/expo
npx tsc --noEmit 2>&1 | head -20
```
Attendu : aucune erreur de type.

- [ ] **Étape 6 : Commit**

```bash
git add expo/backend/lib/logger.ts expo/backend/hono.ts
git commit -m "feat(backend): structured JSON logging middleware + replace console.* in webhook"
```

---

### Task 2 : HMAC-SHA256 sur le webhook RevenueCat

**Files:**
- Modify: `expo/backend/hono.ts` (remplacer la vérification Bearer par HMAC)

**Interfaces:**
- Consumes: `log()` de Task 1
- Produces: rien en aval

**Contexte :** RevenueCat peut envoyer `X-RevenueCat-Signature: v1=<64 hex chars>` (HMAC-SHA256 du raw body avec la clé webhook). L'implémentation actuelle compare seulement `Authorization: Bearer <key>`. On remplace par HMAC tout en gardant `REVENUECAT_WEBHOOK_AUTH_KEY` comme secret partagé.

- [ ] **Étape 1 : Ajouter l'import `node:crypto` dans `hono.ts`**

En haut du fichier, après les imports existants :
```typescript
import { createHmac, timingSafeEqual } from "node:crypto";
```

- [ ] **Étape 2 : Ajouter la fonction `verifyRevenueCatSignature`**

Avant la définition de `app`, ajouter :
```typescript
function verifyRevenueCatSignature(
  rawBody: Buffer,
  secret: string,
  signatureHeader: string | undefined
): boolean {
  if (!signatureHeader) return false;
  // Header format: "v1=<64 lowercase hex chars>"
  const match = signatureHeader.match(/^v1=([a-f0-9]{64})$/);
  if (!match) return false;
  const expected = createHmac("sha256", secret).update(rawBody).digest();
  const received = Buffer.from(match[1], "hex");
  if (expected.length !== received.length) return false;
  return timingSafeEqual(expected, received);
}
```

- [ ] **Étape 3 : Mettre à jour le handler `/webhooks/revenuecat`**

Remplacer le bloc existant (de `app.post("/webhooks/revenuecat"` jusqu'à la fin) par :

```typescript
app.post("/webhooks/revenuecat", async (c) => {
  const authKey = process.env.REVENUECAT_WEBHOOK_AUTH_KEY;

  if (!authKey) {
    log("error", "revenuecat", "missing REVENUECAT_WEBHOOK_AUTH_KEY");
    return c.json({ error: "Webhook not configured" }, 500);
  }

  // Read raw body once — needed for both HMAC and JSON parsing
  const rawBody = Buffer.from(await c.req.arrayBuffer());

  // Prefer HMAC signature if present; fall back to Bearer for backward compat
  const sigHeader = c.req.header("X-RevenueCat-Signature");
  const authHeader = c.req.header("Authorization");

  const isHmacValid = sigHeader
    ? verifyRevenueCatSignature(rawBody, authKey, sigHeader)
    : false;
  const isBearerValid = !sigHeader && authHeader === `Bearer ${authKey}`;

  if (!isHmacValid && !isBearerValid) {
    const ip = c.req.header("x-forwarded-for") ?? "unknown";
    log("warn", "revenuecat", "invalid auth", {
      ip,
      method: sigHeader ? "hmac" : "bearer",
    });
    return c.json({ error: "Unauthorized" }, 401);
  }

  try {
    const body = JSON.parse(rawBody.toString("utf8"));
    const { event } = body;

    if (!event || !event.type) {
      log("warn", "revenuecat", "invalid payload structure");
      return c.json({ error: "Invalid payload" }, 400);
    }

    log("info", "revenuecat", event.type, {
      event_id: event.event_id,
      app_user_id: event.app_user_id,
      product_id: event.product_id,
    });

    const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceRoleKey) {
      log("error", "revenuecat", "missing Supabase config");
      return c.json({ error: "Database not configured" }, 500);
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    const getSubscriptionStatus = (eventType: string): string => {
      switch (eventType) {
        case "INITIAL_PURCHASE":
        case "RENEWAL":
        case "UNCACHE_PURCHASE":
          return "active";
        case "CANCELLATION":
        case "EXPIRATION":
          return "inactive";
        case "BILLING_ISSUE":
          return "billing_issue";
        default:
          return "unknown";
      }
    };

    const subscriptionStatus = getSubscriptionStatus(event.type);
    const appUserId = event.app_user_id;
    const productId = event.product_id;

    const { error: updateError } = await supabase
      .from("users")
      .update({
        subscription_tier: productId,
        subscription_status: subscriptionStatus,
        subscription_updated_at: new Date().toISOString(),
        revenuecat_customer_id: event.subscriber_id || appUserId,
      })
      .eq("id", appUserId);

    if (updateError) {
      log("error", "revenuecat", "db update failed", {
        error: updateError.message,
      });
      return c.json({ error: "Database update failed" }, 500);
    }

    log("info", "revenuecat", "processed", {
      app_user_id: appUserId,
      subscription_status: subscriptionStatus,
    });

    return c.json({ received: true, status: subscriptionStatus }, 200);
  } catch (error) {
    log("error", "revenuecat", "unexpected error", { error: String(error) });
    return c.json({ error: "Internal server error" }, 500);
  }
});
```

- [ ] **Étape 4 : Vérification TypeScript**

```bash
cd /Volumes/EVO/rork-chat-race-guide/expo
npx tsc --noEmit 2>&1 | head -20
```
Attendu : aucune erreur.

- [ ] **Étape 5 : Test manuel HMAC (optionnel, nécessite Node.js local)**

```bash
node -e "
const crypto = require('crypto');
const secret = 'test-secret';
const payload = JSON.stringify({event:{type:'RENEWAL',app_user_id:'u1',product_id:'pro'}});
const sig = 'v1=' + crypto.createHmac('sha256', secret).update(payload).digest('hex');
console.log('Header:', sig);
console.log('Length:', sig.length); // doit être 67 (v1= + 64 hex)
"
```

- [ ] **Étape 6 : Commit**

```bash
git add expo/backend/hono.ts
git commit -m "security(backend): HMAC-SHA256 verification on RevenueCat webhook (timingSafeEqual)"
```

---

### Task 3 : KieProxyService.swift + migration CatPhotoBoothView

**Files:**
- Create: `ios-native/Purrly/Services/KieProxyService.swift`
- Modify: `ios-native/Purrly/Features/PhotoBooth/CatPhotoBoothView.swift` (lignes 63, 325-340)
- Modify: `ios-native/Purrly/Services/AppConfiguration.swift` (ligne 50 — `isKieConfigured`)

**Interfaces:**
- Consumes: `AppConfiguration.apiBaseURL`, `KeychainStore.read(.accessToken)`, `KieAIService.AccessoryPreset` (pour le `.rawValue`)
- Produces: `KieProxyService.generate(image:preset:accessToken:progressHandler:) async throws -> UIImage`

**Format tRPC v10 + superjson :**
- Request body : `{"json":{"imageBase64":"<base64>","preset":"cowboy_hat"}}`
- Response : `{"result":{"data":{"json":{"resultUrl":"https://..."}}}}`

- [ ] **Étape 1 : Créer `ios-native/Purrly/Services/KieProxyService.swift`**

```swift
import Foundation
import UIKit

/// Proxy vers le backend `kie.generate` tRPC — la clé KIE ne quitte jamais le serveur.
struct KieProxyService {

    enum ServiceError: LocalizedError {
        case unauthorized
        case rateLimited
        case serverError(String)
        case invalidResponse
        case downloadFailed

        var errorDescription: String? {
            switch self {
            case .unauthorized:          return "Connectez-vous pour utiliser IA Booth."
            case .rateLimited:           return "Trop de requêtes — réessaie dans une minute."
            case .serverError(let msg):  return "Erreur serveur : \(msg)"
            case .invalidResponse:       return "Réponse serveur inattendue."
            case .downloadFailed:        return "Impossible de télécharger l'image générée."
            }
        }
    }

    /// Génère une photo de chat avec accessoire via le proxy backend.
    func generate(
        image: UIImage,
        preset: KieAIService.AccessoryPreset,
        accessToken: String,
        progressHandler: ((Double) -> Void)? = nil
    ) async throws -> UIImage {
        guard let jpeg = image.jpegData(compressionQuality: 0.85) else {
            throw ServiceError.invalidResponse
        }
        progressHandler?(0.1)

        let resultUrl = try await callProxy(
            imageBase64: jpeg.base64EncodedString(),
            preset: preset.rawValue,
            accessToken: accessToken
        )
        progressHandler?(0.95)

        let result = try await downloadImage(from: resultUrl)
        progressHandler?(1.0)
        return result
    }

    // MARK: - Private

    private func callProxy(
        imageBase64: String,
        preset: String,
        accessToken: String
    ) async throws -> URL {
        let url = AppConfiguration.apiBaseURL.appending(path: "/trpc/kie.generate")

        var request = URLRequest(url: url)
        request.httpMethod = "POST"
        request.timeoutInterval = 200  // génération kie.ai ≤ 3 min côté serveur
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        request.setValue("Bearer \(accessToken)", forHTTPHeaderField: "Authorization")

        // Format tRPC v10 + superjson : {"json": <input>}
        let payload: [String: Any] = ["json": ["imageBase64": imageBase64, "preset": preset]]
        request.httpBody = try JSONSerialization.data(withJSONObject: payload)

        let (data, response) = try await URLSession.shared.data(for: request)
        guard let http = response as? HTTPURLResponse else {
            throw ServiceError.invalidResponse
        }

        switch http.statusCode {
        case 200...299: break
        case 401: throw ServiceError.unauthorized
        case 429: throw ServiceError.rateLimited
        default:
            let msg = String(data: data, encoding: .utf8) ?? "HTTP \(http.statusCode)"
            throw ServiceError.serverError(msg)
        }

        // Réponse tRPC v10 + superjson : {"result":{"data":{"json":{"resultUrl":"..."}}}}
        struct TRPCResponse: Decodable {
            struct Result: Decodable {
                struct DataWrapper: Decodable {
                    struct Output: Decodable { let resultUrl: String }
                    let json: Output
                }
                let data: DataWrapper
            }
            let result: Result
        }

        if let parsed = try? JSONDecoder().decode(TRPCResponse.self, from: data),
           let resultUrl = URL(string: parsed.result.data.json.resultUrl) {
            return resultUrl
        }
        throw ServiceError.invalidResponse
    }

    private func downloadImage(from url: URL) async throws -> UIImage {
        var request = URLRequest(url: url)
        request.timeoutInterval = 30
        let (data, _) = try await URLSession.shared.data(for: request)
        guard let image = UIImage(data: data) else {
            throw ServiceError.downloadFailed
        }
        return image
    }
}
```

- [ ] **Étape 2 : Mettre à jour `AppConfiguration.isKieConfigured`**

Dans `ios-native/Purrly/Services/AppConfiguration.swift`, remplacer :
```swift
static var isKieConfigured: Bool { kieApiKey != nil }
```
par :
```swift
// Proxy backend disponible dès qu'on a une URL d'API — la clé reste côté serveur
static var isKieConfigured: Bool { true }
```

- [ ] **Étape 3 : Mettre à jour `CatPhotoBoothView.swift`**

**3a — Remplacer la déclaration du service (ligne 63) :**
```swift
// Avant
@State private var kieService = KieAIService()

// Après
@State private var kieProxy = KieProxyService()
```

**3b — Remplacer `generateWithKie` (lignes 325-341) :**
```swift
private func generateWithKie(preset: KieAIService.AccessoryPreset) async {
    guard let photo = selectedPhoto else { return }
    guard let token = KeychainStore.read(.accessToken), !token.isEmpty else {
        kieError = "Connectez-vous pour utiliser IA Booth."
        return
    }
    kieIsGenerating = true
    kieError = nil
    kieProgress = 0
    UIImpactFeedbackGenerator(style: .medium).impactOccurred()
    do {
        let result = try await kieProxy.generate(
            image: photo,
            preset: preset,
            accessToken: token
        ) { p in
            kieProgress = p
        }
        kieResultImage = result
        UIImpactFeedbackGenerator(style: .heavy).impactOccurred()
    } catch {
        kieError = error.localizedDescription
    }
    kieIsGenerating = false
}
```

- [ ] **Étape 4 : Build Xcode pour vérifier la compilation**

```bash
cd /Volumes/EVO/rork-chat-race-guide/ios-native
xcodebuild build \
  -project Purrly.xcodeproj \
  -scheme Purrly \
  -destination "generic/platform=iOS Simulator" \
  -quiet 2>&1 | tail -5
```
Attendu : `** BUILD SUCCEEDED **`

- [ ] **Étape 5 : Commit**

```bash
git add \
  ios-native/Purrly/Services/KieProxyService.swift \
  ios-native/Purrly/Services/AppConfiguration.swift \
  ios-native/Purrly/Features/PhotoBooth/CatPhotoBoothView.swift
git commit -m "security(ios): migrate IA Booth to backend KIE proxy — KIE_API_KEY off device"
```

---

## Checklist de validation finale

- [ ] `npx tsc --noEmit` passe sans erreur (backend)
- [ ] Xcode build succeeded (iOS)
- [ ] `git log --oneline -5` montre 3 commits propres
- [ ] `git status` — working tree clean
- [ ] Score 007 estimé : **~95/100**

## Score projeté après Task 1+2+3

| Domaine | Poids | Avant | Après |
|---------|-------|-------|-------|
| Secrets & Credentials | 20% | 90 | **98** |
| Auth & Authorization | 15% | 85 | **95** |
| Monitoring | 10% | 50 | **85** |
| **Global** | | **~79** | **~95** |
