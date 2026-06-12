# Purrly — iOS natif (SwiftUI, iOS 26, Liquid Glass)

Application native **SwiftUI** pour iOS 26, port du projet Expo `expo/` (Purrly / CatID — guide races & chats).

## Prérequis

| Outil | Version |
|-------|---------|
| Xcode | **26.x** (testé avec 26.5) |
| iOS Deployment Target | **26.0** |
| macOS | compatible avec Xcode 26 |

## Ouvrir et compiler

```bash
cd ios-native
cp RaceGuide/Resources/Secrets.xcconfig.example RaceGuide/Resources/Secrets.xcconfig
# Éditer Secrets.xcconfig avec vos clés Supabase / API

xcodegen generate
open RaceGuide.xcodeproj
```

Dans Xcode : schéma **RaceGuide**, simulateur **iPhone** (iOS 26), puis **Product → Run**.

### Ligne de commande

```bash
cd ios-native
xcodegen generate
xcodebuild \
  -project RaceGuide.xcodeproj \
  -scheme RaceGuide \
  -destination 'platform=iOS Simulator,name=iPhone 16' \
  -configuration Debug \
  build
```

## Configuration (`Secrets.xcconfig`)

| Clé | Description |
|-----|-------------|
| `SUPABASE_URL` | URL projet Supabase |
| `SUPABASE_ANON_KEY` | Clé **anon** (jamais la service role) |
| `RORK_API_BASE_URL` | Backend tRPC (ex. `http://localhost:3000`) |
| `VIP_EMAILS` | E-mails VIP séparés par des virgules |
| `DEMO_EMAIL` | Compte démo App Review |

Le fichier `Secrets.xcconfig` est ignoré par git — ne pas committer de secrets.

## Design Liquid Glass (L99)

- Matériau `.glassEffect()` sur cartes et boutons (iOS 26)
- `GlassEffectContainer` pour les listes de choix (langue)
- Repli `.ultraThinMaterial` si SDK &lt; 26
- Palette alignée sur `expo/constants/colors.ts` (obsidienne + or)

## Sécurité (checklist 007)

- Secrets uniquement via **xcconfig** → Info.plist, pas dans le code source
- Jetons de session dans le **Keychain** (`KeychainStore`)
- Pas de clé OpenAI / service role côté client
- Timeouts réseau sur l’assistant IA
- Auth Supabase optionnelle : mode local de dev si URL/anon non configurés

## Données embarquées

- `RaceGuide/Resources/breeds.json` — **96 races** exportées depuis `expo/constants/breeds.ts`
- Chats : persistance locale `UserDefaults` (équivalent `cats_data`)

## Onglets portés (shell principal)

| Onglet | Écran SwiftUI |
|--------|----------------|
| Accueil | `ScanHomeView` — hero, galerie, races |
| Mes Chats | `CatsListView` / détail / formulaire |
| Social | `CommunityHubView` — fil, événements |
| Assistant | `AssistantChatView` — chat + prompts |
| Plus | `MoreMenuView` — races, déconnexion |

Auth : `LoginView`, `SignupView`, `LanguageSelectView`.

## Fonctionnalités **non** encore portées

- Scanner IA complet (caméra live, résultat tRPC, partage)
- RevenueCat / abonnements
- Communauté Supabase (posts, chat, profils)
- Urgences, vétérinaires, carte, gamification
- Outils pratiques (rappels, budget, courses, premiers secours)
- Forum discussions, refuges, éleveurs
- Notifications push
- i18n complète (8 langues Expo) — FR prioritaire
- WidgetKit Liquid Glass
- Reste des ~200 races si le JSON complet n’est pas régénéré

Pour régénérer le catalogue :

```bash
cd expo && npx tsx -e "import { BREEDS } from './constants/breeds.ts'; import { writeFileSync, mkdirSync } from 'fs'; mkdirSync('../ios-native/RaceGuide/Resources', { recursive: true }); writeFileSync('../ios-native/RaceGuide/Resources/breeds.json', JSON.stringify(BREEDS));"
```
