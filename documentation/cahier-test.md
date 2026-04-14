### Cahier de tests

#### Module : Authentification

| ID | Scénario | Données de test | Résultat attendu | Statut |
|---|---|---|---|---|
| AUTH-01 | Inscription avec des données valides | Prénom : Jean, Nom : Test, Email : jean@test.fr, MDP : Test1234! | Compte créé, redirection vers la connexion | ✅ OK |
| AUTH-02 | Inscription avec un email déjà utilisé | Email : citizen@test.com | Message d'erreur "email déjà utilisé" | ✅ OK |
| AUTH-03 | Inscription avec un mot de passe trop court | MDP : 123 | Message d'erreur "minimum 8 caractères" | ✅ OK |
| AUTH-04 | Connexion avec des identifiants corrects | Email : citizen@test.com / MDP : Password123! | Connexion réussie, token stocké, redirection | ✅ OK |
| AUTH-05 | Connexion avec un mauvais mot de passe | MDP : mauvais | Message d'erreur "identifiants incorrects" | ✅ OK |
| AUTH-06 | Accès à /compte sans être connecté | — | Redirection automatique vers /connexion | ✅ OK |
| AUTH-07 | Modification du profil (prénom/nom/email) | Nouveau prénom : Marie | Profil mis à jour, message de confirmation | ✅ OK |
| AUTH-08 | Changement de mot de passe | Ancien MDP correct, nouveau MDP : Nouveau123! | Mot de passe mis à jour | ✅ OK |
| AUTH-09 | Changement de mot de passe avec l'ancien incorrect | Ancien MDP : mauvais | Message d'erreur | ✅ OK |
| AUTH-10 | Déconnexion | Clic sur "Déconnexion" | Token supprimé, retour à l'accueil | ✅ OK |

#### Module : Catalogue et ressources

| ID | Scénario | Données de test | Résultat attendu | Statut |
|---|---|---|---|---|
| CAT-01 | Affichage du catalogue | — | Liste des ressources validées et publiques | ✅ OK |
| CAT-02 | Recherche par mot-clé | "stress" | Seules les ressources contenant "stress" s'affichent | ✅ OK |
| CAT-03 | Filtrage par catégorie | Catégorie : Santé | Seules les ressources de la catégorie Santé | ✅ OK |
| CAT-04 | Filtrage par type de relation | Relation : Famille | Seules les ressources liées à la famille | ✅ OK |
| CAT-05 | Accès au détail d'une ressource | Clic sur une carte | Page de l'article chargée avec le bon contenu | ✅ OK |
| CAT-06 | Affichage d'un contenu texte | Ressource de type texte | Contenu affiché en paragraphes | ✅ OK |
| CAT-07 | Affichage d'un PDF | Ressource de type PDF | Visionneuse PDF intégrée | ✅ OK |
| CAT-08 | Affichage d'une vidéo YouTube | Ressource avec URL YouTube | Lecteur YouTube intégré | ✅ OK |
| CAT-09 | Accès à une ressource inexistante | /article/9999 | Message d'erreur "ressource introuvable" | ✅ OK |

#### Module : Gestion de ressources (utilisateur connecté)

| ID | Scénario | Données de test | Résultat attendu | Statut |
|---|---|---|---|---|
| RES-01 | Création d'une ressource (texte) | Titre + contenu texte | Ressource créée avec statut "en attente" | ✅ OK |
| RES-02 | Création d'une ressource (PDF) | Fichier PDF < 20 Mo | Upload réussi, ressource créée | ✅ OK |
| RES-03 | Création d'une ressource (YouTube) | URL YouTube valide | Ressource créée avec aperçu de la vidéo | ✅ OK |
| RES-04 | Tentative d'upload d'un fichier non-PDF | Fichier .docx | Message d'erreur "seuls les PDF sont acceptés" | ✅ OK |
| RES-05 | Création sans titre | Formulaire vide | Validation bloquée, message d'erreur | ✅ OK |
| RES-06 | Suppression d'une ressource | Clic sur l'icône supprimer | Dialog de confirmation, puis suppression | ✅ OK |
| RES-07 | Annulation de la suppression | Clic sur "Annuler" dans le dialog | Ressource conservée | ✅ OK |

#### Module : Favoris

