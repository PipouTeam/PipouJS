# Backoffice

Interface d'administration pour gérer les utilisateurs et les ressources.

## Installation

Suivre l'ensemble des instructions dans [le guide d'installation](./../../docs/guide_installation.md).

## Scripts

Il faut se placer dans le dossier `frontend/backoffice` pour executer les scripts suivants :

| Commande | Description |
|----------|-------------|
| `npm run dev` | Serveur de dev (http://localhost:3002) |
| `npm run build` | Build de production dans `dist/` |
| `npm run preview` | Preview du build de production |

## Structure du projet

```
src/
├── views/                        # Pages de l'application
│   ├── LoginView.vue             # Connexion admin
│   ├── AdminLayout.vue           # Layout principal (sidebar + contenu)
│   ├── DashboardView.vue         # Tableau de bord avec statistiques
│   ├── UsersView.vue             # Gestion des utilisateurs
│   ├── ResourcesView.vue         # CRUD des ressources
│   ├── CategoriesView.vue        # Gestion des categories
│   ├── RelationTypesView.vue     # Gestion des types de relations
│   └── ResourceTypesView.vue     # Gestion des types de ressources
├── stores/                       # State management (Pinia)
│   └── auth.js                   # Authentification (login, user, rôle)
├── plugins/
│   └── vuetify.js                # Configuration Vuetify
└── router/
    └── index.js                  # Routes manuelles avec guards
```

## Fonctionnement

### Routing

Les routes sont définies manuellement dans `src/router/index.js` avec des guards :
- `requiresAuth` — l'utilisateur doit être connecté
- `requiresAdmin` — l'utilisateur doit avoir le rôle `admin` ou `super_admin`
- `guest` — accessible uniquement si non connecté

### Routes disponibles

| Route | Vue | Description |
|-------|-----|-------------|
| `/login` | LoginView | Connexion |
| `/` | DashboardView | Tableau de bord |
| `/users` | UsersView | Gestion des utilisateurs |
| `/resources` | ResourcesView | Gestion des ressources |
| `/categories` | CategoriesView | Gestion des catégories |
| `/relation-types` | RelationTypesView | Types de relations |
| `/resource-types` | ResourceTypesView | Types de ressources |

### Authentification

- Token JWT stocké dans le localStorage
- Client HTTP : Axios (header `Authorization` configuré automatiquement après login)
- Seuls les rôles `admin` et `super_admin` ont accès

### Technologies

- [Vue 3](https://vuejs.org/) + [Vuetify 3](https://vuetifyjs.com/)
- [Pinia](https://pinia.vuejs.org/) (state management, options API)
- [Axios](https://axios-http.com/) (client HTTP)
- [Vite](https://vitejs.dev/)
