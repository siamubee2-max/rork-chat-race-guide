# Purrly — Growth Bangers (natif iOS)

Suivi des améliorations « leader marché » ajoutées au port natif. Statut au build vert.

## 1. RevenueCat (monétisation) — ✅ code livré

Câblage natif complet (paywall stub → vrai tunnel d'achat).

**Fichiers** : `Services/SubscriptionService.swift`, `Services/AppConfiguration.swift`
(`revenueCatIOSKey`), `App/AppEnvironment.swift`, `Features/Subscription/PaywallView.swift`,
`Features/Auth/{LoginView,SignupView}.swift`, `Features/More/MoreMenuView.swift`,
`project.yml` (package SPM + Info.plist key), `Resources/Secrets.xcconfig(.example)`.

**Entitlement** : `premium` · **Offering** : `default` · identité = id Supabase (partagée avec Expo + webhook).

### Reste à faire (côté toi)
1. **Clé API** : remplacer `REVENUECAT_IOS_API_KEY = appl_REPLACE_…` dans
   `Purrly/Resources/Secrets.xcconfig` par la vraie clé `appl_…`
   (la même que `EXPO_PUBLIC_REVENUECAT_IOS_API_KEY` dans le `.env` Expo).
2. **Bundle aligné** ✅ : le natif est passé à `app.rork.chat-race-guide` (= app RevenueCat/ASC).
3. **Produits StoreKit** : créés dans App Store Connect (déjà référencés côté Expo) ;
   vérifier qu'ils sont rattachés à l'app RevenueCat iOS `app9e2825fcfe`.
4. **(Option) Paywalls pilotés à distance** : réactiver `RevenueCatUI` dans `project.yml`
   et remplacer le paywall custom par `.presentPaywall()` → A/B testing sans rebuild.

## 2. Scanner on-device Core ML — ✅ code livré (modèle à fournir)

`Services/BreedClassifierService.swift` (Vision + Core ML) branché en **fallback hors-ligne**
de `BreedScanService` (`Features/Scan/ScanResultView.swift`).

### ✅ Modèle livré (21 juin)
- **`Resources/CatBreedClassifier.mlmodel`** (68 Ko) — entraîné via **Create ML**
  (`MLImageClassifier`, scenePrint transfer-learning) sur **Oxford-IIIT Pet, 12 races
  de chats** (2400 images). Labels = ids du catalogue (`persian`, `siamese`, `bengal`,
  `maine-coon`, `ragdoll`, `sphynx`, `abyssinian`, `bombay`, `british-shorthair`,
  `egyptian-mau`, `russian-blue`, `birman`).
- Métriques : **97,9 % train / 84,2 % validation** ; vérifié via Vision **6/6 top-1**
  sur images de test, confiances ~1.00, labels = ids catalogue (mappés par `findBreed`).
- Xcode compile le `.mlmodel` en `.mlmodelc` au build (présent dans le bundle, vérifié).

### Pour étendre la couverture (au-delà des 12 races)
- Ré-entraîner sur un dataset plus large (ex. +races via images supplémentaires nommées
  par id catalogue) avec le même pipeline Create ML. Les races hors-modèle continuent
  d'utiliser le scan cloud (dégradation propre déjà en place).

## 3. Engagement : Widget + App Intents — ✅ code livré

- **App Intents** : `App/PurrlyAppIntents.swift` (`ScanCatIntent` + `PurrlyShortcuts`)
  → « Dis Siri, scanne mon chat », Spotlight, Raccourcis, bouton Action.
- **Routeur** : `App/AppRouter.swift` (onglet + `pendingScan`), consommé par
  `MainTabView` et `ScanHomeView`.
- **Widget** : target `PurrlyWidget` (`PurrlyWidget/`), familles small/medium,
  affiche nom du chat + prochain rappel + bouton scan ; tap → `purrly://scan`
  (géré par `onOpenURL` dans `PurrlyApp`).
- **Données partagées** : App Group `group.app.rork.chat-race-guide`
  (`Purrly/Shared/WidgetSnapshot.swift`), écrites par `AppEnvironment.updateWidgetSnapshot()`.

### Reste à faire (côté toi)
- **Capacité App Group** : activer `group.app.rork.chat-race-guide` sur l'App ID
  ET l'App ID du widget dans le portail Apple Developer (le build simulateur passe sans).
- Rafraîchir le snapshot aussi à l'ajout/suppression de rappels et de chats
  (appeler `environment.updateWidgetSnapshot()` après ces mutations) pour un widget toujours à jour.

## 4. PPP pricing francophonie — 📋 plan (exécution ASC requise)

Objectif : lever la conversion là où 14,99 €/mois est hors de portée (PPP bas).
Stratégie par territoire via App Store Connect → Tarifs → Prix par pays/région.

| Marché | Indice PPP approx. | Prix mensuel cible | Annuel cible |
|---|---|---|---|
| France / Belgique / Suisse / Canada | 1.0 (référence) | 14,99 € | 149,99 € |
| Maghreb (Maroc, Tunisie, Algérie) | ~0.35 | ≈ 5,49 € équiv. | ≈ 54,99 € |
| Afrique francophone (Sénégal, Côte d'Ivoire, Cameroun…) | ~0.30 | ≈ 4,99 € équiv. | ≈ 49,99 € |

Étapes :
1. ASC → ton app → **Tarifs et disponibilité** → choisir le prix de base FR.
2. Pour chaque abonnement (`premium_monthly`, `com.purrly.premium.yearly`, family/pro),
   définir des **prix manuels par territoire** (ne pas laisser la conversion auto Apple).
3. Idéalement automatiser via le skill `asc-ppp-pricing` (price import / price schedule) :
   prépare un CSV de prix par pays et applique-le.
4. Mesurer la conversion par région dans RevenueCat + PostHog avant/après.

> Exécution nécessite ton accès App Store Connect — dis-moi quand tu veux qu'on lance
> `asc-ppp-pricing` ensemble (j'ai besoin que tu sois connecté à ASC).

## 5. Skills ASO externes — 📋 commandes (à lancer toi-même)

Bloquées quand c'est l'agent qui installe un repo externe (garde-fou sécurité).
Lance-les toi-même (revue le contenu d'abord) :

```bash
npx skills add eronred/aso-skills@paywall-optimization -g -y
npx skills add eronred/aso-skills@monetization-strategy -g -y
```

Puis on s'en sert pour optimiser fiche App Store + écran paywall.

## 6. Rejet App Store 2.1(a) — diagnostic & resoumission

**Motif (soumission 14 avr. 2026, build 1.0.0 (29) — ancien build Expo) :**
> Guideline 2.1(a) Performance – App Completeness. « an error message showed
> upon launch and we were unable to proceed further. »
> Device reviewer : **iPad Air 11-inch (M3), iPadOS 26.4**, connexion active.

**Vérifié (21 juin) :** le **build natif** lancé sur le **même device** (iPad Air M3
simulateur) **démarre proprement** → écran de sélection de langue, aucune erreur.
Le code natif n'a ni `fatalError` ni alerte bloquante au lancement ; `bootstrap()`
dégrade proprement (réseau KO = message non bloquant, pas d'écran figé).
→ **Le natif corrige la cause du rejet.**

**Checklist resoumission :**
1. Soumettre le **build natif** (pas l'Expo) — c'est lui qui passe le lancement iPad.
2. **Notes de vérification** : fournir un **compte démo fonctionnel**
   (ex. `demo@purrly.app` + mot de passe) pour que le reviewer dépasse le login,
   sinon risque « unable to proceed » même sans bug.
3. Vérifier le rendu iPad de chaque écran clé (portrait verrouillé = OK App Store).
4. Tester sur iPad **après install propre** (désinstaller toute version précédente).

## 7. PPP pricing — tableau prêt-à-appliquer (À FAIRE quand l'app est live)

Prix de base FR = 14,99 €/mois, 149,99 €/an. Appliquer des prix manuels par
territoire (désactiver la conversion auto Apple). Équivalents indicatifs :

| Territoire | premium_monthly | premium_yearly |
|---|---|---|
| 🇫🇷🇧🇪🇨🇭🇨🇦🇱🇺 (référence) | 14,99 € | 149,99 € |
| 🇲🇦 Maroc / 🇹🇳 Tunisie / 🇩🇿 Algérie | ≈ 5,49 € | ≈ 54,99 € |
| 🇸🇳🇨🇮🇨🇲🇧🇫🇲🇱 Afrique francophone | ≈ 4,99 € | ≈ 49,99 € |

Même logique (×0,33–0,37) pour family_* et pro_*. Exécution = App Store Connect,
produit par produit (autorisation explicite requise — commerce live).

## 8. Mismatch d'IDs produits RevenueCat ↔ ASC — ✅ RÉSOLU (21 juin)

**Diagnostic (live RevenueCat, projet « cat » c539013d) :** 5 des 6 produits iOS
référençaient des ids `com.purrly.*` (premium.yearly, family.monthly/yearly,
pro.monthly/yearly) **inexistants** dans le groupe ASC canonique « Purrly Premium »
(qui utilise les formes courtes). Seul `premium_monthly` matchait. Conséquence :
sur iOS, seul le mensuel premium se résolvait ; annuel/family/pro auraient échoué.
(Les `com.purrly.*` existaient dans un **2ᵉ groupe ASC doublon « Premium_Plan »**.)

**Correctif appliqué (convention = ids courts) :**
1. Créé 5 produits iOS courts (`premium_yearly`, `family_monthly`, `family_yearly`,
   `pro_monthly`, `pro_yearly`) et attachés à l'entitlement `premium`.
2. Offering `default` : les 6 packages repointés sur les ids courts iOS
   (0 `com.purrly.*` restant — vérifié).
3. Config locale alignée (`revenuecat.json`, `subscriptions.ts`).

**Reste optionnel (non bloquant) :**
- Désactiver les 5 anciens produits `com.purrly.*` iOS (Products → ⋯ → Make Inactive) —
  cosmétique, ils sont déjà hors de l'offering.
- Configurer la **clé In-App Purchase (.p8)** de l'app iOS dans RevenueCat
  (ASC → Users and Access → Integrations → In-App Purchase) pour lever les
  statuts « Could not check » et activer la validation StoreKit 2.
- Groupe ASC doublon « Premium_Plan » : laissé inactif (Apple interdit la suppression
  d'abonnements).