| ID | Scénario | Données de test | Résultat attendu | Statut |
|---|---|---|---|---|
| FAV-01 | Ajouter une ressource aux favoris | Clic sur "Ajouter aux favoris" (connecté) | Bouton passe en "Retirer des favoris", ressource ajoutée en BDD | ✅ OK |
| FAV-02 | Retirer une ressource des favoris | Clic sur "Retirer des favoris" | Bouton repasse en "Ajouter aux favoris", supprimé en BDD | ✅ OK |
| FAV-03 | Bouton favoris invisible si non connecté | Utilisateur non connecté | Bouton non affiché | ✅ OK |
| FAV-04 | Affichage des favoris dans /compte | — | Liste des ressources favorites de l'utilisateur | ✅ OK |
| FAV-05 | Filtrage des favoris par catégorie | Filtre : Santé | Seuls les favoris de la catégorie Santé | ✅ OK |
| FAV-06 | Recherche dans les favoris | Mot-clé : "sommeil" | Seuls les favoris contenant "sommeil" | ✅ OK |

#### Module : Navigation et responsive

| ID | Scénario | Données de test | Résultat attendu | Statut |
|---|---|---|---|---|
| NAV-01 | Menu desktop visible sur grand écran | Résolution ≥ 960px | Onglets de navigation affichés | ✅ OK |
| NAV-02 | Burger menu visible sur mobile | Résolution < 960px | Bouton hamburger affiché, menu en tiroir | ✅ OK |
| NAV-03 | Onglets "Mon compte" et "Mes ressources" masqués si non connecté | Utilisateur non connecté | Ces onglets n'apparaissent pas | ✅ OK |
| NAV-04 | Accès aux pages légales | Clic sur FAQ, Contact, Mentions légales | Pages affichées correctement | ✅ OK |

---

## Application Mobile

#### Module : Authentification mobile

| ID | Scénario | Données de test | Résultat attendu | Statut |
|---|---|---|---|---|
| MOB-AUTH-01 | Connexion via l'app mobile | Email : citizen@test.com / MDP : Password123! | Connexion réussie, redirection vers l'accueil mobile | ✅ OK |
| MOB-AUTH-02 | Déconnexion via l'app mobile | Clic sur "Déconnexion" | Token supprimé, écran de connexion affiché | ✅ OK |
| MOB-AUTH-03 | Accès au catalogue sans être connecté | Application non connectée | Catalogue public accessible | ✅ OK |
| MOB-AUTH-04 | Accès à /compte sans être connecté | — | Redirection vers l'écran de connexion | ✅ OK |

#### Module : Catalogue mobile

| ID | Scénario | Données de test | Résultat attendu | Statut |
|---|---|---|---|---|
| MOB-CAT-01 | Affichage du catalogue | — | Liste des ressources affichée en cards | ✅ OK |
| MOB-CAT-02 | Recherche par mot-clé | "stress" | Résultats filtrés en temps réel | ✅ OK |
| MOB-CAT-03 | Filtrage par catégorie | Catégorie : Santé | Seules les ressources Santé affichées | ✅ OK |
| MOB-CAT-04 | Consultation du détail d'une ressource | Clic sur une card | Page détail avec contenu complet | ✅ OK |
| MOB-CAT-05 | Ouverture d'un PDF | Ressource PDF | Visionneuse PDF native | ✅ OK |

#### Module : Gestion des favoris mobile

| ID | Scénario | Données de test | Résultat attendu | Statut |
|---|---|---|---|---|
| MOB-FAV-01 | Ajout aux favoris | Clic sur l'étoile (connecté) | Étoile pleine, ressource en BDD | ✅ OK |
| MOB-FAV-02 | Retrait des favoris | Clic sur l'étoile pleine | Étoile vide, ressource retirée en BDD | ✅ OK |
| MOB-FAV-03 | Consultation des favoris | Onglet "Favoris" | Liste des ressources favorites affichée | ✅ OK |

#### Module : Création de ressources mobile

| ID | Scénario | Données de test | Résultat attendu | Statut |
|---|---|---|---|---|
| MOB-RES-01 | Création d'une ressource texte | Titre + contenu | Ressource créée avec statut "en attente" | ✅ OK |
| MOB-RES-02 | Upload d'un PDF | Fichier PDF < 20 Mo | Upload réussi, ressource créée | ✅ OK |
| MOB-RES-03 | Ajout d'une vidéo YouTube | URL YouTube valide | Ressource créée avec player intégré | ✅ OK |
| MOB-RES-04 | Visualisation de ses ressources | Onglet "Mes ressources" | Liste des ressources de l'utilisateur | ✅ OK |
| MOB-RES-05 | Suppression d'une ressource | Swipe ou clic sur supprimer | Dialog de confirmation, puis suppression | ✅ OK |

