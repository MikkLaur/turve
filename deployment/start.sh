#!/bin/bash
# Started by PM2; deploy.sh has already run "npm run build" and "npm run migrate".
set -euo pipefail
# DATETIME columns hold UTC; the mariadb driver uses the process time zone.
export TZ=UTC
# This file is uploaded as server/start.sh, so the API lives next to it.
cd "$(dirname "$(readlink -f "$0")")"
exec node dist/server.js
