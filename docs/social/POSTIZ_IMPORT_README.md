# Import Postiz — 100 prompts Purrly (US/UK)

Deux fichiers générés depuis `PURRLY_100_PROMPTS_EN.md` par `scripts/gen_postiz_csv.py` :

| Fichier | Usage |
|---------|-------|
| `postiz_import.csv` | **Import machine** — format natif Postiz : `content, schedule_date, integration_id`. 200 lignes (100 contenus × US + UK). |
| `postiz_planning.csv` | **Vue humaine** (Google Sheets) — `post_id, week, day, date, time_utc, format, slot, market, integration_id, schedule_date, hook, content`. |

## 1. Remplacer les `integration_id`

Le CSV utilise 4 placeholders (marché + format). Récupère tes vrais IDs et remplace :

```bash
postiz integrations:list        # liste tes comptes connectés + leurs IDs
```

| Placeholder | À remplacer par l'ID de… |
|-------------|--------------------------|
| `IG_REELS_US` | ton compte Reels marché US |
| `IG_STORY_US` | ton compte Stories marché US |
| `IG_REELS_UK` | ton compte Reels marché UK |
| `IG_STORY_UK` | ton compte Stories marché UK |

Un seul compte global ? Mets le même ID partout (ou supprime les lignes du marché non utilisé).

```bash
# exemple de remplacement en masse
sed -i 's/IG_REELS_US/abcd-1234/g; s/IG_STORY_US/efgh-5678/g' postiz_import.csv
```

## 2. Importer (script robuste)

Le loop `while IFS=, read …` de la doc Postiz **casse** sur les virgules/retours-ligne des captions. Utilise plutôt un parsing CSV propre :

```bash
python3 - <<'PY'
import csv, subprocess
with open("docs/social/postiz_import.csv", encoding="utf-8") as f:
    for row in csv.DictReader(f):
        subprocess.run([
            "postiz", "posts:create",
            "-c", row["content"],
            "-s", row["schedule_date"],
            "-i", row["integration_id"],
            "-t", "draft",           # brouillon d'abord — vérifie puis passe en "schedule"
        ], check=True)
PY
```

Créés en `draft` : relis dans l'UI Postiz, puis active (`postiz posts:status <id> --status schedule`).

## 3. Médias (⚠️ obligatoire avant publication)

Postiz **n'accepte ni chemin local ni URL externe** dans un post : chaque visuel doit d'abord passer par `postiz upload`, puis on référence l'URL Postiz retournée. Le CSV ne contient que le texte — attache tes réels/photos par contenu avant de basculer les drafts en `schedule`.

## 4. Fuseau horaire

Les `schedule_date` sont en **UTC** (`…Z`), avec des heures indicatives (Reel A 13:00, Reel B 19:00, Story 16:00, dimanche 15:00/18:00). Ajuste selon l'heure locale de tes audiences US/UK — le plus simple est de recaler l'heure dans `scripts/gen_postiz_csv.py` (fonction `slot_time`) puis de régénérer :

```bash
python3 scripts/gen_postiz_csv.py
```

## Cadence & calendrier

- Départ : **lundi 27/07/2026**, fin : **mercredi 03/09/2026** (~5,5 semaines).
- Rythme : `Lun 2R+1S · Mar 2R · Mer 2R · Jeu 2R+1S · Ven 2R+1S · Sam 2R+1S · Dim 1R+1S`.
- Répartition : 73 réels US + 73 réels UK, 27 stories US + 27 stories UK = **200 lignes**.

## Avant diffusion

Vérifie les **prix réels** ($/£) et garde le claim officiel « 400+ breeds ». L'assistant IA **complète** le vétérinaire — jamais « diagnoses ».
