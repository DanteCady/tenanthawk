#!/usr/bin/env bash
# One-time bootstrap for the Lightsail Ubuntu host.
# Run as root or with sudo on tenanthawk-web:
#   curl -fsSL ... | bash   OR   scp + ssh
set -euo pipefail

APP_ROOT="/var/www/tenanthawk"

echo "→ Installing system packages..."
apt-get update
apt-get install -y curl git nginx rsync

if ! command -v node >/dev/null; then
  curl -fsSL https://deb.nodesource.com/setup_22.x | bash -
  apt-get install -y nodejs
fi

if ! command -v pm2 >/dev/null; then
  npm install -g pm2
fi

echo "→ Creating app directories..."
mkdir -p "$APP_ROOT/app"
chown -R ubuntu:ubuntu "$APP_ROOT"

if [[ ! -f "$APP_ROOT/.env" ]]; then
  echo "→ Create $APP_ROOT/.env from .env.example and fill production values before first deploy."
  sudo -u ubuntu touch "$APP_ROOT/.env"
fi

echo "→ Nginx site (adjust server_name if needed)..."
cat >/etc/nginx/sites-available/tenanthawk <<'NGINX'
server {
    listen 80 default_server;
    listen [::]:80 default_server;
    server_name tenanthawk.io www.tenanthawk.io *.tenanthawk.io;

    location /.well-known/acme-challenge/ {
        root /var/www/certbot;
    }

    location / {
        return 301 https://$host$request_uri;
    }
}

server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name tenanthawk.io www.tenanthawk.io *.tenanthawk.io;

    ssl_certificate /etc/letsencrypt/live/tenanthawk.io/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/tenanthawk.io/privkey.pem;
    include /etc/letsencrypt/options-ssl-nginx.conf;
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
NGINX

mkdir -p /var/www/certbot

ln -sf /etc/nginx/sites-available/tenanthawk /etc/nginx/sites-enabled/tenanthawk
rm -f /etc/nginx/sites-enabled/default
nginx -t && systemctl reload nginx

echo "→ Cron (daily scan + weekly digest)..."
CRON_FILE="/etc/cron.d/tenanthawk"
cat >"$CRON_FILE" <<'CRON'
SHELL=/bin/bash
0 7 * * * ubuntu source /var/www/tenanthawk/.env 2>/dev/null; /var/www/tenanthawk/app/scripts/trigger-cron.sh scan >> /var/log/tenanthawk-cron.log 2>&1
0 8 * * 1 ubuntu source /var/www/tenanthawk/.env 2>/dev/null; /var/www/tenanthawk/app/scripts/trigger-cron.sh digest >> /var/log/tenanthawk-cron.log 2>&1
CRON
chmod 644 "$CRON_FILE"

if command -v certbot >/dev/null; then
  echo "→ Let's Encrypt auto-renew cron..."
  cat >/etc/cron.d/tenanthawk-letsencrypt <<'LECRON'
SHELL=/bin/bash
PATH=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin

# Let's Encrypt — check renewal twice daily; reload nginx when a cert is renewed
0 3,15 * * * root certbot renew --quiet --deploy-hook "systemctl reload nginx" >> /var/log/tenanthawk-letsencrypt.log 2>&1
LECRON
  chmod 644 /etc/cron.d/tenanthawk-letsencrypt
  mkdir -p /etc/letsencrypt/renewal-hooks/deploy
  cat >/etc/letsencrypt/renewal-hooks/deploy/reload-nginx.sh <<'HOOK'
#!/bin/bash
systemctl reload nginx
HOOK
  chmod +x /etc/letsencrypt/renewal-hooks/deploy/reload-nginx.sh
fi

echo "Done. Next:"
echo "  1. Edit $APP_ROOT/.env with production secrets"
echo "  2. Issue TLS (apex + subdomains on HTTP-01):"
echo "     certbot certonly --webroot -w /var/www/certbot -d tenanthawk.io -d www.tenanthawk.io -d admin.tenanthawk.io -d demo.tenanthawk.io"
echo "     For all MSP slugs use DNS-01 wildcard: certbot certonly --manual --preferred-challenges dns -d tenanthawk.io -d '*.tenanthawk.io'"
echo "  3. Set ENTERPRISE_COOKIE_DOMAIN=.tenanthawk.io in $APP_ROOT/.env"
echo "  4. Add GitHub Actions secrets (LIGHTSAIL_HOST, LIGHTSAIL_USER, LIGHTSAIL_SSH_KEY)"
echo "  5. Push to main to trigger deploy"
