const router = require('express').Router({ mergeParams: true });
const commentController = require('../controllers/commentController');
const { requireAuth, optionalAuth } = require('../middleware/auth');
 
// E01 - Liste des commentaires (public, avec réponses imbriquées)
router.get('/', optionalAuth, commentController.list);
 
// E01 - Poster un commentaire (JWT requis)
router.post('/', requireAuth, commentController.create);
 
// E02 - Répondre à un commentaire (JWT requis)
router.post('/:cid/reply', requireAuth, commentController.reply);
 
// E03 - Supprimer son commentaire (ou moderator+)
router.delete('/:commentId', requireAuth, commentController.remove);
 
module.exports = router;