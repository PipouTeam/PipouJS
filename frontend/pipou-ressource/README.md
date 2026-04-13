# Pipou Ressource

Application frontend pour la gestion de ressources pédagogiques.

## Installation

```bash
npm install
```

## Version Web

### Développement

```bash
npm run dev
```

L'application sera accessible à [http://localhost:3000](http://localhost:3000)

### Production

```bash
npm run build
```

Les fichiers optimisés seront générés dans le dossier `dist/`

---

## Version Mobile (Android)

### Prérequis

- [Android Studio](https://developer.android.com/studio) installé
- JDK 17+ configuré
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
export CAPACITOR_ANDROID_STUDIO_PATH="/home/pommefrite/Documents/Application/android-studio-panda1-patch1-linux/android-studio/bin/studio.sh"
npx cap open android
```
CAPACITOR_ANDROID_STUDIO_PATH = Votre chemin android studio

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

---

## Technologies

- [Vue 3](https://vuejs.org/)
- [Vuetify 3](https://vuetifyjs.com/)
- [Pinia](https://pinia.vuejs.org/)
- [Vite](https://vitejs.dev/)
- [Capacitor](https://capacitorjs.com/)
