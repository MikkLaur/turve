#!/usr/bin/env bash
# Deploys the API (and optionally the public site and the admin panel) to the turve.ee Zone.eu VM.
# Run on your local machine from the repository. Usage: ./deployment/deploy.sh [--yes]
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
CONFIG_FILE="${DEPLOY_CONFIG:-$SCRIPT_DIR/deployment.config}"
ASSUME_YES="${1:-}"

die() { echo "ERROR: $*" >&2; exit 1; }

[ -f "$CONFIG_FILE" ] || die "Missing $CONFIG_FILE – copy deployment.config.dist and fill it in."
# shellcheck source=/dev/null
source "$CONFIG_FILE"

: "${SSH_PORT:=22}"
: "${REMOTE_ROOT:=domeenid/www.turve.ee}"
: "${PM2_APP:=turve}"
: "${NODE_ENV:=production}"
: "${PORT:=3000}"
: "${DEPLOY_STATIC:=}"

for key in SSH_USER SSH_HOST HEALTH_HOST DB_HOST DB_NAME DB_USER DB_PASSWORD TOTP_ENC_KEY FORM_TOKEN_SECRET SITE_ORIGIN PUBLIC_ORIGINS ADMIN_ORIGIN; do
  [ -n "${!key:-}" ] || die "$key is not set in $CONFIG_FILE"
done
[ "${#FORM_TOKEN_SECRET}" -ge 32 ] || die "FORM_TOKEN_SECRET must be at least 32 characters."
[ "${#TOTP_ENC_KEY}" -eq 43 ] || die "TOTP_ENC_KEY must be 32 random bytes in base64url (43 characters)."

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

TARGET="$SSH_USER@$SSH_HOST"
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
  (cd "$REPO_ROOT/site" && npm ci --no-audit --no-fund && npm run build)
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

if [ "$ASSUME_YES" != "--yes" ]; then
  read -r -p "Apply these changes, migrate the DB and restart PM2 app '$PM2_APP'? [y/N] " answer
  case "$answer" in y | Y) ;; *) die "Aborted – nothing was changed." ;; esac
fi

echo "==> Uploading"
sync_all real

echo "==> Building, migrating and restarting on $SSH_HOST"
# Login shell: pm2/npm from /opt/zse/bin are only on PATH there.
ssh -p "$SSH_PORT" "$TARGET" bash -ls -- "$REMOTE_ROOT" "$PM2_APP" "$PORT" "$HEALTH_HOST" <<'REMOTE'
set -euo pipefail
ROOT="$HOME/$1"
APP="$2"
PORT="$3"
HEALTH_HOST="$4"
export TZ=UTC

chmod 600 "$ROOT/server/.env"
chmod +x "$ROOT/server/start.sh"

echo "--- API: install + build"
cd "$ROOT/server"
npm ci --include=dev --no-audit --no-fund
npm run build

echo "--- DB migrations"
npm run migrate

echo "--- Restarting PM2 app $APP"
pm2 restart "$APP"

echo "--- Health check"
curl -fsS -o /dev/null --retry 15 --retry-delay 2 --retry-connrefused "http://$HEALTH_HOST:$PORT/api/health"
echo "API is up."
REMOTE

echo "==> Deploy finished."
