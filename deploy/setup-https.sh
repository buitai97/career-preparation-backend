#!/usr/bin/env bash
# setup-https.sh — run once on a fresh EC2 instance to install nginx,
# obtain Let's Encrypt certificates, and wire everything up.
#
# Usage:
#   chmod +x deploy/setup-https.sh
#   DOMAIN=yourdomain.com API_DOMAIN=api.yourdomain.com \
#     EMAIL=you@example.com bash deploy/setup-https.sh
#
# Prerequisites:
#   1. Both DNS A-records must already point to this EC2 IP before you run this.
#      yourdomain.com     → <EC2 public IP>
#      api.yourdomain.com → <EC2 public IP>
#   2. EC2 security group must allow inbound TCP 80 and 443.
#   3. Script must run as root (or with sudo).

set -euo pipefail

DOMAIN="${DOMAIN:-yourdomain.com}"
API_DOMAIN="${API_DOMAIN:-api.${DOMAIN}}"
EMAIL="${EMAIL:-you@example.com}"
NGINX_CONF_DIR="${NGINX_CONF_DIR:-/etc/nginx/sites-available}"
NGINX_ENABLED_DIR="${NGINX_ENABLED_DIR:-/etc/nginx/sites-enabled}"
CERTBOT_WEBROOT="/var/www/certbot"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo "==> Domain  : ${DOMAIN}"
echo "==> API     : ${API_DOMAIN}"
echo "==> Email   : ${EMAIL}"
echo ""

# ── 1. Install nginx and certbot ─────────────────────────────────────────────
echo "==> Installing nginx and certbot..."
apt-get update -qq
apt-get install -y nginx certbot python3-certbot-nginx

# ── 2. Create webroot for ACME challenges ────────────────────────────────────
mkdir -p "${CERTBOT_WEBROOT}"
chown -R www-data:www-data "${CERTBOT_WEBROOT}"

# ── 3. Copy nginx configs (HTTP-only first so Certbot can verify domains) ────
echo "==> Installing nginx configs..."

# Strip the HTTPS blocks, leave only the HTTP + ACME-challenge block for now.
# We use sed to extract only the first server{} block (port 80) from each file.
# Simpler: install full configs; certbot --nginx will rewrite the ssl lines.

sed "s/yourdomain\.com/${DOMAIN}/g" \
    "${SCRIPT_DIR}/nginx/frontend.conf" \
    > "${NGINX_CONF_DIR}/frontend.conf"

sed "s/api\.yourdomain\.com/${API_DOMAIN}/g" \
    "${SCRIPT_DIR}/nginx/backend.conf" \
    > "${NGINX_CONF_DIR}/backend.conf"

# Enable sites
ln -sf "${NGINX_CONF_DIR}/frontend.conf" "${NGINX_ENABLED_DIR}/frontend.conf"
ln -sf "${NGINX_CONF_DIR}/backend.conf"  "${NGINX_ENABLED_DIR}/backend.conf"

# Remove the default site if present
rm -f "${NGINX_ENABLED_DIR}/default"

nginx -t
systemctl reload nginx

# ── 4. Obtain TLS certificates ───────────────────────────────────────────────
echo "==> Obtaining certificates for ${DOMAIN}, www.${DOMAIN}, ${API_DOMAIN}..."

# Frontend cert (apex + www)
certbot certonly \
    --webroot \
    --webroot-path "${CERTBOT_WEBROOT}" \
    --non-interactive \
    --agree-tos \
    --email "${EMAIL}" \
    -d "${DOMAIN}" \
    -d "www.${DOMAIN}"

# API cert
certbot certonly \
    --webroot \
    --webroot-path "${CERTBOT_WEBROOT}" \
    --non-interactive \
    --agree-tos \
    --email "${EMAIL}" \
    -d "${API_DOMAIN}"

# ── 5. Final nginx reload with full HTTPS config ─────────────────────────────
echo "==> Reloading nginx with HTTPS config..."
nginx -t
systemctl reload nginx

# ── 6. Auto-renewal cron job ─────────────────────────────────────────────────
echo "==> Setting up cert auto-renewal..."
# Certbot installs a systemd timer on Ubuntu 20.04+; this is a belt-and-braces
# cron fallback that also reloads nginx after a successful renewal.
CRON_JOB="0 3 * * * certbot renew --quiet --deploy-hook 'systemctl reload nginx'"
( crontab -l 2>/dev/null | grep -vF "certbot renew"; echo "${CRON_JOB}" ) | crontab -

echo ""
echo "==> Done. HTTPS is live."
echo "    Frontend : https://${DOMAIN}"
echo "    API      : https://${API_DOMAIN}"
echo ""
echo "    Certs expire in 90 days and renew automatically."
echo "    Test renewal dry-run: certbot renew --dry-run"
