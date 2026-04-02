const router = require('express').Router();
const resourceTypeController = require('../controllers/resourceTypeController');
const { requireAuth } = require('../middleware/auth');
const { requireRole } = require('../middleware/roles');

const adminOnly = [requireAuth, requireRole('admin')];

router.get('/', resourceTypeController.list);
router.post('/', ...adminOnly, resourceTypeController.create);
router.put('/:id', ...adminOnly, resourceTypeController.update);
router.delete('/:id', ...adminOnly, resourceTypeController.remove);

module.exports = router;
