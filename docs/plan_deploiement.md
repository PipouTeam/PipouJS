# Plan de Déploiement — PipouJS

**Version :** 1.1.0
**Date :** 2026-05-21
**Projet :** PipouJS — Plateforme de partage de ressources pédagogiques

---

## 1. Présentation de l'application

PipouJS est une application web composée de trois services applicatifs :

| Service | Technologie | Rôle |
|---------|-------------|------|
| **Backend** | Node.js 20 / Express 4 | API REST, authentification JWT, accès base de données, stockage S3 |
| **Frontend (pipou-ressource)** | Vue.js 3 / Vuetify / Vite | Interface utilisateur grand public |
| **Backoffice** | Vue.js 3 / Vuetify / Vite | Interface d'administration |

Ces trois services communiquent avec une base de données **PostgreSQL 16** et un stockage objet **Cellar S3** (Clever Cloud) ou **MinIO** (local).

---

## 2. Architecture de déploiement

### 2.1 Schéma global

```
┌─────────────────────────────────────────────────────────────┐
│                        UTILISATEUR                          │
└────────┬────────────────────────┬───────────────────────────┘
         │ :3000                  │ :3002
         ▼                        ▼
┌─────────────────┐    ┌──────────────────────┐
│  pipou-ressource│    │  Backoffice           │
│  Vue.js / Vite  │    │  Vue.js / Vite        │
└────────┬────────┘    └──────────┬────────────┘
         │                        │
         │       /api             │
         └───────────┬────────────┘
                     ▼
         ┌───────────────────────┐
         │  Backend              │
         │  Express / Node.js    │
         │  (port 3001)          │
         └───────┬───────┬───────┘
                 │       │ réseau interne
                 ▼       ▼
    ┌──────────────┐  ┌────────────────┐
    │ PostgreSQL 16│  │ MinIO / Cellar │
    │ (port 5432)  │  │ S3 (port 9000) │
    └──────────────┘  └────────────────┘
```

### 2.2 Hébergement par environnement

| Environnement | Infrastructure | Branche Git | Déploiement |
|---------------|----------------|-------------|-------------|
| Développement | Local (Docker Compose) | `dev` | `npm run dev` |
| Staging | Clever Cloud (replica prod) | `staging` | CD automatique (GitHub Actions -> Clever Cloud) |
| Production | Clever Cloud | `main` | CD automatique (GitHub Actions -> Clever Cloud) |

Le staging est un **replica prod-like sur Clever Cloud**, déployé automatiquement à chaque merge vers `staging`. Il sert de dernière validation sur l'infra réelle (build Clever, Cellar S3, addon PostgreSQL, injection des variables) avant le merge vers `main`. La CI (build + tests) reste la première barrière sur les PR.

### 2.3 Apps Clever Cloud

Deux jeux d'apps, un par environnement cloud :

| App | Type | Alias prod | Alias staging |
|-----|------|------------|---------------|
| **API** | Node.js | `PipouJS-API` | `PipouJS-API-staging` |
| **Frontend** | Static | `PipouJS-Front` | `PipouJS-Front-staging` |
| **Backoffice** | Static | `PipouJS-Backoffice` | `PipouJS-Backoffice-staging` |

**Add-ons liés a l'API (un jeu par environnement) :**

| Add-on | Plan | Usage |
|--------|------|-------|
| PostgreSQL | dev | Base de données principale |
| Cellar S3 | S | Stockage des fichiers uploadés |

> 🔜 **Prérequis staging à créer côté Clever Cloud :** 3 apps (`PipouJS-API-staging`, `PipouJS-Front-staging`, `PipouJS-Backoffice-staging`) + leurs add-ons PostgreSQL et Cellar dédiés, avec les mêmes variables d'environnement que la prod (voir [deploiement_clever_cloud.md](deploiement_clever_cloud.md)). Les 3 alias staging doivent ensuite être ajoutés à `.clever.json` pour que le workflow `deploy-staging.yml` puisse les cibler. Plans minimaux recommandés (Nano / Postgres dev / Cellar S) ; apps arrêtées hors période de test pour limiter les coûts.

