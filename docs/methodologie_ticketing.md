# Méthodologie de ticketing — PipouJS

---

## 1. Outils utilisés

| Outil | Usage |
|-------|-------|
| **GitHub Issues** | Suivi des bugs et demandes de fonctionnalités |
| **GitHub Projects (Kanban)** | Suivi de l'avancement des tâches |
| **GitHub Pull Requests** | Revue de code et intégration des changements |
| **Labels GitHub** | Catégorisation et priorisation des issues |

---

## 2. Cycle de vie d'une issue

```
Signalement --> Triage --> En cours --> En revue --> Fermée
   (open)      (label)    (assigné)    (PR liée)    (merged/closed)
```

### 2.1 Création d'une issue

Toute issue est créée via un template GitHub :

- **Rapport de bug** (`bug`) : comportement inattendu, erreur, régression
- **Demande de fonctionnalité** (`enhancement`) : nouvelle feature ou amélioration

Chaque issue doit contenir :
- Une description claire du problème ou du besoin
- Les étapes pour reproduire (pour les bugs)
- L'environnement concerné (navigateur, version, OS)

### 2.2 Triage

Après création, un membre de l'équipe assigne les labels appropriés et l'ajoute au board Kanban.

### 2.3 Traitement

Une branche est créée depuis `dev` selon le type :

| Type | Préfixe de branche | Exemple |
|------|-------------------|---------|
| Bug | `fix/` | `fix/erreur-connexion` |
| Fonctionnalité | `feature/` | `feature/upload-ressource` |
| Sécurité | `security/` | `security/rate-limiting` |

La branche est liée a l'issue via le mot-clé `Closes #<numéro>` dans la PR.

### 2.4 Clôture

Une issue est fermée automatiquement quand la PR associée est mergée sur `main`.

---

## 3. Labels

| Label | Couleur | Usage |
|-------|---------|-------|
| `bug` | Rouge | Comportement incorrect, erreur |
| `enhancement` | Bleu | Nouvelle fonctionnalité ou amélioration |
| `documentation` | Vert | Ajout ou mise a jour de documentation |
| `security` | Orange | Vulnérabilité ou risque de sécurité |
| `ci/cd` | Violet | Pipeline, workflows, déploiement |
| `question` | Gris | Besoin de clarification |
| `wontfix` | Blanc | Ne sera pas traité |

Le label `bug` est automatiquement ajouté par le CI lorsqu'un pipeline échoue.

---

## 4. Board Kanban

Le board GitHub Projects organise les issues en colonnes :

| Colonne | Description |
|---------|-------------|
| **Backlog** | Issues créées, non planifiées |
| **A faire** | Planifiées pour le sprint en cours |
| **En cours** | Branche créée, développement actif |
| **En revue** | PR ouverte, en attente de validation |
| **Terminé** | PR mergée, issue fermée |

---

## 5. Workflow complet

```
1. Un bug est détecté ou une feature est demandée
        |
        v
2. Création d'une issue via le template adapté
        |
        v
3. Ajout au board Kanban (colonne "Backlog" ou "A faire")
        |
        v
4. Création d'une branche depuis dev
   (fix/<nom> ou feature/<nom>)
        |
        v
5. Développement + commits (Conventional Commits)
        |
        v
6. Ouverture d'une PR vers dev avec "Closes #<issue>"
        |
        v
7. CI valide (build + tests)
        |
        v
8. Revue de code par un membre de l'équipe
        |
        v
9. Merge PR -> dev -> staging -> main
        |
        v
10. Issue fermée automatiquement, board mis a jour
```

---

## 6. Gestion des incidents en production

Quand le CI échoue sur une PR, une issue GitHub est créée automatiquement par le workflow avec :
- Le label `bug`
- Le nom de la branche concernée
- Le commit SHA
- Un lien direct vers les logs du workflow en échec

Cette issue suit le même workflow que les autres bugs (triage, branche fix, PR, merge).

Pour un incident en production non lié au CI :

1. Créer une issue manuellement avec le label `bug` + description de l'incident
2. Consulter les logs Clever Cloud : `clever logs --alias PipouJS-API`
3. Si nécessaire, effectuer un rollback (voir [plan de déploiement](plan_deploiement.md#76-procédure-de-rollback))
4. Créer une branche `fix/<nom>` et ouvrir une PR vers `dev`

---

## 7. Convention de commits liés aux issues

Référencer l'issue dans le commit accélère la traçabilité :

```
fix: correction du bug de connexion mobile (#42)
feat: ajout de l'upload de ressources (#38)
```

Le numéro d'issue dans le message de commit est visible dans l'historique Git et sur GitHub.
