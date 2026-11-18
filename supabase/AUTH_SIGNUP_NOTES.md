# Auth / Inscription — réglage backend requis

Contexte du correctif associé (voir `ios-native/Purrly/Services/AuthService.swift`).

## Symptôme
À l'inscription (ou via le bouton « Compte démo »), l'app affichait
**« Invalid login credentials »**.

## Cause racine
Le projet Supabase de Purrly avait la **confirmation d'e-mail activée**
(`mailer_autoconfirm = false`). L'app crée le compte puis tente de se
connecter immédiatement ; tant que l'adresse n'est pas confirmée, cette
connexion est refusée → message d'erreur alors que le compte existe.

## Correctif appliqué sur le backend (non versionné — état serveur)
Appliqué sur le projet Supabase de Purrly (ref dans `Secrets.xcconfig`, non
committé) via l'API Management :

1. **Désactivation de l'exigence de confirmation d'e-mail**
   `PATCH /v1/projects/<REF>/config/auth` → `{ "mailer_autoconfirm": true }`
   Les nouvelles inscriptions sont auto-confirmées → `signUp` renvoie une
   session directement.
2. **Suppression** d'un compte test resté non confirmé (bloquait la
   réinscription avec la même adresse).
3. **Création du compte démo** `demo@purrly.app` avec `email_confirm: true`
   (le bouton « Compte démo » de `LoginView.swift` l'utilise ; mot de passe
   attendu par l'app : voir `LoginView.swift`, à garder aligné avec
   `expo/scripts/setup-demo-account.js`).

> ⚠️ Ne jamais committer de clé (`service_role`, token Management) ni l'URL /
> ref du projet. Tout passe par `Secrets.xcconfig` (gitignoré) ou l'API.

## Si l'on veut RÉACTIVER la confirmation d'e-mail
1. Remettre `mailer_autoconfirm = false`.
2. Configurer un SMTP (sinon les e-mails de confirmation ne partent pas).
3. S'assurer que l'app gère le cas « session absente après signUp » — c'est
   l'objet du correctif de `AuthService.signUp` (message « confirme ton
   e-mail » au lieu d'une erreur).

## Reproduire la vérification (sans secret en clair)
Avec un token Management en variable d'env :
```bash
REF=<project-ref>                      # depuis Secrets.xcconfig
# le proxy/les en-têtes fournissent l'Authorization — ne pas coller de token ici
curl -s "https://api.supabase.com/v1/projects/$REF/config/auth" \
  | python3 -c "import json,sys;print('autoconfirm=',json.load(sys.stdin)['mailer_autoconfirm'])"
```
Un `signUp` public doit renvoyer un `access_token` immédiatement.