### 2.4 Environnement local (Docker Compose)

Docker Compose gère deux profils :

| Profil | Services inclus |
|--------|----------------|
| `full-local` | postgres, backend, minio, minio-init, pipou-ressource, backoffice |
| `front-only` | pipou-ressource, backoffice (backend Clever Cloud utilisé) |

PostgreSQL et MinIO ne sont **jamais exposés** publiquement en production.

---

## 3. Environnements

### 3.1 Environnement de développement (branche `dev`)

| Paramètre | Valeur |
|-----------|--------|
| Objectif | Développement et intégration des fonctionnalités |
| Infrastructure | Machine locale (Docker Compose) |
| Démarrage | `npm run dev` (profil `full-local`) |
| Base de données | PostgreSQL dans conteneur Docker |
| Stockage | MinIO dans conteneur Docker |
| URL frontend | `http://localhost:3000` |
| URL backoffice | `http://localhost:3002` |
| URL backend | `http://localhost:3001` |
| URL MinIO console | `http://localhost:9002` |

Toute nouvelle fonctionnalité est développée sur une branche dédiée (`feature/*`, `fix/*`, etc.) puis intégrée a `dev` via Pull Request.

### 3.2 Environnement de staging (branche `staging`)

| Paramètre | Valeur |
|-----------|--------|
| Objectif | Validation sur infra réelle avant merge vers `main` |
| Infrastructure | Clever Cloud (replica prod, plans minimaux) |
| Déploiement | Automatique via `deploy-staging.yml` à chaque merge de PR vers `staging` |
| Base de données | Addon PostgreSQL Clever dédié (données de seed) |
| Stockage | Cellar S3 Clever dédié |
| Déclencheur CD | Merge d'une PR vers `staging` |

Deux barrières successives :
1. **CI sur les PR** (build, tests unitaires, intégration, perf k6, build Docker) — empêche un merge cassé.
2. **Déploiement staging Clever** après merge — valide ce que la CI ne peut pas tester : build Clever, Cellar S3, addon PostgreSQL managé, injection des variables d'environnement, URLs/CORS réels, HTTPS.

> ⚠️ Ne jamais brancher de données réelles sur le staging — uniquement des données de seed.

### 3.3 Environnement de production (branche `main`)

