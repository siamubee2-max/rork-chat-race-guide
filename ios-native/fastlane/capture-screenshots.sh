#!/usr/bin/env bash
#
# capture-screenshots.sh — génère les captures App Store en pilotant
# SnapshotHelper directement via xcodebuild.
#
# Pourquoi ce script plutôt que `fastlane screenshots` ?
# fastlane 2.234 + Xcode 26 plante dans la résolution de simulateur
# (gem `simctl` : `undefined method 'name'`). Ce script reproduit ce que
# fait snapshot en interne (cache tools.fastlane + xcodebuild test) sans
# passer par le code de device cassé. Le Snapfile/Fastfile restent valides
# pour les environnements où fastlane fonctionne.
#
# Usage : ./fastlane/capture-screenshots.sh
# Sortie : fastlane/screenshots/<locale>/<NN>-<nom>.png

set -euo pipefail
cd "$(dirname "$0")/.."   # ios-native

DEVICE_NAME="iPhone 17 Pro Max"   # 6.9" requis par l'App Store
SCHEME="Purrly"
PROJECT="Purrly.xcodeproj"
CACHE="$HOME/Library/Caches/tools.fastlane"
OUT="fastlane/screenshots"

# locale d'app -> dossier deliver
declare -a LANGS=("fr-FR:fr_FR" "en-US:en_US")

UDID=$(xcrun simctl list devices available | grep -F "$DEVICE_NAME (" | head -1 | grep -oE '[0-9A-F-]{36}')
if [[ -z "${UDID:-}" ]]; then echo "❌ Simulateur '$DEVICE_NAME' introuvable."; exit 1; fi
echo "📱 Device: $DEVICE_NAME ($UDID)"

xcrun simctl boot "$UDID" 2>/dev/null || true
xcrun simctl bootstatus "$UDID" -b >/dev/null 2>&1 || true
# Barre d'état propre (heure 9:41, batterie/réseau pleins)
xcrun simctl status_bar "$UDID" override --time "09:41" --batteryState charged --batteryLevel 100 --cellularBars 4 --wifiBars 3 2>/dev/null || true

mkdir -p "$CACHE/screenshots"

for pair in "${LANGS[@]}"; do
  lang="${pair%%:*}"; loc="${pair##*:}"
  echo "🌍 Capture $lang…"
  rm -f "$CACHE/screenshots/"*.png 2>/dev/null || true
  printf '%s' "$lang" > "$CACHE/language.txt"
  printf '%s' "$loc"  > "$CACHE/locale.txt"
  printf ''           > "$CACHE/snapshot-launch_arguments.txt"

  xcodebuild test \
    -project "$PROJECT" -scheme "$SCHEME" \
    -destination "platform=iOS Simulator,id=$UDID" \
    -only-testing:PurrlyUITests/PurrlyScreenshots \
    >/dev/null 2>&1 || { echo "❌ test échoué pour $lang"; exit 1; }

  dest="$OUT/$lang"; mkdir -p "$dest"; rm -f "$dest/"*.png 2>/dev/null || true
  i=0
  for f in "$CACHE/screenshots/"*.png; do
    [[ -e "$f" ]] || continue
    name=$(basename "$f" | sed -E 's/^.*-([0-9]+[A-Za-z]+)\.png/\1/')
    cp "$f" "$dest/${name}.png"
    i=$((i+1))
  done
  echo "   ✅ $i captures → $dest"
done

xcrun simctl status_bar "$UDID" clear 2>/dev/null || true
echo "🎉 Terminé. Relisez fastlane/screenshots/ avant 'fastlane upload_screenshots'."
