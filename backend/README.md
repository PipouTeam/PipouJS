# Backend

## Installation

Suivre l'ensemble des instructions dans [le guide d'installation](./../docs/guide_installation.md).

## Scripts

IIl faut ce placer dans le dossier `backend` pour exécuter les scripts suivants:

| Commande | Description |
|----------|-------------|
| `npm start` | Lancer le serveur de dev |
| `npm test` | Tests unitaires et controllers (Jest) |
| `npm run test:integration` | Tests d'intégration uniquement |
| `npm run test:all` | Tous les tests (unitaires + intégration) |

## Structure du projet

```
src/
├── app.js                    # Configuration Express (middleware, CORS, routes)
├── server.js                 # Point d'entree (ecoute sur PORT)
├── swagger.js                # Definitions OpenAPI/Swagger
├── controllers/              # Logique metier (8 controllers)
├── routes/                   # Definition des endpoints (11 fichiers)
├── middleware/
│   ├── auth.js               # Authentification JWT (requireAuth, optionalAuth)
│   └── roles.js              # Controle de roles (requireRole)
├── models/
│   └── database.js           # Pool de connexion PostgreSQL
├── services/
│   └── s3.js                 # Upload/suppression fichiers S3/MinIO
└── util/
    └── logger.js             # Logging Morgan + rotation de fichiers
```

## Endpoints API

| Route | Description |
|-------|-------------|
| `/api/auth` | Authentification (register, login, profil, changement de mot de passe) |
| `/api/users` | Gestion des utilisateurs |
| `/api/resources` | Gestion des ressources (cote citoyen) |
| `/api/resources/:id/comments` | Commentaires sur les ressources |
| `/api/admin/resources` | Gestion des ressources (cote admin) |
| `/api/moderation` | Moderation / validation |
| `/api/categories` | Categories |
| `/api/relation-types` | Types de relations |
| `/api/resource-types` | Types de ressources |
| `/api/progress` | Progression / favoris utilisateur |
| `/api/upload` | Upload de fichiers |
| `/api/stats` | Statistiques |
| `/api/docs` | Documentation Swagger UI |

## Authentification et roles

L'authentification repose sur des tokens JWT (header `Authorization: Bearer <token>`).

Deux middlewares disponibles :
- `requireAuth` — bloque la requete si le token est absent ou invalide
- `optionalAuth` — enrichit `req.user` si un token est present, continue sinon

Le controle d'acces utilise une hierarchie de roles :

```
citizen (1) < moderator (2) < admin (3) < super_admin (4)
```

Le middleware `requireRole(minRole)` verifie que le role de l'utilisateur est suffisant.

## Upload de fichiers

Les fichiers sont gerés via multer (stockage en memoire) puis envoyes sur S3/MinIO. Les fichiers sont stockés avec un nommage base sur le timestamp et un ACL `public-read`.

## Logs

Les logs HTTP (Morgan) sont écrits en console (`dev`) et dans des fichiers rotatifs journaliers dans le dossier `log/`.
