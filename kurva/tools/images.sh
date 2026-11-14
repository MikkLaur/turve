#!/usr/bin/env bash
# Kurva Nokitseb: the whole photo pipeline, re-runnable. Everything runs locally; nothing is uploaded.
#
#   tools/images.sh process [id ...]   cut -> straighten (+3:4 crop) -> retouch -> upscale -> grade
#   tools/images.sh export  [id ...]   AVIF + WebP at 1600/1200/800/480 into site/img/ (never wider than the source)
#   tools/images.sh verify             no metadata left in any output (identify -verbose, AVIF too)
#   tools/images.sh sheets             contact sheets into shots/
#   tools/images.sh all                everything above
#
# Per-photo settings: tools/crops.txt. Sources: previous-kurva-work/ (override with KURVA_SRC).
# Needs: python3 + opencv + numpy, ImageMagick 7, avifenc, Real-ESRGAN in ~/.local/opt/realesrgan.
set -euo pipefail
cd "$(dirname "$0")"
ROOT="$(cd .. && pwd)"
cmd="${1:-all}"; shift || true
ids=("$@"); [ ${#ids[@]} -eq 0 ] && ids=(all)
py() { python3 -I pipeline.py "$@"; }

process() { for s in cut straighten retouch upscale grade; do py "$s" "${ids[@]}"; done; }
export_() { py export "${ids[@]}"; py export_aliases all; }
verify() { bash ./verify.sh; }
sheets() { bash ./sheets.sh; }

case "$cmd" in
  process) process ;;
  export)  export_ ;;
  verify)  verify ;;
  sheets)  sheets ;;
  all)     process; export_; verify; sheets ;;
  *) sed -n '2,12p' "$0"; exit 2 ;;
esac
