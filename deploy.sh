#!/bin/bash
# Deploy do Studio Bella (salao-jane) no VPS Dokploy
# Uso: bash deploy.sh
set -e

APP=salao-jane
DOMAIN=salaojane.fbautomacao.space
PORT=3025
DB_NAME=salao_jane_db
DB_USER=salao_jane_user
PASSWORD_FILE=/tmp/salao-jane-db-password
COMPOSE_DIR=/etc/dokploy/compose/$APP
SHARED_PG=kairos-shared-pg

echo "==> [1/6] gerar senha Postgres se nao existir"
if [ ! -f "$PASSWORD_FILE" ]; then
  tr -dc 'A-Za-z0-9' </dev/urandom | head -c 28 > "$PASSWORD_FILE"
  chmod 600 "$PASSWORD_FILE"
  echo "    senha salva em $PASSWORD_FILE"
fi
DB_PASS=$(cat "$PASSWORD_FILE")

echo "==> [2/6] criar DB e user no $SHARED_PG"
docker exec "$SHARED_PG" psql -U postgres -tAc \
  "SELECT 1 FROM pg_roles WHERE rolname='$DB_USER'" | grep -q 1 \
  || docker exec "$SHARED_PG" psql -U postgres -c \
  "CREATE ROLE $DB_USER LOGIN PASSWORD '$DB_PASS';"

docker exec "$SHARED_PG" psql -U postgres -tAc \
  "SELECT 1 FROM pg_database WHERE datname='$DB_NAME'" | grep -q 1 \
  || docker exec "$SHARED_PG" psql -U postgres -c \
  "CREATE DATABASE $DB_NAME OWNER $DB_USER;"

docker exec "$SHARED_PG" psql -U postgres -d "$DB_NAME" -c \
  "GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO $DB_USER;
   GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO $DB_USER;
   ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO $DB_USER;
   ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO $DB_USER;"

echo "==> [3/6] atualizar repo"
mkdir -p "$COMPOSE_DIR"
if [ ! -d "$COMPOSE_DIR/.git" ]; then
  git clone https://github.com/appfbj-stack/salao-jane.git "$COMPOSE_DIR"
else
  cd "$COMPOSE_DIR" && git pull --ff-only
fi
cd "$COMPOSE_DIR"

cat > .env <<EOF
PGHOST=$SHARED_PG
PGPORT=5432
PGDATABASE=$DB_NAME
PGUSER=$DB_USER
PGPASSWORD=$DB_PASS
PORT=$PORT
APP_URL=https://$DOMAIN
EOF

echo "==> [4/6] garantir docker-compose.yml"
cat > docker-compose.yml <<EOF
services:
  $APP:
    image: ${APP}-app:latest
    build:
      context: .
      dockerfile: Dockerfile
    container_name: ${APP}-app
    restart: unless-stopped
    env_file:
      - .env
    ports:
      - "127.0.0.1:${PORT}:3001"
    networks:
      - dokploy-network
networks:
  dokploy-network:
    external: true
EOF

echo "==> [5/6] build + up"
docker compose -p $APP build --no-cache
docker compose -p $APP up -d

echo "==> [6/6] adicionar entrada no Caddy"
if ! grep -q "$DOMAIN" /etc/caddy/Caddyfile; then
  cat >> /etc/caddy/Caddyfile <<EOF

$DOMAIN {
  reverse_proxy 127.0.0.1:$PORT
  encode gzip zstd
}
EOF
  caddy reload --config /etc/caddy/Caddyfile
  echo "    entrada Caddy adicionada para $DOMAIN"
else
  echo "    entrada Caddy ja existe para $DOMAIN"
fi

echo ""
echo "==> deploy concluido"
echo "    URL: https://$DOMAIN"
echo "    API health: curl http://127.0.0.1:$PORT/api/health"
