# Purrly — Étude de marché & stratégie de monétisation

> Préparé pour la fiche de distribution App Store. Données : juin 2026.

## 1. Synthèse exécutive

Purrly est une **super-app chat** (scanner IA de races, assistant véto, suivi
santé/dépenses, communauté, annuaire véto) ciblant la **francophonie**. Le marché
est porteur (apps pet ~2,8 Md$, +18 %/an) et la base féline française explose
(**16,6 M de chats, +29 % en 4 ans**). Les concurrents sont des **scanners
mono-fonction** vendus 5–13 $ — Purrly se différencie en **super-app** mais doit
**réaligner son prix d'entrée** (14,99 €/mois est ~3× le marché) via un **palier
d'appel plus bas + annuel mis en avant**.

## 2. Marché (TAM / SAM / SOM)

| Niveau | Définition | Estimation |
|---|---|---|
| **TAM** | Apps de soin animalier, mondial | **~2,8 Md$** (Europe ~784 M$), CAGR **~18 %** |
| **SAM** | Propriétaires de chats francophones, mobile | France : **16,6 M chats / 39 % des foyers** ; +Belgique, Suisse, Canada, Maghreb/Afrique franco. |
| **SOM (an 1)** | Part atteignable réaliste | 50–150 k installs, 3–5 % premium → **2–7 k abonnés** |

**Tendances favorables :**
- France **+29 % de chats** entre 2021 et 2025 (12,9 M → 16,6 M) ; cœur de cible
  **25-34 ans (60 % des possesseurs)**, urbain — exactement la cible Purrly.
- Bascule structurelle « plus de chats, moins de chiens » → demande croissante
  d'outils **félins spécialisés** (vs apps généralistes chien/chat).
- Adoption des apps santé + intégration véto/assurance en hausse en FR/DE/UK.

## 3. Concurrence

| App | Positionnement | Prix | Faiblesse exploitable |
|---|---|---|---|
| **Cat Scanner** (Siwalu) | Scanner de races (réf. du segment) | **24,99 $ one-time** | Mono-fonction, pas de santé/véto/communauté |
| **Cat Breed Identifier: Pet Scan** | Scanner races | **4,99 $/mois · 12,99 $/an · 2,49 $/sem** | Pubs, précision variable, mono-fonction |
| **Cat Scanner: Breed Identifier** | Scanner races | **5,99 $/semaine** | Prix au rythme hebdo agressif, mono-fonction |
| **11pets** | Gestion de soin (multi-animaux) | Freemium | Généraliste, UI fonctionnelle sans âme, pas de scanner IA |

**Constat clé :** personne ne combine **scanner IA + assistant véto + santé +
communauté + annuaire** dans une app féline francophone soignée. C'est le **« blue
ocean »** de Purrly — mais les ancres de prix du marché sont **basses (5–13 $)**.

## 4. Positionnement Purrly

- **Catégorie App Store** : Lifestyle (primaire) / Medical ou Reference (secondaire).
- **Angle** : « La super-app n°1 pour chats — remplace 6 outils dispersés. »
- **Vibe** : Calm/Headspace (sérénité, premium discret) — anti-référence : apps
  cliniques froides et apps pet beige sans âme.
- **Moat** : scanner **on-device Core ML** (instantané, hors-ligne, gratuit) +
  assistant IA + communauté francophone.

## 5. Stratégie de monétisation

### 5.1 Diagnostic du prix actuel
`premium 14,99 €/mois · 149,99 €/an` est **~3× le scanner-market** (4,99 €/mois).
Défendable en super-app, **mais** crée une friction d'entrée. Risque : conversion
freemium faible (~2 %) si la valeur n'est pas démontrée avant le paywall.

### 5.2 Recommandation — échelle de prix révisée
Garder la valeur perçue premium **tout en abaissant la barrière** :

| Forfait | Prix actuel | **Reco** | Rationnel |
|---|---|---|---|
| Premium mensuel | 14,99 € | **9,99 €** | Aligne sur la médiane subscription (~9,99 $) ; reste 2× le scanner-market (justifié super-app) |
| Premium annuel ⭐ | 149,99 € | **59,99 €** (-50 %) | **Annuel = produit phare** : ancre la valeur, ~5 €/mois ressenti, marge LTV |
| Family | 24,99 € | **89,99 €/an** | Multi-chats / foyer (éleveurs amateurs) |
| Pro | 49,99 € | **199,99 €/an** | Éleveurs / pros (gestion portées, visibilité annuaire) |

> **Essai gratuit 7 jours** sur l'annuel + **offre d'intro** (1er mois -50 %) pour
> doper la conversion (le free-trial double la conversion vs paywall sec).

### 5.3 Tactiques de conversion
1. **Confiance avant conversion** (principe produit n°5) : laisser **1 scan + 15
   questions IA gratuites** pour démontrer la valeur, paywall **après** le 1er résultat.
2. **Hard-ish paywall sur la 2ᵉ action premium** (extra-cat, post communauté) —
   le hard paywall convertit ~12 % vs ~2 % freemium (RevenueCat 2025).
3. **PPP par territoire** (déjà préparé) : Maghreb/Afrique franco. ×0,33–0,37.
4. **Paywall A/B testé** via RevenueCatUI (déjà câblable) — itérer prix/copie sans rebuild.
5. **Annuel par défaut** sur le paywall (toggle annuel pré-sélectionné, économie affichée).

### 5.4 Projection illustrative (an 1, hypothèses prudentes)
- 100 k installs · 4 % premium · panier moyen ~50 €/an (mix mensuel/annuel/PPP)
  → **~4 000 abonnés × 50 € ≈ 200 k€ ARR** (avant commission Apple 15–30 %).
- Levier principal = **rétention annuelle** (essai → annuel) et **ASO francophone**.

## 6. Lien fiche App Store
La copie marketing (titre, sous-titre, mots-clés, description) découle de ce
positionnement → voir [`APP_STORE_LISTING.md`](APP_STORE_LISTING.md).

---

### Sources
- Cat app pricing : App Store / Google Play listings (Cat Scanner, Cat Breed Identifier).
- Marché : USD Analytics / Cognitive Market Research (Pet Care Apps Market 2025, CAGR ~18 %).
- Conversion : RevenueCat — State of Subscription Apps 2025 (hard paywall 12,11 % vs freemium 2,18 %).
- France : FACCO/Odoxa 2025, I-CAD 2026 (16,6 M chats, 39 % des foyers, +29 %).
