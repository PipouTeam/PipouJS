const router = require('express').Router();
const categoryController = require('../controllers/categoryController');
const { requireAuth } = require('../middleware/auth');
const { requireRole } = require('../middleware/roles');

const adminOnly = [requireAuth, requireRole('admin')];

router.get('/', categoryController.list);
router.post('/', ...adminOnly, categoryController.create);
router.put('/:id', ...adminOnly, categoryController.update);
router.delete('/:id', ...adminOnly, categoryController.remove);

module.exports = router;
