# Purrly Security — Atteindre 95/100

**Date :** 2026-06-20  
**Score avant :** ~79/100 (commit 2899624)  
**Score cible :** 95/100  
**Scope :** 3 items indépendants, tous implémentables en une session

---

## Contexte

L'audit 007 (OODA, juin 2026) a produit un premier batch de correctifs (commit 2899624) :
- Secrets.xcconfig non-tracké
- Bug `verifySubscriptionTier` dans `ai.transcribe` corrigé
- Timeouts URLSession ajoutés dans `KieAIService`
- Rate limiting in-memory sur `/trpc/*`
- Proxy backend `kie.generate` créé côté serveur

Il reste 3 items pour atteindre 95/100.

---

## Item 1 — Migration KIE vers proxy iOS

### Problème
`KieAIService.swift` appelle kie.ai directement depuis l'appareil avec `AppConfiguration.kieApiKey` (chargé depuis le bundle). Même si Secrets.xcconfig est gitignored, la clé est compilée dans le binaire en production.

### Solution
Nouveau service `KieProxyService.swift` qui suit exactement le pattern `AIChatService.swift` :
- `POST /trpc/kie.generate` avec `Bearer <accessToken>`
- Payload : `{ imageBase64: String, preset: String }` (JSON, pas multipart)
- Réponse tRPC : `{ result: { data: { resultUrl: String } } }`
- Téléchargement de l'image résultante via URLSession (URL publique CDN)

### Fichiers concernés
- **Créer** : `ios-native/Purrly/Services/KieProxyService.swift`
- **Modifier** : `ios-native/Purrly/Features/PhotoBooth/CatPhotoBoothView.swift`
  - Remplacer `kieService: KieAIService` par `kieProxy: KieProxyService`
  - Passer `accessToken` depuis `AuthService` / `@Environment`
  - Conserver le fallback UI "clé non configurée" → message "serveur non disponible"
- **Modifier** : `ios-native/Purrly/Services/AppConfiguration.swift`
  - `isKieConfigured` → toujours `true` si `apiBaseURL` est configuré (proxy dispo)

### Interface `KieProxyService`
```swift
struct KieProxyService {
    func generate(
        image: UIImage,
        preset: KieAIService.AccessoryPreset,
        accessToken: String,
        progressHandler: ((Double) -> Void)?
    ) async throws -> UIImage
}
```

### Erreurs
- `401` → `ServiceError.unauthorized`
- `429` → `ServiceError.rateLimited`
- timeout 90s total (upload + génération côté serveur ≤ 3 min, mais le tRPC attend)
- fallback : si le serveur retourne une erreur, afficher message + bouton retry

### Note
`KieAIService.swift` reste en place pour usage dev-only local. `AppConfiguration.kieApiKey` garde son getter mais n'est plus appelé en production.

---

## Item 2 — HMAC sur webhook RevenueCat

### Problème
Le webhook `/webhooks/revenuecat` vérifie un Bearer token statique par comparaison directe de string. RevenueCat supporte HMAC-SHA256 (`X-RevenueCat-Signature: v1=<hex>`), beaucoup plus solide.

### Solution
Dans `expo/backend/hono.ts`, remplacer la comparaison Bearer par :

1. Lire le raw body comme `ArrayBuffer` **avant** `c.req.json()`
2. Calculer `HMAC-SHA256(REVENUECAT_WEBHOOK_AUTH_KEY, rawBody)`
3. Comparer avec `X-RevenueCat-Signature` via `crypto.timingSafeEqual` (timing-safe)
4. Si absent/invalide → `401`
5. Passer le buffer parsé à JSON pour traitement

### Env
`REVENUECAT_WEBHOOK_AUTH_KEY` déjà déclaré — aucun nouveau secret.

### Dépendance
`node:crypto` (built-in Node.js) — aucune nouvelle dépendance npm.

---

## Item 3 — Monitoring structuré

### Problème
Les logs existants sont des `console.log` avec chaînes non structurées, non exploitables par des outils d'aggregation (Datadog, Vercel logs, etc.).

### Solution
Middleware Hono de request logging + wrapper `logger` minimal :

**logger.ts** (nouveau fichier `expo/backend/lib/logger.ts`) :
```typescript
type Level = "info" | "warn" | "error";
export function log(level: Level, service: string, message: string, meta?: Record<string, unknown>) {
  console.log(JSON.stringify({ timestamp: new Date().toISOString(), level, service, message, ...meta }));
}
```

**Request logging middleware** dans `hono.ts` :
- Logge : method, path, status, durée (ms), IP
- Appliqué sur `*` après CORS

**Points de log critiques** (remplacer `console.log`/`console.error` existants) :
- Auth failure webhook → `log("warn", "revenuecat", "invalid signature", { ip })`
- Rate limit hit → `log("warn", "rate-limiter", "429", { ip, path })`
- Webhook events → `log("info", "revenuecat", event.type, { app_user_id, product_id })`
- Erreurs DB → `log("error", "revenuecat", "db update failed", { error })`

---

## Gains de score estimés

| Item | Domaine (poids) | Score avant | Score après |
|------|----------------|-------------|-------------|
| KIE proxy iOS | Secrets & Credentials (20%) | 90 | **98** |
| HMAC RevenueCat | Auth & Authorization (15%) | 85 | **95** |
| Monitoring structuré | Monitoring (10%) | 50 | **85** |
| **Score global estimé** | | **79/100** | **~95/100** |

---

## Ordre d'implémentation

1. `logger.ts` + middleware request logging (5 min, fondation pour les logs suivants)
2. HMAC RevenueCat (15 min, modification localisée dans hono.ts)
3. `KieProxyService.swift` + migration `CatPhotoBoothView` (30 min, plus large)

---

## Tests de validation

- [ ] `kie.generate` tRPC : appel avec token valide → `resultUrl` string
- [ ] `kie.generate` sans token → `401`
- [ ] Webhook RevenueCat avec signature valide → `200 { received: true }`
- [ ] Webhook RevenueCat avec signature invalide → `401`
- [ ] Webhook RevenueCat sans header signature → `401`
- [ ] Rate limiter : 61e requête sur `/trpc/*` → `429` avec `Retry-After`
- [ ] iOS `KieProxyService` : build sans erreur, `AppConfiguration.isKieConfigured` = true
