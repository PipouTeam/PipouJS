const router = require('express').Router();
const progressController = require('../controllers/progressController');
const { requireAuth } = require('../middleware/auth');

// P05 - Tableau de bord progression (TODO)
router.get('/dashboard', requireAuth, progressController.dashboard);

// P01 - Ajouter aux favoris (TODO)
router.post('/favorites/:resourceId', requireAuth, progressController.addFavorite);

// P02 - Retirer des favoris (TODO)
router.delete('/favorites/:resourceId', requireAuth, progressController.removeFavorite);

// P03 - Marquer comme exploitée (TODO)
router.put('/exploited/:resourceId', requireAuth, progressController.markExploited);

// P04 - Mettre de côté (TODO)
router.post('/saved/:resourceId', requireAuth, progressController.addSaved);

// P04 - Retirer de la liste "à voir" (TODO)
router.delete('/saved/:resourceId', requireAuth, progressController.removeSaved);

module.exports = router;
