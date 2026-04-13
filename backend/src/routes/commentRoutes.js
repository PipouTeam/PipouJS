const router = require('express').Router({ mergeParams: true });
const commentController = require('../controllers/commentController');
const { requireAuth, optionalAuth } = require('../middleware/auth');

// E01 - Liste des commentaires
router.get('/', optionalAuth, commentController.list);

// E01 - Poster un commentaire
router.post('/', requireAuth, commentController.create);

// E02 - Répondre à un commentaire (TODO : ajouter POST /:commentId/reply)

// E03 - Supprimer son commentaire
router.delete('/:commentId', requireAuth, commentController.remove);

module.exports = router;