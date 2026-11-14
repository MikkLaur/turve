#!/usr/bin/env bash
# No metadata may survive in any output (the sources carry 8BIM/IPTC profiles from Facebook).
# identify -verbose may print only ImageMagick's own date: lines for the temp file; anything else fails.
cd "$(dirname "$0")/../site/img" || exit 1
bad=0; n=0
for f in *.avif *.webp; do
  n=$((n+1))
  out=$(identify -verbose "$f" 2>/dev/null | grep -iE 'profile|exif|xmp|iptc|8bim|date:create|comment' | grep -viE '^ *date:(create|modify|timestamp)' || true)
  # the grep above already drops date: lines; also look inside the bytes for the usual markers
  raw=$(grep -c -a -E 'Exif|<x:xmpmeta|8BIM|Photoshop 3.0|Adobe|http://ns.adobe.com' "$f" || true)
  if [ -n "$out" ] || [ "${raw:-0}" != "0" ]; then echo "METADATA in $f: $out (raw markers: $raw)"; bad=$((bad+1)); fi
done
echo "checked $n files, $bad with metadata"
[ "$bad" -eq 0 ]
