# Pipou Ressource

Application frontend pour la gestion de ressources pédagogiques.

## Installation

Suivre l'ensemble des instructions dans [le guide d'installation](./../../docs/guide_installation.md).

## Scripts

Il faut se placer dans le dossier `frontend/pipou-ressource` pour executer les scripts suivants :

| Commande | Description |
|----------|-------------|
| `npm run dev` | Serveur de dev (http://localhost:3000) |
| `npm run build` | Build de production dans `dist/` |
| `npm run preview` | Preview du build de production |
| `npm run lint` | ESLint avec auto-fix |

## Structure du projet

```
src/
├── pages/                    # Pages (routes auto-generees)
│   ├── index.vue             # Accueil
│   ├── catalogue.vue         # Parcourir les ressources
│   ├── connexion.vue         # Connexion
│   ├── creer.vue             # Créer une ressource
│   ├── compte.vue            # Gestion du compte
│   ├── mes-ressources.vue    # Ressources de l'utilisateur
│   ├── faq.vue               # FAQ
│   ├── contact.vue           # Contact
│   ├── mentions.vue          # Mentions légales
│   ├── article/[id].vue      # Détail d'un article
│   └── ressources/[id].vue   # Détail d'une ressource
├── components/               # Composants réutilisables
├── stores/                   # State management (Pinia)
│   ├── auth.js               # Authentification (token, user)
│   └── app.js                # Etat global
├── plugins/                  # Plugins Vue (Vuetify, etc.)
├── router/                   # Configuration du routeur
├── layouts/                  # Layouts de page
└── assets/                   # Ressources statiques
```

## Fonctionnement

### Routing

Les routes sont **auto-générées** à partir des fichiers dans `src/pages/` grâce a unplugin-vue-router. Un fichier `pages/catalogue.vue` devient automatiquement la route `/catalogue`.

### Authentification

- Token JWT stocké dans le localStorage
- Envoye via le header `Authorization: Bearer <token>`
- Client HTTP : fetch custom (`api.js`)
- Routes protégées : `/compte`, `/mes-ressources`, `/creer` (redirection vers `/connexion`)

### Technologies

- [Vue 3](https://vuejs.org/) + [Vuetify 3](https://vuetifyjs.com/)
- [Pinia](https://pinia.vuejs.org/) (state management, composition API)
- [Vite](https://vitejs.dev/) avec auto-import des composants et routes
- [Tiptap](https://tiptap.dev/) (editeur de texte riche)
- [Capacitor](https://capacitorjs.com/) (support mobile Android)

---

## Version Mobile (Android)

### Prérequis

- [Android Studio](https://developer.android.com/studio) installé
- JDK 17+ configure
- Variable d'environnement `ANDROID_HOME` définie

### Initialisation

1. **Installer Capacitor** (si pas encore fait) :
```bash
npm install @capacitor/core @capacitor/cli
```

2. **Build du projet** :
```bash
npm run build
```

3. **Ajouter la plateforme Android** :
```bash
npx cap add android
```

4. **Ouvrir dans Android Studio** :
```bash
npx cap open android
```

### Commandes Capacitor utiles

| Commande | Description |
|----------|-------------|
| `npx cap sync` | Synchronise les changements web vers Android |
| `npx cap open android` | Ouvre le projet dans Android Studio |
| `npx cap run android` | Compile et lance l'app sur un appareil/emulateur |
| `npx cap copy` | Copie les fichiers web vers le projet Android |

### Build APK

Depuis Android Studio :
1. `Build` > `Build Bundle(s) / APK(s)` > `Build APK(s)`
2. L'APK sera généré dans `android/app/build/outputs/apk/debug/`
