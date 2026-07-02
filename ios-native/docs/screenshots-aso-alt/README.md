# Screenshots ASO — style alternatif (A/B)

Set **alternatif** aux `docs/screenshots-aso/` existants. Même contenu, style différent :

| | Set existant (`screenshots-aso/`) | Ce set (`-alt/`) |
|---|---|---|
| Style | Plein-cadre + bandeau bas | Device **cadré** + accroche **en haut** |
| Fond | Capture pleine | Dark/or "Calm", ombre portée |

12 visuels 6,9″ (1320×2868) : `fr-01..06`, `en-01..06`, accroche marketing par écran.
Générés depuis les captures brutes (`docs/screenshots/` FR, `fastlane/screenshots/en-US/` EN)
via Pillow. **À A/B tester** contre le set existant — adopter celui qui convertit le mieux.

> Rappel : certaines captures sous-jacentes montrent un **état vide** (ex. "Aucun chat").
> Re-`snapshot` avec données de démo peuplées avant soumission finale (Fastlane, sur Mac).
