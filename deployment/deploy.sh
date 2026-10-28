#!/usr/bin/env bash
# Deploys the API (and optionally the public site and the admin panel) to the turve.ee Zone.eu VM.
# Run on your local machine from the repository.
#   ./deployment/deploy.sh --preflight   read-only checks on the VM (versions, folders, PM2, loopback IP, DB port)
#   ./deployment/deploy.sh --dry-run     build locally and show what would be uploaded; changes nothing remotely
#   ./deployment/deploy.sh [--yes]       dry run, confirm, upload, build, migrate, restart, health check
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
CONFIG_FILE="${DEPLOY_CONFIG:-$SCRIPT_DIR/deployment.config}"
MODE="${1:-}"

die() { echo "ERROR: $*" >&2; exit 1; }

[ -f "$CONFIG_FILE" ] || die "Missing $CONFIG_FILE – copy deployment.config.dist and fill it in."
# shellcheck source=/dev/null
source "$CONFIG_FILE"

: "${SSH_PORT:=22}"
: "${REMOTE_ROOT:=domeenid/www.turve.ee}"
: "${PM2_APP:=turve}"
: "${NODE_ENV:=production}"
: "${PORT:=3000}"
: "${HEALTH_HOST:=}"
: "${DEPLOY_STATIC:=}"
: "${ALLOW_CONTENT_TODO:=false}"

for key in SSH_USER SSH_HOST; do
  [ -n "${!key:-}" ] || die "$key is not set in $CONFIG_FILE"
