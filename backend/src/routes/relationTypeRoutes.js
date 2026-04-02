const router = require('express').Router();
const relationTypeController = require('../controllers/relationTypeController');
const { requireAuth } = require('../middleware/auth');
const { requireRole } = require('../middleware/roles');

const adminOnly = [requireAuth, requireRole('admin')];

router.get('/', relationTypeController.list);
router.post('/', ...adminOnly, relationTypeController.create);
router.put('/:id', ...adminOnly, relationTypeController.update);
router.delete('/:id', ...adminOnly, relationTypeController.remove);

module.exports = router;
