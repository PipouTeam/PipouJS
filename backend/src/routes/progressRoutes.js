// TODO collègue : routes progression (P01-P05)
const router = require('express').Router();
const progressController = require('../controllers/progressController');
const { requireAuth } = require('../middleware/auth');

router.get('/dashboard', requireAuth, progressController.dashboard);
router.post('/favorites/:resourceId', requireAuth, progressController.addFavorite);
router.delete('/favorites/:resourceId', requireAuth, progressController.removeFavorite);
router.put('/exploited/:resourceId', requireAuth, progressController.markExploited);
router.post('/saved/:resourceId', requireAuth, progressController.addSaved);
router.delete('/saved/:resourceId', requireAuth, progressController.removeSaved);

module.exports = router;