| Paramètre | Valeur |
|-----------|--------|
| Objectif | Service aux utilisateurs finaux |
| Infrastructure | Clever Cloud |
| Déploiement | Automatique via GitHub Actions a chaque merge vers `main` |
| Base de données | PostgreSQL Clever Cloud (données réelles) |
| Stockage | Cellar S3 Clever Cloud |
| HTTPS | Géré automatiquement par Clever Cloud (Let's Encrypt) |

---

## 4. Stratégie de versioning

### 4.1 Outils

- **Git + GitHub** — hébergement du code source, branches et Pull Requests
- **semantic-release** — versioning automatique via `.github/workflows/release.yml`

### 4.2 Stratégie de branches

```
feature/* --+
fix/*       +--> dev --> staging --> main
chore/*   --+     CI       CI+Docker   CD Clever Cloud
```

| Branche | Protection | Règle de merge |
|---------|------------|----------------|
| `main` | Protégée | PR obligatoire + CI valide |
| `staging` | Protégée | PR obligatoire + CI valide |
| `dev` | Protégée | PR obligatoire + CI valide |
| `feature/*` | Libre | Créée depuis `dev` |
| `fix/*` | Libre | Créée depuis `dev` |
| `security/*` | Libre | Créée depuis `dev` |
| `docs/*` | Libre | Créée depuis `dev` |
| `chore/*` | Libre | Créée depuis `dev` |

### 4.3 Convention de nommage

- Branches : `feature/nom`, `fix/nom`, `security/nom`, `docs/nom`, `chore/nom`
- Commits : **Conventional Commits** (`feat:`, `fix:`, `feat!:`, `chore:`, `docs:`, `ci:`, `test:`)
- Tags de version : SemVer automatique via semantic-release

### 4.4 Versioning automatique avec semantic-release

**Fichier :** `.github/workflows/release.yml`
**Déclencheur :** Push sur `dev`, `staging` ou `main` (= apres chaque merge de PR)

| Type de commit | Impact | Exemple |
|---|---|---|
| `fix:` | PATCH | `v1.0.0` -> `v1.0.1` |
| `feat:` | MINOR | `v1.0.0` -> `v1.1.0` |
| `feat!:` | MAJOR | `v1.0.0` -> `v2.0.0` |

| Branche | Type de release | Exemple |
|---------|----------------|---------|
| `dev` | Pre-release alpha | `v1.1.0-alpha.1` |
| `staging` | Pre-release beta | `v1.1.0-beta.1` |
| `main` | Release stable | `v1.1.0` |

**Processus automatique a chaque merge :**
1. Analyse des commits depuis le dernier tag
2. Calcul de la prochaine version SemVer
3. Création du tag Git
4. Création d'une GitHub Release avec notes générées depuis les commits

Si aucun commit ne justifie une nouvelle version (`chore:`, `docs:`), semantic-release ne crée rien.

---

## 5. Intégration continue et automatisation (CI/CD)

### 5.1 Vue d'ensemble

| Workflow | Fichier | Déclencheur | Rôle |
|----------|---------|-------------|------|
| CI | `ci.yml` | PR vers `dev`, `staging`, `main` | Build + tests complets + notification échec |
| Docker Build | `docker-build.yml` | PR vers `staging`, `main` | Vérification image Docker backend |
| Deploy Staging | `deploy-staging.yml` | Merge PR vers `staging` | Déploiement Clever Cloud staging (3 apps) |
| Deploy Production | `deploy-main.yml` | Merge PR vers `main` | Déploiement Clever Cloud prod (3 apps) |
| Release | `release.yml` | Push sur `main`, `staging`, `dev` | Tag Git + GitHub Release |
| Dependabot | `dependabot.yml` | Tous les lundis | Mises a jour dépendances npm + actions |

### 5.2 Pipeline CI — Détail

**Déclencheur :** Pull Request vers `dev`, `staging` ou `main`

| Job | Dépendances | Description |
|-----|-------------|-------------|
| Build Backend | — | `npm ci` backend |
| Build Frontend (pipou-ressource) | — | `npm ci` + `npm run build` |
| Build Backoffice | — | `npm ci` + `npm run build` |
| Tests unitaires Backend | Build Backend | Jest + rapport JUnit |
| Tests unitaires Frontend | Build Frontend | Vitest + rapport JUnit |
| Tests unitaires Backoffice | Build Backoffice | Vitest + rapport JUnit |
| Tests d'intégration | Build Backend | Jest + PostgreSQL + MinIO réels |
| Tests de performance | Build Backend | k6 smoke test + PostgreSQL + MinIO |
| Notification échec | Tous les jobs | Crée une issue GitHub si un job échoue |

Si un job échoue : PR bloquée + issue GitHub créée automatiquement avec le label `bug`.

### 5.3 Pipeline Docker Build

**Déclencheur :** PR vers `staging` ou `main`

Construit l'image Docker du backend (`backend/Dockerfile`) sans la pousser vers un registry. Vérifie que le Dockerfile est valide avant chaque déploiement potentiel.

### 5.4 Pipeline CD Staging

**Fichier :** `.github/workflows/deploy-staging.yml`
**Déclencheur :** Merge d'une PR vers `staging` (`pull_request: [closed]` + `if: merged == true`)

Symétrique de la prod, vers les apps staging :

| Job | Commande |
|-----|----------|
| Deploy API | `clever deploy --alias PipouJS-API-staging --force` |
| Deploy Frontend | `clever deploy --alias PipouJS-Front-staging --force` |
| Deploy Backoffice | `clever deploy --alias PipouJS-Backoffice-staging --force` |

Mêmes secrets `CLEVER_TOKEN` / `CLEVER_SECRET`. Nécessite que les 3 apps staging existent et soient référencées dans `.clever.json` (voir §2.3).

### 5.5 Pipeline CD Production

**Fichier :** `.github/workflows/deploy-main.yml`
**Déclencheur :** Merge d'une PR vers `main`

Les 3 apps se déploient en parallèle :

| Job | Commande |
|-----|----------|
| Deploy API | `clever deploy --alias PipouJS-API --force` |
| Deploy Frontend | `clever deploy --alias PipouJS-Front --force` |
| Deploy Backoffice | `clever deploy --alias PipouJS-Backoffice --force` |

**Secrets GitHub requis :**

| Secret | Description |
|--------|-------------|
| `CLEVER_TOKEN` | Token d'authentification Clever Cloud |
| `CLEVER_SECRET` | Secret Clever Cloud |

### 5.6 Mises a jour automatiques des dépendances (Dependabot)

**Fichier :** `.github/dependabot.yml`
**Déclencheur :** Tous les lundis a 9h (Europe/Paris)

Ouvre des PR groupées vers `dev` pour chaque écosystème :

| Écosystème | Répertoire |
|------------|-----------|
| npm | `/` (racine) |
| npm | `/backend` |
| npm | `/frontend/pipou-ressource` |
| npm | `/frontend/backoffice` |
| npm | `/e2e` |
| github-actions | `/` |

---

## 6. Prérequis techniques

### 6.1 Machine développeur

- Node.js 20+
- npm 11+
- Git
- Docker + Docker Compose v2

### 6.2 Clever Cloud (production)

- 3 apps créées (`PipouJS-API`, `PipouJS-Front`, `PipouJS-Backoffice`)
- Add-ons PostgreSQL et Cellar S3 liés a l'API
- Variables d'environnement configurées (voir [deploiement_clever_cloud.md](deploiement_clever_cloud.md))
- Secrets GitHub `CLEVER_TOKEN` et `CLEVER_SECRET` configurés

---

## 7. Étapes de déploiement

### 7.1 Environnement de développement

```bash
# 1. Cloner le dépôt
git clone https://github.com/PipouTeam/PipouJS.git
cd PipouJS
git checkout dev

# 2. Configurer les variables d'environnement
cp backend/.env.example backend/.env
cp frontend/pipou-ressource/.env.example frontend/pipou-ressource/.env
cp frontend/backoffice/.env.example frontend/backoffice/.env

# 3. Démarrer tous les services
npm run dev

# Ou uniquement les frontends (backend Clever Cloud)
npm run dev:front
```

| Service | URL |
|---------|-----|
| Frontend | `http://localhost:3000` |
| Backend API | `http://localhost:3001` |
| Backoffice | `http://localhost:3002` |
| Swagger | `http://localhost:3001/api-docs` |
| MinIO console | `http://localhost:9002` |

### 7.2 Déploiement production (automatique)

Le déploiement est entièrement automatisé :

```
PR feature/* -> dev  ->  PR dev -> staging  ->  PR staging -> main  ->  Deploy Clever Cloud
      CI valide               CI + Docker valide              CD automatique
```

Aucune action manuelle requise en dehors de l'ouverture et du merge des PRs.

### 7.3 Déploiement manuel (fallback)

En cas de besoin de déploiement hors CI/CD :

```bash
npm install -g clever-tools
clever login

clever deploy --alias PipouJS-API
clever deploy --alias PipouJS-Front
clever deploy --alias PipouJS-Backoffice
```

### 7.4 Vérification post-déploiement

| Vérification | Endpoint | Résultat attendu |
|---|---|---|
| API backend | `GET /api/stats` | JSON avec statistiques |
| Swagger | `GET /api-docs` | Interface Swagger UI |
| Frontend | `/` | Page d'accueil |
| Backoffice | `/` | Page de connexion admin |

### 7.5 Initialisation de la base de données

```bash
# Récupérer l'URI de connexion
clever env --alias PipouJS-API | grep POSTGRESQL_ADDON_URI

# Appliquer le schéma
psql "<URI>" -f database/schema.sql

# (Optionnel) Données de démo
psql "<URI>" -f database/seed.sql
```

### 7.6 Procédure de rollback

**Option 1 — Via la console Clever Cloud (recommandé)**

```
Console Clever Cloud -> App -> Déploiements -> choisir un déploiement stable -> Redéployer
```

**Option 2 — Via Git**

```bash
git log --oneline -10
# Identifier le commit stable

git checkout <sha_du_commit_stable>
clever deploy --alias PipouJS-API --force
clever deploy --alias PipouJS-Front --force
clever deploy --alias PipouJS-Backoffice --force
```

> Attention : ne jamais réinitialiser la base de données sans sauvegarde préalable.

---

## 8. Gestion des secrets

| Variable | Sensible | Règle |
|----------|----------|-------|
| `SECRET` (JWT) | Oui | Jamais dans Git, min 32 caractères |
| `S3_ACCESS_KEY` | Oui | Jamais dans Git |
| `S3_SECRET_KEY` | Oui | Jamais dans Git |
| `POSTGRESQL_ADDON_URI` | Oui | Injectée automatiquement par Clever Cloud |
| `CLEVER_TOKEN` | Oui | GitHub Secret uniquement |
| `CLEVER_SECRET` | Oui | GitHub Secret uniquement |
| `PORT` | Non | `8080` en production (imposé Clever Cloud) |
| `VITE_API_URL` | Non | URL publique de l'API en prod |

Le fichier `.env` est dans `.gitignore`. Seul `.env.example` est versionné, sans valeurs réelles.

---

## 9. Ressources techniques — Clever Cloud

| Service | Plan | Notes |
|---------|------|-------|
| Node.js API | Nano | Peut être upgradé selon charge |
| Static (frontend) | Nano | Servi via CDN Clever Cloud |
| Static (backoffice) | Nano | Servi via CDN Clever Cloud |
| PostgreSQL | dev | A upgrader pour production réelle |
| Cellar S3 | S | Stockage objet, pay-as-you-go |

HTTPS géré automatiquement par Clever Cloud (Let's Encrypt).

---

## 10. Gestion des incidents

**Procédure en cas d'incident en production :**

1. Identifier le service impacté (API, frontend, backoffice, BDD, S3)
2. Consulter les logs : `clever logs --alias PipouJS-API`
3. Si lié a un déploiement récent : rollback (section 7.6)
4. Le CI crée automatiquement une issue GitHub avec le label `bug` et un lien vers les logs
5. Corriger sur `dev` -> PR `staging` (CI) -> PR `main` (CD automatique)

---

## 11. Récapitulatif

### Implémenté

| Élément | Détail |
|---------|--------|
| Infrastructure Clever Cloud | 3 apps + PostgreSQL + Cellar S3 |
| Environnement local | Docker Compose (`full-local`, `front-only`) |
| CI complet | Build + tests unitaires + intégration + perf k6 + Docker build |
| CD automatique | `deploy-main.yml` -> Clever Cloud au merge sur `main` |
| Versioning automatique | semantic-release (alpha / beta / stable) |
| Protection des branches | `main`, `staging`, `dev` protégées avec PR obligatoire |
| Mises a jour dépendances | Dependabot hebdomadaire vers `dev` |
| Notification d'échec CI | Issue GitHub automatique avec label `bug` |
| Documentation | README, plan déploiement, guide installation, Clever Cloud |

### A implémenter

| Priorité | Tâche | Fichier |
|----------|-------|---------|
| 1 | Templates issues et PR GitHub | `.github/ISSUE_TEMPLATE/`, `PULL_REQUEST_TEMPLATE.md` |
| 2 | Plan de sécurité | `docs/plan_securite.md` |
| 3 | Audit sécurité dépendances dans CI | Ajouter `npm audit` dans `ci.yml` |
