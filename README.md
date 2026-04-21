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

## Développement Blipbloup

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