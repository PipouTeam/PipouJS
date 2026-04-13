const router = require('express').Router();
const resourceController = require('../controllers/resourceController');
const { requireAuth } = require('../middleware/auth');
const { requireRole } = require('../middleware/roles');

const adminOnly = [requireAuth, requireRole('admin')];

// C01, C02 - Liste toutes les ressources avec filtres (admin)
router.get('/', ...adminOnly, resourceController.adminList);

// C03 - Créer une ressource (admin)
router.post('/', ...adminOnly, resourceController.adminCreate);

// C04 - Modifier une ressource (admin)
router.put('/:id', ...adminOnly, resourceController.adminUpdate);

// C05 - Supprimer une ressource (admin)
router.delete('/:id', ...adminOnly, resourceController.adminRemove);

// C06 - Suspendre une ressource (admin)
router.put('/:id/suspend', ...adminOnly, resourceController.suspend);

module.exports = router;
