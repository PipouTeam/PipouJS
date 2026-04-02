const router = require('express').Router();
const resourceController = require('../controllers/resourceController');
const { requireAuth, optionalAuth } = require('../middleware/auth');
const { requireRole } = require('../middleware/roles');

// Routes publiques / optionnellement authentifiées
router.get('/', optionalAuth, resourceController.list);
router.get('/mine', requireAuth, resourceController.listMine);
router.get('/:id', optionalAuth, resourceController.getOne);

// Routes citoyen connecté
router.post('/', requireAuth, resourceController.create);
router.put('/:id', requireAuth, resourceController.update);
router.delete('/:id', requireAuth, resourceController.remove);

module.exports = router;
