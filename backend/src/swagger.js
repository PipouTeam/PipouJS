const swaggerJsdoc = require('swagger-jsdoc')

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Ressource Relationnelle API',
      version: '1.0.0',
      description: 'API de la plateforme Ressource Relationnelle — Ministère de la Santé',
    },
    servers: [{ url: 'http://localhost:3001' }],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
      schemas: {
        Error: {
          type: 'object',
          properties: {
            status:  { type: 'boolean', example: false },
            message: { type: 'string' },
          },
        },
      },
    },
    tags: [
      { name: 'Auth',           description: 'Authentification et gestion du compte' },
      { name: 'Ressources',     description: 'Ressources (citoyen)' },
      { name: 'Admin',          description: 'Gestion des ressources (administrateur)' },
      { name: 'Modération',     description: 'Validation des ressources (modérateur)' },
      { name: 'Utilisateurs',   description: 'Gestion des comptes (super_admin)' },
      { name: 'Référentiels',   description: 'Catégories, types de ressources, types de relation' },
      { name: 'Progression',    description: 'Favoris et suivi de progression' },
    ],
    paths: {

      // ── AUTH ────────────────────────────────────────────────────────────────
      '/api/auth/register': {
        post: {
          tags: ['Auth'],
          summary: 'Créer un compte',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['email', 'password', 'first_name', 'last_name'],
                  properties: {
                    email:      { type: 'string', format: 'email', example: 'jean.dupont@email.fr' },
                    password:   { type: 'string', minLength: 8,    example: 'MotDePasse123!' },
                    first_name: { type: 'string', example: 'Jean' },
                    last_name:  { type: 'string', example: 'Dupont' },
                  },
                },
              },
            },
          },
          responses: {
            201: { description: 'Compte créé' },
            400: { description: 'Champs manquants ou email déjà utilisé' },
          },
        },
      },

      '/api/auth/login': {
        post: {
          tags: ['Auth'],
          summary: 'Se connecter',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['email', 'password'],
                  properties: {
                    email:    { type: 'string', format: 'email', example: 'jean.dupont@email.fr' },
                    password: { type: 'string', example: 'MotDePasse123!' },
                  },
                },
              },
            },
          },
          responses: {
            200: { description: 'Connexion réussie — retourne un token JWT' },
            401: { description: 'Identifiants invalides' },
            403: { description: 'Compte désactivé' },
          },
        },
      },

      '/api/auth/me/password': {
        put: {
          tags: ['Auth'],
          summary: 'Changer son mot de passe',
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['current_password', 'new_password'],
                  properties: {
                    current_password: { type: 'string', example: 'AncienMotDePasse1!' },
                    new_password:     { type: 'string', minLength: 8, example: 'NouveauMotDePasse1!' },
                  },
                },
              },
            },
          },
          responses: {
            200: { description: 'Mot de passe mis à jour' },
            400: { description: 'Champs manquants ou nouveau mot de passe trop court' },
            401: { description: 'Mot de passe actuel incorrect' },
          },
        },
      },

      '/api/auth/me': {
        get: {
          tags: ['Auth'],
          summary: 'Profil de l\'utilisateur connecté',
          security: [{ bearerAuth: [] }],
          responses: {
            200: { description: 'Profil retourné' },
            401: { description: 'Non authentifié' },
          },
        },
        put: {
          tags: ['Auth'],
          summary: 'Modifier son propre profil',
          security: [{ bearerAuth: [] }],
          requestBody: {
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    first_name: { type: 'string' },
                    last_name:  { type: 'string' },
                    email:      { type: 'string', format: 'email' },
                  },
                },
              },
            },
          },
          responses: {
            200: { description: 'Profil mis à jour' },
            401: { description: 'Non authentifié' },
          },
        },
      },

      // ── RESOURCES (citoyen) ─────────────────────────────────────────────────
      '/api/resources': {
        get: {
          tags: ['Ressources'],
          summary: 'Lister les ressources publiques',
          responses: { 200: { description: 'Liste des ressources' } },
        },
        post: {
          tags: ['Ressources'],
          summary: 'Créer une ressource',
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['title'],
                  properties: {
                    title:       { type: 'string' },
                    description: { type: 'string' },
                    visibility:  { type: 'string', enum: ['public', 'shared', 'private'] },
                  },
                },
              },
            },
          },
          responses: {
            201: { description: 'Ressource créée' },
            401: { description: 'Non authentifié' },
          },
        },
      },

      '/api/resources/mine': {
        get: {
          tags: ['Ressources'],
          summary: 'Mes ressources',
          security: [{ bearerAuth: [] }],
          responses: { 200: { description: 'Ressources de l\'utilisateur' } },
        },
      },

      '/api/resources/{id}': {
        get: {
          tags: ['Ressources'],
          summary: 'Détail d\'une ressource',
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
          responses: { 200: { description: 'Ressource retournée' }, 404: { description: 'Introuvable' } },
        },
        put: {
          tags: ['Ressources'],
          summary: 'Modifier une ressource (propriétaire)',
          security: [{ bearerAuth: [] }],
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
          responses: { 200: { description: 'Ressource mise à jour' } },
        },
        delete: {
          tags: ['Ressources'],
          summary: 'Supprimer une ressource (propriétaire)',
          security: [{ bearerAuth: [] }],
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
          responses: { 200: { description: 'Ressource supprimée' } },
        },
      },

      // ── ADMIN RESOURCES ─────────────────────────────────────────────────────
      '/api/admin/resources': {
        get: {
          tags: ['Admin'],
          summary: 'Lister toutes les ressources',
          security: [{ bearerAuth: [] }],
          responses: { 200: { description: 'Liste complète' } },
        },
        post: {
          tags: ['Admin'],
          summary: 'Créer une ressource (admin)',
          security: [{ bearerAuth: [] }],
          responses: { 201: { description: 'Ressource créée' } },
        },
      },

      '/api/admin/resources/{id}': {
        put: {
          tags: ['Admin'],
          summary: 'Modifier n\'importe quelle ressource',
          security: [{ bearerAuth: [] }],
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
          responses: { 200: { description: 'Ressource mise à jour' } },
        },
        delete: {
          tags: ['Admin'],
          summary: 'Supprimer n\'importe quelle ressource',
          security: [{ bearerAuth: [] }],
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
          responses: { 200: { description: 'Ressource supprimée' } },
        },
      },

      '/api/admin/resources/{id}/suspend': {
        put: {
          tags: ['Admin'],
          summary: 'Suspendre une ressource',
          security: [{ bearerAuth: [] }],
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
          responses: { 200: { description: 'Ressource suspendue' } },
        },
      },

      // ── MODERATION ──────────────────────────────────────────────────────────
      '/api/moderation/pending': {
        get: {
          tags: ['Modération'],
          summary: 'Ressources en attente de validation',
          security: [{ bearerAuth: [] }],
          responses: { 200: { description: 'Liste des ressources en attente' } },
        },
      },

      '/api/moderation/resources/{id}/validate': {
        put: {
          tags: ['Modération'],
          summary: 'Valider une ressource',
          security: [{ bearerAuth: [] }],
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
          responses: { 200: { description: 'Ressource validée' } },
        },
      },

      '/api/moderation/resources/{id}/reject': {
        put: {
          tags: ['Modération'],
          summary: 'Rejeter une ressource',
          security: [{ bearerAuth: [] }],
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
          responses: { 200: { description: 'Ressource rejetée' } },
        },
      },

      // ── USERS ───────────────────────────────────────────────────────────────
      '/api/users': {
        get: {
          tags: ['Utilisateurs'],
          summary: 'Lister tous les utilisateurs (admin)',
          security: [{ bearerAuth: [] }],
          responses: { 200: { description: 'Liste des utilisateurs' } },
        },
      },

      '/api/users/staff': {
        post: {
          tags: ['Utilisateurs'],
          summary: 'Créer un compte staff (super_admin)',
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['email', 'password', 'first_name', 'last_name', 'role'],
                  properties: {
                    email:      { type: 'string', format: 'email' },
                    password:   { type: 'string' },
                    first_name: { type: 'string' },
                    last_name:  { type: 'string' },
                    role:       { type: 'string', enum: ['moderator', 'admin', 'super_admin'] },
                  },
                },
              },
            },
          },
          responses: { 201: { description: 'Compte staff créé' } },
        },
      },

      '/api/users/{id}/deactivate': {
        put: {
          tags: ['Utilisateurs'],
          summary: 'Désactiver un compte (admin)',
          security: [{ bearerAuth: [] }],
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
          responses: { 200: { description: 'Compte désactivé' } },
        },
      },

      '/api/users/{id}/activate': {
        put: {
          tags: ['Utilisateurs'],
          summary: 'Réactiver un compte (admin)',
          security: [{ bearerAuth: [] }],
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
          responses: { 200: { description: 'Compte réactivé' } },
        },
      },

      // ── RÉFÉRENTIELS ────────────────────────────────────────────────────────
      '/api/categories': {
        get:  { tags: ['Référentiels'], summary: 'Lister les catégories',             responses: { 200: { description: 'OK' } } },
        post: { tags: ['Référentiels'], summary: 'Créer une catégorie (admin)',       security: [{ bearerAuth: [] }], responses: { 201: { description: 'Créée' } } },
      },
      '/api/categories/{id}': {
        put:    { tags: ['Référentiels'], summary: 'Modifier une catégorie (admin)',   security: [{ bearerAuth: [] }], parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }], responses: { 200: { description: 'OK' } } },
        delete: { tags: ['Référentiels'], summary: 'Supprimer une catégorie (admin)', security: [{ bearerAuth: [] }], parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } } ], responses: { 200: { description: 'OK' } } },
      },
      '/api/resource-types': {
        get:  { tags: ['Référentiels'], summary: 'Lister les types de ressource',           responses: { 200: { description: 'OK' } } },
        post: { tags: ['Référentiels'], summary: 'Créer un type de ressource (admin)',      security: [{ bearerAuth: [] }], responses: { 201: { description: 'Créé' } } },
      },
      '/api/resource-types/{id}': {
        put:    { tags: ['Référentiels'], summary: 'Modifier un type de ressource (admin)',   security: [{ bearerAuth: [] }], parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }], responses: { 200: { description: 'OK' } } },
        delete: { tags: ['Référentiels'], summary: 'Supprimer un type de ressource (admin)', security: [{ bearerAuth: [] }], parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }], responses: { 200: { description: 'OK' } } },
      },
      '/api/relation-types': {
        get:  { tags: ['Référentiels'], summary: 'Lister les types de relation',           responses: { 200: { description: 'OK' } } },
        post: { tags: ['Référentiels'], summary: 'Créer un type de relation (admin)',      security: [{ bearerAuth: [] }], responses: { 201: { description: 'Créé' } } },
      },
      '/api/relation-types/{id}': {
        put:    { tags: ['Référentiels'], summary: 'Modifier un type de relation (admin)',   security: [{ bearerAuth: [] }], parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }], responses: { 200: { description: 'OK' } } },
        delete: { tags: ['Référentiels'], summary: 'Supprimer un type de relation (admin)', security: [{ bearerAuth: [] }], parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }], responses: { 200: { description: 'OK' } } },
      },

      // ── PROGRESSION ─────────────────────────────────────────────────────────
      '/api/progress/dashboard': {
        get: { tags: ['Progression'], summary: 'Tableau de bord de progression', security: [{ bearerAuth: [] }], responses: { 200: { description: 'OK' } } },
      },
      '/api/progress/favorites/{resourceId}': {
        post:   { tags: ['Progression'], summary: 'Ajouter aux favoris',       security: [{ bearerAuth: [] }], parameters: [{ name: 'resourceId', in: 'path', required: true, schema: { type: 'integer' } }], responses: { 200: { description: 'OK' } } },
        delete: { tags: ['Progression'], summary: 'Retirer des favoris',       security: [{ bearerAuth: [] }], parameters: [{ name: 'resourceId', in: 'path', required: true, schema: { type: 'integer' } }], responses: { 200: { description: 'OK' } } },
      },
      '/api/progress/exploited/{resourceId}': {
        put: { tags: ['Progression'], summary: 'Marquer comme exploitée',       security: [{ bearerAuth: [] }], parameters: [{ name: 'resourceId', in: 'path', required: true, schema: { type: 'integer' } }], responses: { 200: { description: 'OK' } } },
      },
      '/api/progress/saved/{resourceId}': {
        post:   { tags: ['Progression'], summary: 'Sauvegarder une ressource', security: [{ bearerAuth: [] }], parameters: [{ name: 'resourceId', in: 'path', required: true, schema: { type: 'integer' } }], responses: { 200: { description: 'OK' } } },
        delete: { tags: ['Progression'], summary: 'Retirer des sauvegardes',   security: [{ bearerAuth: [] }], parameters: [{ name: 'resourceId', in: 'path', required: true, schema: { type: 'integer' } }], responses: { 200: { description: 'OK' } } },
      },
    },
  },
  apis: [],
}

module.exports = swaggerJsdoc(options)
