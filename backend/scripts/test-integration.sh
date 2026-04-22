#!/usr/bin/env bash
# Lance les services de test (PostgreSQL + MinIO) puis exécute les tests d'intégration.
# Usage : ./scripts/test-integration.sh [--keep]
#   --keep : ne pas arrêter les conteneurs après les tests

set -euo pipefail
cd "$(dirname "$0")/.."
ROOT_DIR="$(cd .. && pwd)"
COMPOSE_FILE="$ROOT_DIR/docker-compose.test.yml"
KEEP=false

[[ "${1:-}" == "--keep" ]] && KEEP=true

cleanup() {
    if [ "$KEEP" = false ]; then
        echo "🧹 Arrêt des conteneurs de test…"
        docker compose -f "$COMPOSE_FILE" down -v --remove-orphans 2>/dev/null || true
    fi
}
trap cleanup EXIT

echo "🐳 Démarrage de PostgreSQL + MinIO pour les tests…"
docker compose -f "$COMPOSE_FILE" up -d postgres-test minio-test

# Attendre que PostgreSQL soit prêt
echo "⏳ Attente de PostgreSQL (port 5433)…"
for i in $(seq 1 30); do
    if docker compose -f "$COMPOSE_FILE" exec -T postgres-test pg_isready -U pipou -d pipou_db >/dev/null 2>&1; then
        break
    fi
    sleep 1
done

# Attendre que MinIO soit prêt
echo "⏳ Attente de MinIO (port 9100)…"
for i in $(seq 1 30); do
    if curl -sf http://127.0.0.1:9100/minio/health/live >/dev/null 2>&1; then
        break
    fi
    sleep 1
done

# Créer le bucket
echo "🪣 Création du bucket MinIO…"
docker compose -f "$COMPOSE_FILE" up minio-init-test --wait 2>/dev/null || \
docker compose -f "$COMPOSE_FILE" run --rm minio-init-test 2>/dev/null || true

echo "🧪 Lancement des tests d'intégration…"
export DB_HOST=127.0.0.1
export DB_PORT=5433
export DB_USER=pipou
export DB_PASSWORD=pipou_secret
export DB_DATABASE=pipou_db
export SECRET=test_secret
export PORT=0
export S3_ENDPOINT=http://127.0.0.1:9100
export S3_PUBLIC_URL=http://127.0.0.1:9100
export S3_ACCESS_KEY=minioadmin
export S3_SECRET_KEY=minioadmin
export S3_BUCKET=pipou-resources

NODE_OPTIONS='--experimental-vm-modules' npx jest \
    --forceExit \
    --runInBand \
    --testMatch='**/tests/integration/**/*.test.js' \
    "$@"
