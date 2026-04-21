C'est le projet CUBE de la PipouTEAM !

## Structure du projet

```
PipouJS/
├── backend/                      # API Express.js (Node 20)
├── frontend/pipou-ressource/     # App principale Vue 3 + Vuetify
├── backoffice/                   # Dashboard admin Vue 3 + Vuetify
├── database/                     # Schéma SQL, seeds, images de seed
└── package.json                  # Orchestration monorepo (Clever Cloud)
```

## Développement local

### Prérequis

- Node.js >= 20
- Docker & Docker Compose (pour PostgreSQL + MinIO)

### Lancer l'environnement

```bash
# Démarrer PostgreSQL + MinIO + seed
docker compose up -d

# Backend (port 3001)
cd backend && npm install && npm start

# Frontend (port 3000)
cd frontend/pipou-ressource && npm install && npm run dev

# Backoffice (port 3002)
cd backoffice && npm install && npm run dev
```

### Comptes de test

| Email | Mot de passe | Rôle |
|-------|-------------|------|
| `admin@test.com` | `Password123!` | admin |
| `moderator@test.com` | `Password123!` | moderator |
| `citizen@test.com` | `Password123!` | citizen |

## Développement local → API Clever Cloud

Il est possible de lancer le frontend en local tout en utilisant l'API et le S3 déployés sur Clever Cloud :

```bash
cd frontend/pipou-ressource
VITE_API_URL=https://<app-api>.cleverapps.io/api npm run dev
```

## Déploiement Clever Cloud

Le projet est déployé en **3 apps Clever Cloud** indépendantes depuis ce monorepo.
fsqcfezdsqdqdezzd
### Architecture

| App | Type | Alias | `CC_APP_FOLDER` |
|-----|------|-------|-----------------|
| **[PipouJS] API** | Node.js | `PipouJS-API` | `backend` |
| **[PipouJS] Front** | Static | `PipouJS-Front` | `frontend/pipou-ressource` |
| **[PipouJS] Backoffice** | Static | `PipouJS-Backoffice` | `backoffice` |

### Add-ons (liés à l'API)

- **PostgreSQL** (plan dev) — variable `POSTGRESQL_ADDON_URI` injectée automatiquement
- **Cellar S3** (plan S) — stockage des fichiers uploadés

### Variables d'environnement

#### API (`PipouJS-API`)

| Variable | Description |
|----------|-------------|
| `CC_APP_FOLDER` | `backend` |
| `PORT` | `8080` (imposé par Clever Cloud) |
| `SECRET` | Secret JWT |
| `FRONTEND_URL` | URL du frontend (CORS) |
| `BACKOFFICE_URL` | URL du backoffice (CORS) |
| `CORS_EXTRA_ORIGINS` | Origines supplémentaires séparées par `,` (ex: `http://localhost:3000`) |
| `S3_ENDPOINT` | `https://cellar-c2.services.clever-cloud.com` |
| `S3_ACCESS_KEY` | Clé Cellar |
| `S3_SECRET_KEY` | Secret Cellar |
| `S3_BUCKET` | `pipou-resources` |
| `POSTGRESQL_ADDON_URI` | Injectée automatiquement par l'add-on |

#### Frontend (`PipouJS-Front`)

| Variable | Description |
|----------|-------------|
| `CC_APP_FOLDER` | `frontend/pipou-ressource` |
| `VITE_API_URL` | URL de l'API avec `/api` (ex: `https://<api>.cleverapps.io/api`) |

#### Backoffice (`PipouJS-Backoffice`)

| Variable | Description |
|----------|-------------|
| `CC_APP_FOLDER` | `backoffice` |
| `VITE_API_URL` | URL de l'API sans `/api` (ex: `https://<api>.cleverapps.io`) |

### Déployer

```bash
# Déployer l'API
clever deploy --alias PipouJS-API

# Déployer le frontend
clever deploy --alias PipouJS-Front

# Déployer le backoffice
clever deploy --alias PipouJS-Backoffice
```

### Initialiser / réinitialiser la base de données

```bash
# Récupérer l'URI de connexion
clever env --alias PipouJS-API | grep POSTGRESQL_ADDON_URI

# Appliquer le schéma
psql "<URI>" -f database/schema.sql

# (Optionnel) Appliquer le seed
# ⚠️ Remplacer les URLs localhost par les URLs Cellar dans seed.sql avant
psql "<URI>" -f database/seed.sql
```