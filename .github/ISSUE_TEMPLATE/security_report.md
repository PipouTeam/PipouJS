---
name: Rapport de sécurité
about: Signaler une vulnérabilité ou un risque de sécurité
labels: security
assignees: ''
---

> **Attention :** Pour les vulnérabilités critiques (données personnelles exposées, faille d'authentification, injection), ne pas détailler publiquement l'exploit dans cette issue. Contacter directement un membre de l'équipe.

## Type de vulnérabilité

- [ ] Injection (SQL, XSS, commande)
- [ ] Authentification / autorisation
- [ ] Exposition de données personnelles (RGPD)
- [ ] Dépendance vulnérable (CVE)
- [ ] Mauvaise configuration (CORS, headers, secrets)
- [ ] Autre

## Description

Décris le risque de sécurité identifié sans exposer de détails exploitables.

## Service concerné

- [ ] Backend (API)
- [ ] Frontend (pipou-ressource)
- [ ] Backoffice
- [ ] Infrastructure (Docker, Clever Cloud)
- [ ] Dépendances npm

## Sévérité estimée

- [ ] Critique — données exposées ou accès non autorisé possible
- [ ] Haute — contournement de contrôle d'accès
- [ ] Moyenne — fuite d'information partielle
- [ ] Faible — risque mineur ou théorique

## Contexte

Version de l'application, environnement concerné (dev / staging / production).
