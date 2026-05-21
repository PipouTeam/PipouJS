# Plan de Déploiement — PipouJS

**Version :** 1.0.0
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
| Staging | Docker Compose + CI GitHub Actions | `staging` | CI automatique (pas de cloud) |
| Production | Clever Cloud | `main` | CD automatique (GitHub Actions → Clever Cloud) |

Le staging ne déploie **pas** sur un serveur distant — il sert de filet de sécurité via le CI (build + tests complets) avant d'autoriser le merge vers `main`. Cela évite de doubler les coûts d'hébergement tout en garantissant une validation solide.

### 2.3 Apps Clever Cloud (production uniquement) ✅ CONFIGURÉ

Un seul jeu d'applications, uniquement pour la production :

| App | Type | Alias |
|-----|------|-------|
| **API** | Node.js | `PipouJS-API` |
| **Frontend** | Static | `PipouJS-Front` |
| **Backoffice** | Static | `PipouJS-Backoffice` |

**Add-ons liés à l'API :**

| Add-on | Plan | Usage |
|--------|------|-------|
| PostgreSQL | dev | Base de données principale |
| Cellar S3 | S | Stockage des fichiers uploadés |

### 2.4 Réseaux Docker (développement local) ✅ CONFIGURÉ

Docker Compose gère deux profils :

| Profil | Services inclus |
|--------|----------------|
| `full-local` | postgres, backend, minio, minio-init, pipou-ressource, backoffice |
| `front-only` | pipou-ressource, backoffice (backend et BDD Clever Cloud utilisés) |

PostgreSQL et MinIO ne sont **jamais exposés** publiquement en production — uniquement accessibles par le backend via le réseau interne Clever Cloud.

---

## 3. Environnements

### 3.1 Environnement de développement (branche `dev`) ✅ CONFIGURÉ

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

Toute nouvelle fonctionnalité est développée sur une branche dédiée (`feature/*`, `fix/*`, etc.) puis intégrée à `dev` via Pull Request.

### 3.2 Environnement de staging (branche `staging`) ✅ CI / PAS DE CLOUD

| Paramètre | Valeur |
|-----------|--------|
| Objectif | Validation complète (build + tests) avant merge vers `main` |
| Infrastructure | GitHub Actions uniquement — pas de déploiement cloud |
| Base de données | PostgreSQL éphémère dans le CI (GitHub Actions services) |
| Stockage | MinIO éphémère dans le CI (GitHub Actions services) |
| Déclencheur CI | Push sur `staging` + PR vers `staging` |

Le staging est une **barrière CI**, pas un environnement hébergé. Aucune app Clever Cloud dédiée — cela évite de doubler les coûts. La validation se fait via le pipeline CI (build, tests unitaires, intégration, perf) avant d'autoriser le merge vers `main`.

> 🔜 **À améliorer :** s'assurer que le CI se déclenche bien sur les PR vers `staging` (actuellement configuré uniquement pour `main`).

### 3.3 Environnement de production (branche `main`) 🔜 CD À IMPLÉMENTER

