# Purrly — landing page web (SEO)

Page d'atterrissage statique, déployable telle quelle sur `purrly.app`.

## Contenu
- `index.html` — page FR (locale principale)
- `en/index.html` — page EN
- `assets/og-image.png` — image Open Graph 1200×630 (partage social)
- `robots.txt`, `sitemap.xml`

## SEO embarqué
- `<title>` + meta description optimisées (FR/EN), `canonical`, `hreflang` fr/en/x-default
- Open Graph + Twitter Card (aperçu riche au partage)
- JSON-LD `MobileApplication` (schema.org) avec lien App Store `id6758865155`
- Smart App Banner iOS (`apple-itunes-app`)

## Déploiement
Statique pur — déployable sur Vercel, Netlify, Cloudflare Pages ou tout hébergeur :
servir le dossier `web/` à la racine de `purrly.app`. Les routes `/terms` et
`/privacy` (référencées dans le footer + métadonnées App Store) restent à créer.

> ⚠️ Vérifie l'ID App Store (`6758865155`) et l'URL apps.apple.com avant mise en ligne.
