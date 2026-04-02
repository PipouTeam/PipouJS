const router = require('express').Router();
const userController = require('../controllers/userController');
const { requireAuth } = require('../middleware/auth');
const { requireRole } = require('../middleware/roles');

router.get('/', requireAuth, requireRole('admin'), userController.list);
router.put('/:id/deactivate', requireAuth, requireRole('admin'), userController.deactivate);
router.put('/:id/activate', requireAuth, requireRole('admin'), userController.activate);
router.post('/staff', requireAuth, requireRole('super_admin'), userController.createStaff);

module.exports = router;
