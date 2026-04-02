const router = require('express').Router();
const relationTypeController = require('../controllers/relationTypeController');
const { requireAuth } = require('../middleware/auth');
const { requireRole } = require('../middleware/roles');

const adminOnly = [requireAuth, requireRole('admin')];

// C08 - Liste des types de relations (public)
router.get('/', relationTypeController.list);

// C08 - Créer un type de relation (admin)
router.post('/', ...adminOnly, relationTypeController.create);

// C08 - Modifier un type de relation (admin)
router.put('/:id', ...adminOnly, relationTypeController.update);

// C08 - Supprimer un type de relation (admin)
router.delete('/:id', ...adminOnly, relationTypeController.remove);

module.exports = router;