done
case "$REMOTE_ROOT" in
  '' | /* | *..*) die "REMOTE_ROOT must be a relative path under the remote home directory, without '..'." ;;
esac
TARGET="$SSH_USER@$SSH_HOST"
SSH=(ssh -p "$SSH_PORT" -o ConnectTimeout=15)

# ---------------------------------------------------------------- preflight (read-only)
if [ "$MODE" = "--preflight" ]; then
  echo "==> Read-only checks on $TARGET (nothing is changed)"
  "${SSH[@]}" "$TARGET" bash -ls -- "$REMOTE_ROOT" "$PM2_APP" "${DB_HOST:-}" "${DB_PORT:-3306}" "$PORT" <<'REMOTE'
ROOT="$HOME/$1"; APP="$2"; DB_HOST="$3"; DB_PORT="$4"; PORT="$5"
echo "node:  $(command -v node >/dev/null && node --version || echo MISSING)   (need >= 20.12)"
echo "npm:   $(command -v npm >/dev/null && npm --version || echo MISSING)"
echo "pm2:   $(command -v pm2 >/dev/null && pm2 --version 2>/dev/null | tail -1 || echo MISSING)"
echo "rsync: $(command -v rsync >/dev/null && echo ok || echo MISSING)"
echo "--- $ROOT"
if [ -d "$ROOT" ]; then ls -la "$ROOT" | awk 'NR>1 {print "  " $1 "  " $NF}'; else echo "  does not exist"; fi
for dir in htdocs kapsaaed api server; do
  if [ -d "$ROOT/$dir" ]; then echo "  $dir/: $(find "$ROOT/$dir" -mindepth 1 -maxdepth 1 | wc -l) entries: $(find "$ROOT/$dir" -mindepth 1 -maxdepth 1 -printf '%f ' | head -c 200)"; else echo "  $dir/: missing"; fi
done
echo "--- PM2 app '$APP'"
pid="$(pm2 pid "$APP" 2>/dev/null | tr -d '[:space:]')"
if [ -n "$pid" ] && [ "$pid" != "0" ]; then echo "  running (pid $pid)"; elif [ "$pid" = "0" ]; then echo "  registered but stopped"; else echo "  not registered yet"; fi
echo "--- who listens on port $PORT (the address shown is HEALTH_HOST)"
listening="$( (ss -ltnH 2>/dev/null || netstat -ltn 2>/dev/null) | awk -v p=":$PORT" '$4 ~ p"$" {print "  " $4}')"
echo "${listening:-  nothing yet (the app is not running)}"
# Probe with Node: unlike bash's /dev/tcp it tells apart "no such name", "refused" and "timeout".
probe() {
  node -e '
    const [host, port] = process.argv.slice(1);
    require("dns").lookup(host, (err, address) => {
      if (err) { console.log(`  ${host}: name does not resolve (${err.code})`); return; }
      const s = require("net").connect({ host: address, port: Number(port), timeout: 6000 });
      s.on("connect", () => { console.log(`  ${host}:${port} (${address}) open`); s.destroy(); });
      s.on("timeout", () => { console.log(`  ${host}:${port} (${address}) TIMEOUT – a firewall drops it`); s.destroy(); });
      s.on("error", (e) => console.log(`  ${host}:${port} (${address}) ${e.code}`));
    });' "$1" "$2"
}
echo "--- outbound control test"
probe one.one.one.one 443
if [ -n "$DB_HOST" ]; then
  echo "--- DB server from the VM"
  probe "$DB_HOST" "$DB_PORT"
fi
REMOTE
  exit 0
fi

# ---------------------------------------------------------------- deploy
for key in DB_HOST DB_NAME DB_USER DB_PASSWORD TOTP_ENC_KEY FORM_TOKEN_SECRET SITE_ORIGIN PUBLIC_ORIGINS ADMIN_ORIGIN; do
  [ -n "${!key:-}" ] || die "$key is not set in $CONFIG_FILE"
done
[ "${#FORM_TOKEN_SECRET}" -ge 32 ] || die "FORM_TOKEN_SECRET must be at least 32 characters."
[ "${#TOTP_ENC_KEY}" -eq 43 ] || die "TOTP_ENC_KEY must be 32 random bytes in base64url (43 characters)."
[ -n "$HEALTH_HOST" ] || echo "WARNING: HEALTH_HOST is empty – the health check after restart is skipped. Run --preflight to find it."

for path in server/package.json server/package-lock.json; do
  [ -f "$REPO_ROOT/$path" ] || die "Missing $REPO_ROOT/$path"
done
[ -f "$SCRIPT_DIR/start.sh" ] || die "Missing $SCRIPT_DIR/start.sh"
command -v rsync >/dev/null || die "rsync is required locally."

for part in $DEPLOY_STATIC; do
  case "$part" in
    site | kapsaaed) ;;
    *) die "Unknown DEPLOY_STATIC part '$part' (use 'site' and/or 'kapsaaed')." ;;
  esac
done

umask 077
ENV_DIR="$(mktemp -d)"
trap 'rm -rf "$ENV_DIR"' EXIT

# Writes the listed config variables (unset/empty ones skipped) as KEY='value' lines.
write_env() {
  local file="$1"; shift
  local key value
  : > "$file"
  for key in "$@"; do
    value="${!key:-}"
    [ -n "$value" ] || continue
    case "$value" in
      *"'"* | *$'\n'*) die "$key contains a single quote or newline, which can't be written to .env safely." ;;
    esac
    printf "%s='%s'\n" "$key" "$value" >> "$file"
  done
}

write_env "$ENV_DIR/server.env" \
  NODE_ENV PORT \
  DB_HOST DB_PORT DB_NAME DB_USER DB_PASSWORD DB_CONNECTION_LIMIT \
  TOTP_ENC_KEY FORM_TOKEN_SECRET SITE_ORIGIN PUBLIC_ORIGINS ADMIN_ORIGIN CHECK_DNS_SERVERS

if [[ " $DEPLOY_STATIC " == *" site "* ]]; then
  echo "==> Building the public site locally"
  # --strict fails while content TODOs remain (empty company details, placeholder bio), so they can't go live by accident.
  strict=(--strict)
  [ "$ALLOW_CONTENT_TODO" = "true" ] && strict=()
  (cd "$REPO_ROOT/site" && npm ci --no-audit --no-fund && npx tsx src/build.ts "${strict[@]}") ||
    die "Site build failed. If it lists content TODOs, fill them in (or set ALLOW_CONTENT_TODO='true' to publish anyway)."
fi

sync_all() {
  local flags=(-az --itemize-changes -e "ssh -p $SSH_PORT")
  [ "$1" = dry ] && flags+=(--dry-run)
  local code_excludes=(--exclude node_modules/ --exclude dist/ --exclude .env --exclude .DS_Store)

  echo "--- server/"
  rsync "${flags[@]}" --delete "${code_excludes[@]}" --exclude /start.sh \
    "$REPO_ROOT/server/" "$TARGET:$REMOTE_ROOT/server/"
  rsync "${flags[@]}" "$SCRIPT_DIR/start.sh" "$TARGET:$REMOTE_ROOT/server/start.sh"
  rsync "${flags[@]}" "$ENV_DIR/server.env" "$TARGET:$REMOTE_ROOT/server/.env"

  local part
  for part in $DEPLOY_STATIC; do
    case "$part" in
      site)
        echo "--- site/dist/ → htdocs/"
        # The site is fully generated, so stale files are deleted. Let's Encrypt challenges are kept.
        rsync "${flags[@]}" --delete --filter 'P /.well-known/acme-challenge/' --exclude .DS_Store \
          "$REPO_ROOT/site/dist/" "$TARGET:$REMOTE_ROOT/htdocs/"
        ;;
      kapsaaed)
        echo "--- kapsaaed/"
        rsync "${flags[@]}" --delete --filter 'P /.well-known/acme-challenge/' --exclude .DS_Store \
          "$REPO_ROOT/kapsaaed/" "$TARGET:$REMOTE_ROOT/kapsaaed/"
        ;;
    esac
  done
}

echo "==> Changes that would be uploaded to $TARGET:$REMOTE_ROOT (dry run)"
echo "    Check for '*deleting' lines before you confirm."
sync_all dry

if [ "$MODE" = "--dry-run" ]; then
  echo "==> Dry run only – nothing was changed."
  exit 0
fi
if [ "$MODE" != "--yes" ]; then
  read -r -p "Apply these changes, migrate the DB and restart PM2 app '$PM2_APP'? [y/N] " answer
  case "$answer" in y | Y) ;; *) die "Aborted – nothing was changed." ;; esac
fi

echo "==> Uploading"
sync_all real

echo "==> Building, migrating and restarting on $SSH_HOST"
# Login shell: pm2/npm from /opt/zse/bin are only on PATH there.
"${SSH[@]}" "$TARGET" bash -ls -- "$REMOTE_ROOT" "$PM2_APP" "$PORT" "$HEALTH_HOST" <<'REMOTE'
set -euo pipefail
ROOT="$HOME/$1"
APP="$2"
PORT="$3"
HEALTH_HOST="$4"
export TZ=UTC

node -e 'const [a,b]=process.versions.node.split(".").map(Number); process.exit(a>20||(a===20&&b>=12)?0:1)' ||
  { echo "ERROR: Node $(node --version) on the VM is too old; select Node 20.12+ in the Zone panel." >&2; exit 1; }

chmod 600 "$ROOT/server/.env"
chmod +x "$ROOT/server/start.sh"

echo "--- API: install + build"
cd "$ROOT/server"
npm ci --include=dev --no-audit --no-fund
npm run build

echo "--- DB migrations"
npm run migrate

pid="$(pm2 pid "$APP" 2>/dev/null | tr -d '[:space:]')"
if [ -z "$pid" ]; then
  cat <<EOF

FIRST DEPLOY: the code is uploaded, built and the database is migrated, but PM2 has no app '$APP' yet.
In the Zone panel, add the Node.js/PM2 app:
  name:          $APP
  start script:  $ROOT/server/start.sh
  port:          $PORT
  domain:        api.turve.ee (proxy to the app)
Then run ./deployment/deploy.sh --preflight to find HEALTH_HOST, and deploy again.
EOF
  exit 3
fi

echo "--- Restarting PM2 app $APP"
pm2 restart "$APP"

if [ -n "$HEALTH_HOST" ]; then
  echo "--- Health check"
  curl -fsS -o /dev/null --retry 15 --retry-delay 2 --retry-connrefused "http://$HEALTH_HOST:$PORT/api/health"
  echo "API is up."
else
  echo "--- Health check skipped (HEALTH_HOST not set)"
fi
REMOTE

echo "==> Deploy finished."
