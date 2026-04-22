C'est le projet CUBE de la PipouTEAM !

## Structure du projet

```
PipouJS/
├── backend/                      # API Express.js (Node 20)
├── frontend/pipou-ressource/     # App principale Vue 3 + Vuetify
├── backoffice/                   # Dashboard admin Vue 3 + Vuetify
├── database/                     # Schéma SQL, seeds, images de seed
├── docs/                         # Documentation détaillée
└── docker-compose.yml            # Orchestration locale (Docker)
```

## Documentation

- [Guide d'installation locale](docs/guide_installation.md) — prérequis, configuration, modes de lancement
- [Déploiement Clever Cloud](docs/guide_clever_cloud.md) — architecture, variables d'env, commandes de deploy

Chaque composant de la stack à sa propre documentation:
- [Backend](backend/README.md) — API, endpoints, authentification, tests
- [Pipou Ressource](frontend/pipou-ressource/README.md) — app principale, routing auto, mobile
- [Backoffice](frontend/backoffice/README.md) — interface admin, gestion des rôles
  
## Quick start

```bash
docker compose --profile full-local up
```

| Service         | URL                  |
|-----------------|----------------------|
| Frontend        | http://localhost:3000 |
| Backoffice      | http://localhost:3002 |
| API             | http://localhost:3001 |
| MinIO Console   | http://localhost:9002 |

### Comptes de test

| Email | Mot de passe | Rôle |
|-------|-------------|------|
| `admin@test.com` | `Password123!` | admin |
| `moderator@test.com` | `Password123!` | moderator |
| `citizen@test.com` | `Password123!` | citizen |