#### Module : Interface et navigation mobile

| ID | Scénario | Données de test | Résultat attendu | Statut |
|---|---|---|---|---|
| MOB-NAV-01 | Navigation par onglets | Bas de l'écran | 4 onglets : Accueil, Recherche, Favoris, Compte | ✅ OK |
| MOB-NAV-02 | Swipe entre les onglets | Gesture swipe horizontale | Changement d'onglet fluide | ✅ OK |
| MOB-NAV-03 | Retour en arrière | Bouton retour système | Navigation vers la page précédente | ✅ OK |
| MOB-NAV-04 | Affichage responsive | Rotation écran portrait/paysage | Mise en page adaptée | ✅ OK |

---

## Back Office

#### Module : Connexion back office

| ID | Scénario | Données de test | Résultat attendu | Statut |
|---|---|---|---|---|
| BO-AUTH-01 | Connexion admin avec credentials valides | Email : admin@pipou.fr / MDP : Admin123! | Connexion réussie, tableau de bord affiché | ✅ OK |
| BO-AUTH-02 | Connexion avec mauvais credentials | MDP : mauvais | Message d'erreur "identifiants incorrects" | ✅ OK |
| BO-AUTH-03 | Accès au back office sans être connecté | — | Redirection vers la page de connexion | ✅ OK |
| BO-AUTH-04 | Déconnexion | Clic sur "Déconnexion" | Session détruite, redirection connexion | ✅ OK |

#### Module : Gestion des utilisateurs

| ID | Scénario | Données de test | Résultat attendu | Statut |
|---|---|---|---|---|
| BO-USER-01 | Liste des utilisateurs | — | Tableau avec colonnes : Nom, Email, Date inscription, Statut | ✅ OK |
| BO-USER-02 | Recherche d'un utilisateur | "Jean" | Filtrage de la liste par nom ou email | ✅ OK |
| BO-USER-03 | Activation d'un compte utilisateur | Clic sur "Activer" | Statut passent à "Actif", email de confirmation envoyé | ✅ OK |
| BO-USER-04 | Désactivation d'un compte | Clic sur "Désactiver" | Statut passent à "Inactif", utilisateur déconnecté | ✅ OK |
| BO-USER-05 | Suppression d'un utilisateur | Clic sur "Supprimer" + confirmation | Utilisateur et ses données supprimés | Pas Ok|


#### Module : Gestion des ressources (Back Office)

| ID | Scénario | Données de test | Résultat attendu | Statut |
|---|---|---|---|---|
| BO-RES-01 | Liste des ressources en attente | Filtre : "En attente" | Liste des ressources à valider | ✅ OK |
| BO-RES-02 | Validation d'une ressource | Clic sur "Valider" | Statut passe à "Validée", visible publiquement | ✅ OK |
| BO-RES-03 | Rejet d'une ressource | Clic sur "Rejeter" + motif | Statut passe à "Rejetée", email envoyé à l'auteur | ✅ OK |
| BO-RES-04 | Modification d'une ressource | Modification du titre | Titre mis à jour, date de modification actualisée | ✅ OK |
| BO-RES-05 | Suppression d'une ressource | Clic sur "Supprimer" + confirmation | Ressource supprimée, fichiers S3 nettoyés | ✅ OK |
| BO-RES-06 | Recherche dans les ressources | "sommeil" | Liste filtrée par mot-clé | ✅ OK |
| BO-RES-07 | Filtrage par statut | Statut : "Publiée" | Seules les ressources publiées affichées | ✅ OK |
| BO-RES-08 | Filtrage par catégorie | Catégorie : Santé | Ressources de la catégorie Santé | ✅ OK |

#### Module : Catégories et types de relation

| ID | Scénario | Données de test | Résultat attendu | Statut |
|---|---|---|---|---|
| BO-CAT-01 | Création d'une catégorie | Nom : "Bien-être" | Catégorie créée, apparait dans les filtres | ✅ OK |
| BO-CAT-02 | Modification d'une catégorie | Nouveau nom : "Santé mentale" | Nom mis à jour | ✅ OK |
| BO-CAT-03 | Suppression d'une catégorie | Clic sur "Supprimer" | Catégorie supprimée, ressources transférées vers "Autre" | ✅ OK |
| BO-CAT-04 | Création d'un type de relation | Nom : "Amis" | Type créé, apparait dans les filtres | ✅ OK |
| BO-CAT-05 | Suppression d'un type de relation | Clic sur "Supprimer" | Type supprimé | ✅ OK |


---
