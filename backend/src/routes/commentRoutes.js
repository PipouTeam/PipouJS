// TODO collègue : routes commentaires (E01-E04)
const router = require('express').Router({ mergeParams: true });
const commentController = require('../controllers/commentController');
const { requireAuth, optionalAuth } = require('../middleware/auth');

router.get('/', optionalAuth, commentController.list);
router.post('/', requireAuth, commentController.create);
router.delete('/:commentId', requireAuth, commentController.remove);

module.exports = router;
