const router = require('express').Router();
const categoryController = require('../controllers/categoryController');
const { requireAuth } = require('../middleware/auth');
const { requireRole } = require('../middleware/roles');

const adminOnly = [requireAuth, requireRole('admin')];

// C07 - Liste des catégories (public)
router.get('/', categoryController.list);

// C07 - Créer une catégorie (admin)
router.post('/', ...adminOnly, categoryController.create);

// C07 - Modifier une catégorie (admin)
router.put('/:id', ...adminOnly, categoryController.update);

// C07 - Supprimer une catégorie (admin)
router.delete('/:id', ...adminOnly, categoryController.remove);

module.exports = router;
