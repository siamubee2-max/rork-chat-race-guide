#!/usr/bin/env python3
"""Génère les CSV d'import Postiz à partir de docs/social/PURRLY_100_PROMPTS_EN.md.

Sortie :
  - docs/social/postiz_import.csv   : format natif Postiz (content, schedule_date, integration_id)
  - docs/social/postiz_planning.csv : vue planning humaine (colonnes détaillées)

Cadence : Lun 2R+1S · Mar 2R · Mer 2R · Jeu 2R+1S · Ven 2R+1S · Sam 2R+1S · Dim 1R+1S.
Une ligne US et une ligne UK par contenu. Marché + format encodés dans integration_id.
"""
import csv
import re
from datetime import date, timedelta
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / "docs/social/PURRLY_100_PROMPTS_EN.md"
OUT_IMPORT = ROOT / "docs/social/postiz_import.csv"
OUT_PLAN = ROOT / "docs/social/postiz_planning.csv"

# Lundi de la semaine 1 (le doc démarre la programmation le lundi suivant 2026-07-24).
BASE_MONDAY = date(2026, 7, 27)
assert BASE_MONDAY.weekday() == 0, "BASE_MONDAY doit être un lundi"

DAY_OFFSET = {"Lun": 0, "Mar": 1, "Mer": 2, "Jeu": 3, "Ven": 4, "Sam": 5, "Dim": 6}

# Heures UTC par slot (à ajuster selon le fuseau cible dans l'UI Postiz).
def slot_time(day: str, slot_label: str) -> str:
    if "Reel A" in slot_label:
        return "13:00"
    if "Reel B" in slot_label:
        return "19:00"
    if "Story" in slot_label:
        return "18:00" if day == "Dim" else "16:00"
    # Reel simple (dimanche)
    return "15:00"


def main() -> None:
    text = SRC.read_text(encoding="utf-8")
    lines = text.splitlines()

    week = 0
    blocks = []  # (num, day, slot_label, fmt, us, uk, hashtags, hook, week)
    cur = None

    week_re = re.compile(r"^#\s*SEMAINE\s+(\d+)")
    head_re = re.compile(r"^\*\*#(\d+)\s+—\s+\[([^\]]+)\]")
    us_re = re.compile(r"🇺🇸\s*US\s*:\s*[\"“](.*)[\"”]")
    uk_re = re.compile(r"🇬🇧\s*UK\s*:\s*[\"“](.*)[\"”]")
    hook_re = re.compile(r"🪝\s*Hook[^:]*:\s*(.*)")
    tag_re = re.compile(r"#️⃣\s*(.*)")

    def flush():
        if cur and cur.get("us") and cur.get("uk"):
            blocks.append(cur)

    for ln in lines:
        wm = week_re.match(ln)
        if wm:
            week = int(wm.group(1))
            continue
        hm = head_re.match(ln)
        if hm:
            flush()
            bracket = hm.group(2)
            parts = [p.strip() for p in bracket.split("·")]
            day = parts[0]
            slot_label = parts[1] if len(parts) > 1 else ""
            fmt = "Story" if "Story" in slot_label else "Reel"
            cur = {
                "num": int(hm.group(1)), "day": day, "slot": slot_label,
                "fmt": fmt, "week": week, "us": "", "uk": "",
                "hashtags": "", "hook": "",
            }
            continue
        if cur is None:
            continue
        m = us_re.search(ln)
        if m:
            cur["us"] = m.group(1).strip()
            continue
        m = uk_re.search(ln)
        if m:
            cur["uk"] = m.group(1).strip()
            continue
        m = hook_re.search(ln)
        if m and not cur["hook"]:
            cur["hook"] = m.group(1).strip().strip("*")
            continue
        m = tag_re.search(ln)
        if m:
            payload = m.group(1).strip()
            cur["hashtags"] = "" if payload.startswith("(") else payload
            continue
    flush()

    assert len(blocks) == 100, f"attendu 100 blocs, trouvé {len(blocks)}"

    import_rows = []
    plan_rows = []
    for b in blocks:
        t = slot_time(b["day"], b["slot"])
        d = BASE_MONDAY + timedelta(days=(b["week"] - 1) * 7 + DAY_OFFSET[b["day"]])
        schedule = f"{d.isoformat()}T{t}:00Z"
        for market, caption in (("US", b["us"]), ("UK", b["uk"])):
            integ = f"IG_{'REELS' if b['fmt'] == 'Reel' else 'STORY'}_{market}"
            if b["fmt"] == "Reel" and b["hashtags"]:
                content = f"{caption}\n\n{b['hashtags']}"
            else:
                content = caption
            import_rows.append([content, schedule, integ])
            plan_rows.append([
                b["num"], b["week"], b["day"], d.isoformat(), f"{t}Z",
                b["fmt"], b["slot"], market, integ, schedule, b["hook"], content,
            ])

    assert len(import_rows) == 200, f"attendu 200 lignes, trouvé {len(import_rows)}"

    with OUT_IMPORT.open("w", newline="", encoding="utf-8") as f:
        w = csv.writer(f, quoting=csv.QUOTE_ALL)
        w.writerow(["content", "schedule_date", "integration_id"])
        w.writerows(import_rows)

    with OUT_PLAN.open("w", newline="", encoding="utf-8") as f:
        w = csv.writer(f, quoting=csv.QUOTE_ALL)
        w.writerow([
            "post_id", "week", "day", "date", "time_utc", "format", "slot",
            "market", "integration_id", "schedule_date", "hook", "content",
        ])
        w.writerows(plan_rows)

    print(f"OK — {len(import_rows)} lignes (100 contenus × US/UK)")
    print(f"  {OUT_IMPORT.relative_to(ROOT)}")
    print(f"  {OUT_PLAN.relative_to(ROOT)}")


if __name__ == "__main__":
    main()
