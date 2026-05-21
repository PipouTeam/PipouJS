#!/usr/bin/env bash
# Lance l'environnement E2E complet (Docker) puis exécute les tests Playwright.
# Usage : ./scripts/start-e2e.sh [--keep] [playwright args...]
#   --keep : ne pas arrêter les conteneurs après les tests

set -euo pipefail
cd "$(dirname "$0")/../.."
COMPOSE_FILE="docker-compose.test.yml"
KEEP=false

if [[ "${1:-}" == "--keep" ]]; then
    KEEP=true
    shift
fi

cleanup() {
    if [ "$KEEP" = false ]; then
        echo "Arrêt des conteneurs E2E…"
        docker compose -f "$COMPOSE_FILE" --profile e2e down -v --remove-orphans 2>/dev/null || true
    fi
}
trap cleanup EXIT

echo "Démarrage de l'environnement E2E (PostgreSQL + MinIO + Backend + Frontends)…"
docker compose -f "$COMPOSE_FILE" --profile e2e up -d --build

echo "Attente que les services soient prêts…"

# Backend
for i in $(seq 1 60); do
    if curl -sf http://localhost:3001/api/stats >/dev/null 2>&1; then
        echo "  Backend prêt"
        break
    fi
    [ "$i" -eq 60 ] && { echo "Backend non prêt après 120s"; exit 1; }
    sleep 2
done

# Frontend pipou-ressource
for i in $(seq 1 60); do
    if curl -sf http://localhost:3000/ >/dev/null 2>&1; then
        echo "  Frontend (pipou-ressource) prêt"
        break
    fi
    [ "$i" -eq 60 ] && { echo "Frontend non prêt après 120s"; exit 1; }
    sleep 2
done

# Frontend backoffice
for i in $(seq 1 60); do
    if curl -sf http://localhost:3002/ >/dev/null 2>&1; then
        echo "  Frontend (backoffice) prêt"
        break
    fi
    [ "$i" -eq 60 ] && { echo "Backoffice non prêt après 120s"; exit 1; }
    sleep 2
done

echo "Lancement des tests Playwright…"
cd e2e
npx playwright test "$@"
