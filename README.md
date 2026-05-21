# PipouJS

Plateforme de partage de ressources pédagogiques développée par la **PipouTeam** dans le cadre du projet CUBE.

![CI](https://github.com/PipouTeam/PipouJS/actions/workflows/ci.yml/badge.svg)
![Version](https://img.shields.io/github/v/release/PipouTeam/PipouJS?include_prereleases&label=version)

---

## Architecture

| Service | Technologie | Rôle |
|---------|-------------|------|
| **Backend** | Node.js 20 / Express 4 | API REST, authentification JWT, accès base de données |
| **pipou-ressource** | Vue.js 3 / Vuetify / Vite | Interface utilisateur grand public |
| **Backoffice** | Vue.js 3 / Vuetify / Vite | Interface d'administration |
| **PostgreSQL 16** | Base de données | Données applicatives |
| **MinIO / Cellar S3** | Stockage objet | Fichiers uploadés par les utilisateurs |

```
Utilisateur
    ├── :3000 → pipou-ressource (Vue.js)
    └── :3002 → backoffice (Vue.js)
                    │
                    └── /api → Backend (Express)
                                    ├── PostgreSQL 16
                                    └── MinIO / Cellar S3
```

---

## Quick start

**Prérequis :** Docker + Docker Compose v2, Node.js 20+

```bash
# Cloner le projet
git clone https://github.com/PipouTeam/PipouJS.git
cd PipouJS

# Configurer les variables d'environnement
cp backend/.env.example backend/.env
cp frontend/pipou-ressource/.env.example frontend/pipou-ressource/.env
cp frontend/backoffice/.env.example frontend/backoffice/.env

# Lancer tous les services
npm run dev
```

| Service | URL |
|---------|-----|
| Frontend | http://localhost:3000 |
| Backoffice | http://localhost:3002 |
| API | http://localhost:3001 |
| Swagger | http://localhost:3001/api-docs |
| MinIO console | http://localhost:9002 |

### Comptes de test

| Email | Mot de passe | Rôle |
|-------|--------------|------|
| `admin@test.com` | `Password123!` | Admin |
| `moderator@test.com` | `Password123!` | Modérateur |
| `citizen@test.com` | `Password123!` | Citoyen |

---

## Structure du projet

```
PipouJS/
├── backend/                       # API Express.js
├── frontend/
│   ├── pipou-ressource/           # App principale Vue 3
│   └── backoffice/                # Dashboard admin Vue 3
├── database/                      # Schéma SQL et seeds
├── e2e/                           # Tests Playwright
├── perf/                          # Tests de performance k6
├── docs/                          # Documentation
├── .github/workflows/             # CI/CD GitHub Actions
└── docker-compose.yml             # Orchestration locale
```

---

## Documentation

| Document | Description |
|----------|-------------|
| [Guide d'installation](docs/guide_installation.md) | Prérequis, configuration, modes de lancement |
| [Plan de déploiement](docs/plan_deploiement.md) | Architecture, environnements, CI/CD, rollback |
| [Déploiement Clever Cloud](docs/deploiement_clever_cloud.md) | Variables d'env, commandes deploy, add-ons |
| [Plan de sécurité](docs/plan_securite.md) | Analyse OWASP, RGPD, gestion de crise |
| [Veille technologique](docs/veille_technologique.md) | Outils de surveillance, audit SAST/DAST |
| [Méthodologie ticketing](docs/methodologie_ticketing.md) | GitHub Issues, workflow, Kanban |
| [Cahier de tests](docs/cahier_de_tests.md) | Tests unitaires et non-régression |
| [API Swagger](http://localhost:3001/api-docs) | Documentation interactive (backend requis) |
| [Backend](backend/README.md) | API, endpoints, authentification |
| [pipou-ressource](frontend/pipou-ressource/README.md) | App principale, routing, mobile |
| [Backoffice](frontend/backoffice/README.md) | Interface admin, gestion des rôles |

---

## Workflow de contribution

### Stratégie de branches

```
feature/* ─┐
fix/*      ─┤─→ dev ──→ staging ──→ main
chore/*    ─┘            (CI)      (CD → Clever Cloud)
```

| Branche | Rôle | Déploiement |
|---------|------|-------------|
| `main` | Production stable | Automatique → Clever Cloud |
| `staging` | Validation pré-production | CI uniquement |
| `dev` | Intégration des développements | CI uniquement |
| `feature/*` | Nouvelle fonctionnalité | — |
| `fix/*` | Correction de bug | — |
| `chore/*` | Maintenance, CI, docs | — |

### Convention de commits

Ce projet suit la convention [Conventional Commits](https://www.conventionalcommits.org) :

| Préfixe | Usage | Impact version |
|---------|-------|----------------|
| `feat:` | Nouvelle fonctionnalité | `v1.1.0` (mineur) |
| `fix:` | Correction de bug | `v1.0.1` (patch) |
| `feat!:` | Breaking change | `v2.0.0` (majeur) |
| `chore:` | Maintenance | — |
| `docs:` | Documentation | — |
| `ci:` | Pipeline CI/CD | — |
| `test:` | Tests | — |

Le versioning est géré automatiquement par **semantic-release** à chaque merge.

### Ouvrir une Pull Request

1. Créer une branche depuis `dev` : `git checkout -b feature/ma-fonctionnalite`
2. Commiter avec la convention Conventional Commits
3. Ouvrir une PR vers `dev`
4. Le CI doit passer (build + tests unitaires + intégration + performance)
5. Merger une fois approuvé

---

## CI/CD

| Workflow | Déclencheur | Rôle |
|----------|-------------|------|
| `ci.yml` | PR vers `dev`, `staging`, `main` | Build + tests complets |
| `docker-build.yml` | PR vers `staging`, `main` | Vérification image Docker |
| `deploy-main.yml` | Merge PR vers `main` | Déploiement Clever Cloud |
| `release.yml` | Push sur `main`, `staging`, `dev` | Tag Git + GitHub Release |

### Tests

```bash
npm test                  # Tous les tests unitaires
npm run test:backend      # Tests backend uniquement
npm run test:backoffice   # Tests backoffice uniquement
npm run test:app          # Tests pipou-ressource uniquement
npm run test:integration  # Tests d'intégration (Docker requis)
npm run test:e2e          # Tests end-to-end (Playwright)
npm run test:perf         # Tests de performance (k6)
```
