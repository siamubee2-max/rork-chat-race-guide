#!/usr/bin/env bash
#
# capture-both.sh — captures App Store pour iPhone 6.9" ET iPad 13"
# (étend capture-screenshots.sh, qui ne faisait que l'iPhone).
# Pilote SnapshotHelper via xcodebuild test (fastlane snapshot casse sous Xcode 26).
# Sortie : fastlane/screenshots/<locale>/<device>-<NN><nom>.png
# deliver assigne ensuite chaque image au bon emplacement App Store via sa résolution.

set -euo pipefail
cd "$(dirname "$0")/.."   # ios-native

SCHEME="Purrly"
PROJECT="Purrly.xcodeproj"
CACHE="$HOME/Library/Caches/tools.fastlane"
OUT="fastlane/screenshots"

# device label (préfixe fichier) : nom du simulateur
declare -a DEVICES=("iphone:iPhone 17 Pro Max" "ipad:iPad Pro 13-inch (M5)")
declare -a LANGS=("fr-FR:fr_FR" "en-US:en_US")

mkdir -p "$CACHE/screenshots"

for dpair in "${DEVICES[@]}"; do
  dlabel="${dpair%%:*}"; dname="${dpair##*:}"
  UDID=$(xcrun simctl list devices available | grep -F "$dname (" | head -1 | grep -oE '[0-9A-F-]{36}')
  if [[ -z "${UDID:-}" ]]; then echo "❌ Simulateur '$dname' introuvable."; exit 1; fi
  echo "📱 $dlabel — $dname ($UDID)"
  xcrun simctl boot "$UDID" 2>/dev/null || true
  xcrun simctl bootstatus "$UDID" -b >/dev/null 2>&1 || true
  xcrun simctl status_bar "$UDID" override --time "09:41" --batteryState charged --batteryLevel 100 --cellularBars 4 --wifiBars 3 2>/dev/null || true

  for pair in "${LANGS[@]}"; do
    lang="${pair%%:*}"; loc="${pair##*:}"
    echo "  🌍 $lang…"
    rm -f "$CACHE/screenshots/"*.png 2>/dev/null || true
    printf '%s' "$lang" > "$CACHE/language.txt"
    printf '%s' "$loc"  > "$CACHE/locale.txt"
    printf ''           > "$CACHE/snapshot-launch_arguments.txt"

    xcodebuild test \
      -project "$PROJECT" -scheme "$SCHEME" \
      -destination "platform=iOS Simulator,id=$UDID" \
      -only-testing:PurrlyUITests/PurrlyScreenshots \
      >/dev/null 2>&1 || { echo "  ❌ test échoué ($dlabel/$lang)"; exit 1; }

    dest="$OUT/$lang"; mkdir -p "$dest"
    # on NE vide PAS le dossier : on garde l'autre device, on préfixe par device
    rm -f "$dest/${dlabel}-"*.png 2>/dev/null || true
    i=0
    for f in "$CACHE/screenshots/"*.png; do
      [[ -e "$f" ]] || continue
      name=$(basename "$f" | sed -E 's/^.*-([0-9]+[A-Za-z]+)\.png/\1/')
      cp "$f" "$dest/${dlabel}-${name}.png"
      i=$((i+1))
    done
    echo "     ✅ $i captures → $dest (${dlabel}-*)"
  done
  xcrun simctl status_bar "$UDID" clear 2>/dev/null || true
done

echo "🎉 Terminé — iPhone 6.9\" + iPad 13\" dans fastlane/screenshots/."
