const router = require('express').Router();
const resourceTypeController = require('../controllers/resourceTypeController');
const { requireAuth } = require('../middleware/auth');
const { requireRole } = require('../middleware/roles');

const adminOnly = [requireAuth, requireRole('admin')];

// C09 - Liste des types de ressources (public)
router.get('/', resourceTypeController.list);

// C09 - Créer un type de ressource (admin)
router.post('/', ...adminOnly, resourceTypeController.create);

// C09 - Modifier un type de ressource (admin)
router.put('/:id', ...adminOnly, resourceTypeController.update);

// C09 - Supprimer un type de ressource (admin)
router.delete('/:id', ...adminOnly, resourceTypeController.remove);

module.exports = router;
