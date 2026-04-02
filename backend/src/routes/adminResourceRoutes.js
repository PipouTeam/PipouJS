const router = require('express').Router();
const resourceController = require('../controllers/resourceController');
const { requireAuth } = require('../middleware/auth');
const { requireRole } = require('../middleware/roles');

const adminOnly = [requireAuth, requireRole('admin')];

router.get('/', ...adminOnly, resourceController.adminList);
router.post('/', ...adminOnly, resourceController.adminCreate);
router.put('/:id', ...adminOnly, resourceController.adminUpdate);
router.delete('/:id', ...adminOnly, resourceController.adminRemove);
router.put('/:id/suspend', ...adminOnly, resourceController.suspend);

module.exports = router;