| Paramètre | Valeur |
|-----------|--------|
| Objectif | Service aux utilisateurs finaux |
| Infrastructure | Clever Cloud |
| Déploiement | Automatique via GitHub Actions à chaque merge vers `main` |
| Base de données | PostgreSQL Clever Cloud (données réelles) |
| Stockage | Cellar S3 Clever Cloud |
| HTTPS | Géré automatiquement par Clever Cloud (Let's Encrypt) |

> 🔜 **À implémenter :** workflow `deploy-main.yml` — déclenché sur push vers `main`, déploie les 3 apps Clever Cloud automatiquement.

---

## 4. Stratégie de versioning

### 4.1 Outils

**Git + GitHub** — hébergement du code source, gestion des branches et des Pull Requests. ✅ CONFIGURÉ

**semantic-release** — outil de versioning automatique intégré via GitHub Actions (`release.yml`). Il analyse les messages de commits depuis le dernier tag, calcule la prochaine version SemVer et crée le tag Git + la GitHub Release automatiquement.

> 🔜 **À implémenter :** installer `semantic-release` et créer le workflow `.github/workflows/release.yml`.

### 4.2 Stratégie de branches (Gitflow simplifié) ✅ BRANCHES CRÉÉES / 🔜 PROTECTION À CONFIGURER

```
feature/* / fix/* / security/* / docs/* / chore/* → dev → staging → main
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

> 🔜 **À configurer :** activer la protection des branches `main`, `staging`, `dev` dans les paramètres GitHub du dépôt (Settings → Branches → Branch protection rules).

### 4.3 Convention de nommage ✅ / 🔜 NON ENFORCED

- Branches : `feature/nom`, `fix/nom`, `security/nom`, `docs/nom`, `chore/nom`
- Commits : Convention **Conventional Commits** (`feat:`, `fix:`, `feat!:`, `chore:`, `docs:`)
- Tags de version : SemVer
  - `v0.0.1` — Fix (`fix:`)
  - `v0.1.0` — Mineur (`feat:`)
  - `v1.0.0` — Majeur (`feat!:` ou breaking change)

> 🔜 **À implémenter :** ajouter un job de vérification des messages de commit dans le workflow CI (ex: `commitlint`).

### 4.4 Versioning automatique avec semantic-release 🔜 À IMPLÉMENTER

**Fichier :** `.github/workflows/release.yml`
**Déclencheur :** Push sur `dev`, `staging` ou `main`

semantic-release analyse les commits depuis le dernier tag et détermine automatiquement la prochaine version :

| Type de commit | Version impactée | Exemple |
|---|---|---|
| `fix:` | PATCH : `v1.0.0` → `v1.0.1` | `fix: correction bug connexion` |
| `feat:` | MINOR : `v1.0.0` → `v1.1.0` | `feat: ajout upload de ressources` |
| `feat!:` | MAJOR : `v1.0.0` → `v2.0.0` | `feat!: refonte complète de l'API` |

**Tags créés automatiquement selon la branche :**

| Branche | Type de release | Exemple de tag |
|---------|----------------|----------------|
| `dev` | Pre-release alpha | `v1.1.0-alpha.1` |
| `staging` | Pre-release beta | `v1.1.0-beta.1` |
| `main` | Release stable | `v1.1.0` |

> Le staging génère un tag beta pour tracer les versions validées avant production, même si aucun déploiement cloud n'est effectué.

**Processus automatique à chaque merge :**
1. Analyse des commits depuis le dernier tag
2. Calcul de la prochaine version SemVer
3. Création du tag Git
4. Création d'une GitHub Release avec notes générées depuis les commits

Si aucun commit ne justifie une nouvelle version (ex: `chore:`, `docs:`), semantic-release ne crée rien.

---

## 5. Intégration continue et automatisation (CI/CD)

### 5.1 Outil

**GitHub Actions** — pipelines automatiques déclenchés par les événements Git. ✅ CONFIGURÉ

### 5.2 Pipeline CI — Tests et vérifications automatiques ✅ IMPLÉMENTÉ

**Fichier :** `.github/workflows/ci.yml`
**Déclencheur :** Push (toutes branches) + Pull Request vers `main`

Six jobs s'exécutent avec dépendances entre eux :

**Job 1 — Build backend**

| Étape | Description |
|-------|-------------|
| 1 | Checkout du code |
| 2 | Installation Node.js 20 + dépendances (`npm ci`) |

**Job 2 — Build frontend (pipou-ressource)**

| Étape | Description |
|-------|-------------|
| 1 | Checkout du code |
| 2 | Installation Node.js 20 + dépendances |
| 3 | Compilation Vite (`npm run build`) |

**Job 3 — Build backoffice**

Identique au job 2, appliqué au backoffice.

**Job 4 — Tests unitaires backend (Jest)** *(dépend du Job 1)*

| Étape | Description |
|-------|-------------|
| 1 | Installation + `npm run test:ci` |
| 2 | Rapport JUnit via dorny/test-reporter |

**Job 5 — Tests unitaires frontend** *(dépend des Jobs 2 & 3)*

Tests Vitest sur pipou-ressource et backoffice avec rapport JUnit.

**Job 6 — Tests d'intégration backend** *(dépend du Job 1)*

| Service | Configuration |
|---------|---------------|
| PostgreSQL 16 | Base de données de test (`pipou_db`) |
| MinIO | Stockage S3 de test (bucket `pipou-resources`) |

**Job 7 — Tests de performance k6 (smoke)** *(dépend du Job 1)*

Smoke test k6 avec backend démarré, PostgreSQL et MinIO réels.

Si un job échoue, la Pull Request est bloquée et ne peut pas être mergée.

> 🔜 **À améliorer :** le CI se déclenche actuellement sur tous les push, pas uniquement sur les PR vers `dev`, `staging` et `main`. À restreindre pour économiser les minutes GitHub Actions.

> 🔜 **À améliorer :** ajouter `npm audit --audit-level=high` dans chaque job de build pour détecter les vulnérabilités des dépendances.

### 5.3 Pipeline CI Staging ✅ / 🔜 À ÉTENDRE

Le staging n'a pas de pipeline de déploiement — il réutilise le CI existant (`ci.yml`).

> 🔜 **À améliorer :** le CI doit se déclencher sur les PR vers `staging` (actuellement uniquement `main`). Un seul paramètre à modifier dans `ci.yml`.

### 5.4 Pipeline CD Production 🔜 À IMPLÉMENTER

**Fichier :** `.github/workflows/deploy-main.yml`
**Déclencheur :** Push sur `main` (= merge de PR staging → main)

Identique au pipeline staging. S'exécute uniquement si le CI est valide.

---

## 6. Prérequis techniques

### 6.1 Machine développeur ✅

- Node.js 20+
- npm 11+
- Git
- Docker + Docker Compose v2

### 6.2 Clever Cloud (production uniquement) ✅ CONFIGURÉ

- 3 apps créées et liées au dépôt GitHub
- Add-ons PostgreSQL et Cellar S3 liés à l'API
- Variables d'environnement configurées (voir [deploiement_clever_cloud.md](deploiement_clever_cloud.md))

---

## 7. Étapes de déploiement

### 7.1 Environnement de développement ✅

```bash
# 1. Cloner le dépôt
git clone https://github.com/<org>/PipouJS.git
cd PipouJS
git checkout dev

# 2. Configurer les variables d'environnement
cp backend/.env.example backend/.env
cp frontend/pipou-ressource/.env.example frontend/pipou-ressource/.env
cp frontend/backoffice/.env.example frontend/backoffice/.env
# Éditer les .env avec les valeurs locales

# 3. Démarrer tous les services (backend + BDD + S3 + frontends)
npm run dev

# Ou uniquement les frontends (si backend Clever Cloud utilisé)
npm run dev:front
```

**Services disponibles :**

| Service | URL |
|---------|-----|
| Frontend | `http://localhost:3000` |
| Backend API | `http://localhost:3001` |
| Backoffice | `http://localhost:3002` |
| MinIO console | `http://localhost:9002` |

### 7.2 Déploiement manuel vers Clever Cloud ✅ (en attendant le CD automatique)

```bash
# Prérequis : Clever Tools installé et connecté
npm install -g clever-tools
clever login

# Déployer l'API
clever deploy --alias PipouJS-API

# Déployer le frontend
clever deploy --alias PipouJS-Front

# Déployer le backoffice
clever deploy --alias PipouJS-Backoffice
```

### 7.3 Vérification post-déploiement ✅ / 🔜 À AUTOMATISER

| Vérification | Endpoint | Résultat attendu |
|---|---|---|
| API backend | `GET /api/stats` | JSON avec statistiques |
| Swagger | `GET /api-docs` | Interface Swagger UI |
| Frontend | `/` | Page d'accueil |
| Backoffice | `/` | Page de connexion admin |

> 🔜 **À automatiser :** ajouter une étape de health check dans les workflows de déploiement CD.

### 7.4 Initialisation / réinitialisation de la base de données ✅

```bash
# Récupérer l'URI de connexion
clever env --alias PipouJS-API | grep POSTGRESQL_ADDON_URI

# Appliquer le schéma
psql "<URI>" -f database/schema.sql

# (Optionnel) Appliquer les données de démo
psql "<URI>" -f database/seed.sql
```

### 7.5 Procédure de rollback 🔜 À DOCUMENTER AVEC L'URL CLEVER CLOUD

En cas de problème après un déploiement :

```bash
# Option 1 : Revenir au déploiement précédent via Clever Cloud console
# Dashboard → App → Déploiements → choisir le déploiement stable → "Redéployer"

# Option 2 : Forcer un redéploiement depuis un commit Git stable
git log --oneline -10
git checkout <sha_du_commit_stable>
clever deploy --alias PipouJS-API
clever deploy --alias PipouJS-Front
clever deploy --alias PipouJS-Backoffice
```

> ⚠️ En production, ne jamais réinitialiser la base de données sans sauvegarde préalable.

---

## 8. Gestion des secrets et sécurité des variables ✅ PRATIQUE EN PLACE

| Variable | Sensible | Règle |
|----------|----------|-------|
| `SECRET` (JWT) | Oui | Jamais dans Git, min 32 caractères aléatoires |
| `S3_ACCESS_KEY` | Oui | Jamais dans Git |
| `S3_SECRET_KEY` | Oui | Jamais dans Git |
| `POSTGRESQL_ADDON_URI` | Oui | Injectée automatiquement par Clever Cloud |
| `PORT` | Non | `8080` en production (imposé Clever Cloud) |
| `NODE_ENV` | Non | `production` obligatoire en prod |
| `VITE_API_URL` | Non | URL publique de l'API en prod |

Le fichier `.env` est listé dans `.gitignore`. Seul `.env.example` est versionné, sans valeurs réelles.

---

## 9. Ressources techniques — Clever Cloud

| Service | Plan actuel | Notes |
|---------|-------------|-------|
| Node.js API | Nano | Peut être upgradé selon charge |
| Static (frontend) | Nano | Servi via CDN Clever Cloud |
| Static (backoffice) | Nano | Servi via CDN Clever Cloud |
| PostgreSQL | dev | À upgrader en `xs_ssd` pour prod réelle |
| Cellar S3 | S | Stockage objet, pay-as-you-go |

HTTPS est géré automatiquement par Clever Cloud (certificats Let's Encrypt).

---

## 10. Monitoring et supervision 🔜 À IMPLÉMENTER

Aucun monitoring de disponibilité n'est actuellement en place.

**Option recommandée :** [Uptime Kuma](https://github.com/louislam/uptime-kuma) (open source, auto-hébergé) ou le monitoring natif Clever Cloud.

Monitors à configurer :
- HTTP → URL API (`/api/stats`)
- HTTP → URL frontend
- HTTP → URL backoffice
- Alertes par email en cas d'indisponibilité

> 🔜 **À implémenter :** déployer un service de monitoring et configurer les alertes.

---

## 11. Gestion des évolutions et des incidents 🔜 À IMPLÉMENTER

### 11.1 Templates GitHub 🔜

Aucun template n'est actuellement configuré.

**Fichiers à créer :**
- `.github/ISSUE_TEMPLATE/bug_report.md`
- `.github/ISSUE_TEMPLATE/feature_request.md`
- `.github/PULL_REQUEST_TEMPLATE.md`
- `CONTRIBUTING.md`

### 11.2 Procédure d'incident 🔜

**En cas d'incident en production :**

1. Identifier le service impacté (API, frontend, backoffice, BDD, S3)
2. Consulter les logs Clever Cloud : `clever logs --alias PipouJS-API`
3. Si le problème vient d'un déploiement récent → rollback (voir section 7.5)
4. Créer une issue GitHub avec le label `bug` et les logs
5. Déployer le fix sur `dev` → PR vers `staging` (validation CI) → PR vers `main` (CD automatique Clever Cloud)

---

## 12. Récapitulatif — Ce qui est implémenté vs à faire

### ✅ Implémenté

- Infrastructure Clever Cloud (3 apps + add-ons PostgreSQL + Cellar S3)
- Docker Compose pour développement local (profils `full-local` et `front-only`)
- CI GitHub Actions complet (build, tests unitaires, intégration, performance k6)
- Variables d'environnement sécurisées (`.env.example`, `.gitignore`)
- 3 branches Git créées (`main`, `staging`, `dev`)
- Documentation d'installation et de déploiement Clever Cloud
- Déploiement manuel via `clever deploy`

### 🔜 À implémenter (par ordre de priorité)

| Priorité | Tâche | Fichier(s) à créer / modifier |
|----------|-------|-------------------------------|
| 1 | CD automatique production (Clever Cloud) | `.github/workflows/deploy-main.yml` |
| 2 | CI déclenché sur PR vers `staging` | Modifier `.github/workflows/ci.yml` |
| 3 | Versioning automatique (semantic-release) | `.github/workflows/release.yml` + config `semantic-release` |
| 4 | Protection des branches GitHub | Paramètres GitHub (UI, pas de fichier) |
| 5 | Templates issues et PR | `.github/ISSUE_TEMPLATE/bug_report.md`, `PULL_REQUEST_TEMPLATE.md` |
| 6 | `CONTRIBUTING.md` | `CONTRIBUTING.md` |
| 7 | Health check post-déploiement | Dans `deploy-main.yml` |
| 8 | Monitoring (Uptime Kuma ou Clever Cloud) | Service externe |
| 9 | Audit sécurité dépendances dans CI | Modifier `ci.yml` (`npm audit`) |
