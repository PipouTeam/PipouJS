# Guide d'installation de l'environnement
## Comprendre l'architecture locale

```
  ┌────────────────────────────────────────────────────────────────┐
  │                          FRONTEND (Vue)                        │
  │                                                                │
  │   ┌─────────────────────────────┐  ┌─────────────────────────┐ │
  │   │     Pipou-Ressource         │  │       Backoffice        │ │
  │   │ (frontend/pipou-ressource/) │  │  (frontend/backoffice/) │ │
  │   │  :3000 — Vite + Vue         │  │  :3002 — Vite + Vue     │ │
  │   └────────────┬────────────────┘  └────────────┬────────────┘ │
  │                │                                │              │
  └────────────────┼────────────────────────────────┼──────────────┘
                   │           HTTP / API           │
                   └────────────────┬───────────────┘
                                    ▼
  ┌────────────────────────────────────────────────────────────────┐
  │                             API                                │
  │                         (backend/)                             │
  │                         :3001 — Node.js                        │
  └─────────────┬──────────────────────────┬───────────────────────┘
                │                          │
                ▼                          ▼
  ┌──────────────────────┐   ┌──────────────────────────┐
  │     PostgreSQL       │   │       MinIO (S3)         │
  │     :5432            │   │       :9000              │
  │                      │   │                          │
  │  - schema.sql        │   │  Bucket:                 │
  │  - seed.sql          │   │    pipou-resources       │
  │  DB: pipou_db        │   │  (images/fichiers)       │
  └──────────────────────┘   └──────────────────────────┘
```

## Les prérequis pour une bonne installation
- Node.js       v20+
- npm           v11+
- Docker        v27+

## Configuration
### Backend
Le backend dépend d'un fichier local `.env` qui ne doit pas être versionné. Il peut être créé localement en se basant sur `/backend/.env.example`.
### Frontend/pipou-ressource
Le frontend dépend d'un fichier local `.env` qui ne doit pas être versionné. Il peut être créé localement en se basant sur `/frontend/pipou-ressource/.env.example`.
### Frontend/backoffice
Le backoffice dépend d'un fichier local `.env` qui ne doit pas être versionné. Il peut être créé localement en se basant sur `/frontend/backoffice/.env.example`.

## Lancement de la stack

Trois modes sont disponibles selon l'environnement souhaité.

> Dans tous les cas, les frontends lisent leur `VITE_API_URL` depuis leur fichier `.env`.
> Copier le `.env.example` en `.env` et adapter la valeur selon le mode choisi.

### Full local (tout en Docker)

Lance la base de données, le stockage S3, le backend **et** les deux frontends avec hot-reload :

```bash
docker compose --profile full-local up
```

| Service            | URL                     |
|--------------------|-------------------------|
| Pipou-Ressource    | http://localhost:3000    |
| Backoffice         | http://localhost:3002    |
| Backend API        | http://localhost:3001    |
| MinIO Console      | http://localhost:9002    |

> `.env` des frontends : `VITE_API_URL=http://localhost:3001/api` (pipou-ressource) / `http://localhost:3001/` (backoffice)

### Front local + Back sur Clever Cloud

Lance uniquement les deux frontends en Docker, le backend et la DB sont sur Clever Cloud :

```bash
docker compose --profile front-only up
```

> `.env` des frontends : `VITE_API_URL=https://<app-api>.cleverapps.io/api` (pipou-ressource) / `https://<app-api>.cleverapps.io/` (backoffice)

### Backend + DB uniquement (mode par défaut)

Ne lance que PostgreSQL, MinIO et le backend :

```bash
docker compose up
```

## A savoir
### Données de développement
L'ensemble de la stack (PostgreSQL, MinIO/S3, Clever Cloud) est alimenté par des données fictives : utilisateurs, fichiers et seeds de démo. Il n'existe pour le moment ni environnement de préproduction ni de production.
