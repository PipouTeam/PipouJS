#!/usr/bin/env bash
set -euo pipefail

# ─── Tests de performance avec k6 + Docker ────────────────────────
# Usage : ./perf/scripts/run-perf.sh [smoke|load|stress|spike]
# Par défaut : smoke

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
TEST_TYPE="${1:-smoke}"
COMPOSE_FILE="$PROJECT_ROOT/docker-compose.test.yml"

# Vérifier que le script k6 existe
if [ ! -f "$SCRIPT_DIR/${TEST_TYPE}.js" ]; then
  echo "❌ Script inconnu : ${TEST_TYPE}.js"
  echo "   Disponibles : smoke, load, stress, spike"
  exit 1
fi

echo "🚀 Lancement des services (PostgreSQL + MinIO + Backend)…"
docker compose -f "$COMPOSE_FILE" --profile perf up -d --build --wait

echo "⏳ Attente du backend…"
for i in $(seq 1 30); do
  if curl -sf http://localhost:3001/api/stats > /dev/null 2>&1; then
    echo "✅ Backend prêt"
    break
  fi
  if [ "$i" -eq 30 ]; then
    echo "❌ Backend non disponible après 60s"
    docker compose -f "$COMPOSE_FILE" --profile perf logs backend-test
    docker compose -f "$COMPOSE_FILE" --profile perf down -v
    exit 1
  fi
  sleep 2
done

echo "📊 Exécution du test de performance : ${TEST_TYPE}"
docker run --rm \
  --network=host \
  -v "$SCRIPT_DIR:/scripts:ro" \
  grafana/k6:latest \
  run "/scripts/${TEST_TYPE}.js" \
  -e BASE_URL=http://localhost:3001

EXIT_CODE=$?

echo "🧹 Nettoyage…"
docker compose -f "$COMPOSE_FILE" --profile perf down -v

exit $EXIT_CODE
