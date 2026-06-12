# Purrly iOS Native — Design Spec (Swift Conversion)

## Context

Conversion de l'app Expo/React Native vers 100% Swift natif. Une base Swift partielle existe déjà dans `ios-native/`. Ce doc intègre les corrections UX identifiées lors de la critique impeccable (score 20/40).

---

## Architecture

### App shell

- **Framework** : SwiftUI + `@Observable` (pattern déjà établi dans la base existante)
- **État global** : `AppEnvironment` (observable) injecté via `@Environment`
- **Backend** : Supabase SDK Swift pour auth + base de données
- **AI** : tRPC-style calls vers le backend Expo existant (`AIChatService`) — pas de migration backend dans ce scope
- **Persistance locale** : SwiftData pour chats, settings, historique chat assistant

### Navigation restructurée (décision UX)

5 tabs principaux :

```
Tab 1 — Scan       (ScanHomeView → CameraView → ResultView)
Tab 2 — Mes Chats  (CatsListView → CatDetailView → CatFormView)
Tab 3 — Urgence    (EmergencyHomeView → FirstAidView → VetsView → PoisonView)
Tab 4 — Social     (CommunityHubView → FeedView → EventsView → DiscussionsView)
Tab 5 — Plus       (MoreMenuView → AssistantView, GamificationView, PracticalView, Settings…)
```

**Rationale** : Emergency était à 3 taps, maintenant à 1. Social regroupe Community + Discussions. Assistant reste dans Plus car usage contextuel, pas primaire.

---

## Features — Gap à implémenter

La base Swift couvre : Breeds, Cats (CRUD), Auth, Community (stub), Scan (stub), Assistant (stub), More (stub).

**À implémenter complètement** :

| Feature | Screens Swift à créer | Priorité |
|---------|----------------------|----------|
| Emergency | EmergencyHomeView, FirstAidView, VetsMapView, PoisonGuideView | P0 — tab visible |
| Practical | ExpensesListView, ExpenseFormView, FirstAidGuideView | P1 |
| Gamification | GamificationDashboardView, BadgesView, ChallengesView | P1 |
| Discussions | DiscussionsListView, ThreadDetailView, NewThreadView | P2 |
| Subscription | PaywallView, SubscriptionStatusView | P0 — bloque free tier |
| Vets | VetsListView, VetDetailView, VetMapView | P1 |
| More sub-pages | AboutView, FAQView, PrivacyView, TermsView | P2 |

---

## Free Tier — Logique corrigée

**Avant (Expo)** : PremiumGate wraps entièrement Cats, Assistant, Community.

**Après (Swift)** :

```
Free tier:
- 1 profil de chat (ajout d'un 2e bloque → paywall doux)
- 15 messages IA / mois (compteur visible dans l'UI)
- Community en lecture seule (post/réponse → paywall)
- Breeds + Scan : illimité
- Emergency : illimité (éthique)

Premium:
- Chats illimités
- IA illimitée
- Community full (posts, events, messages)
- Gamification advanced
- Export dépenses
```

**Implémentation** : `UsageLimits` observable dans AppEnvironment, vérifié avant chaque action gated. Paywall = sheet modale avec bénéfice contextuel ("Tu as atteint la limite de messages IA ce mois-ci."), pas un écran bloquant au niveau tab.

---

## Design System Swift

Reprendre exactement les tokens Expo :

```swift
// AppTheme.swift
extension AppTheme {
    static let background = Color(hex: "0C0A09")
    static let backgroundSecondary = Color(hex: "171412")
    static let backgroundCard = Color(hex: "1C1917")
    static let primary = Color(hex: "D4A05C")
    static let primaryLight = Color(hex: "F7D596")
    static let text = Color(hex: "FDF9EF")
    static let textSecondary = Color(hex: "D6D3D1")
    static let textMuted = Color(hex: "78716C")
    static let border = Color(hex: "F7D596").opacity(0.15)
}
```

**Corrections visuelles appliquées** :
- Cards : `border` OU `shadow`, pas les deux. On garde `border` seul (cohérence avec le thème, pas de ghost-card).
- `cornerRadius(14)` sur les cards (vs 18 dans Expo).
- Paywall = sheet `.presentationDetents([.medium])`, pas plein écran.

---

## Tone

Calm + Headspace, pas fintech. Concrètement :
- Animations : `spring(response: 0.4, dampingFraction: 0.75)` — douces, pas rebondissantes
- Feedback haptic : `UIImpactFeedbackGenerator(.soft)` plutôt que `.rigid` pour les taps quotidiens
- Loading states : skeletons sur tous les async (pas de spinners seuls)
- Textes d'erreur : inline, formulaiques, bienveillants ("Vérifie ton email" pas "Invalid credentials")

---

## Out of Scope

- Migration du backend (tRPC + Supabase reste tel quel)
- App Android
- Widget iOS / Live Activities (phase 2)
- Internationalisation (maintenir le fr + en existants, pas d'ajout de locales)
