#!/bin/bash
# Started by PM2; deploy.sh has already run "npm run build" and "npm run migrate".
set -euo pipefail
# DATETIME columns hold UTC; the mariadb driver uses the process time zone.
export TZ=UTC
cd "$HOME/domeenid/www.turve.ee/server"
exec node dist/server.js
