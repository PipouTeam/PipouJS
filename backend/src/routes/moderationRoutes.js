const router = require('express').Router();
const resourceController = require('../controllers/resourceController');
const { requireAuth } = require('../middleware/auth');
const { requireRole } = require('../middleware/roles');

const modOnly = [requireAuth, requireRole('moderator')];

// TODO collègue : implémenter M01-M04
router.get('/pending', ...modOnly, resourceController.pendingList);
router.put('/resources/:id/validate', ...modOnly, resourceController.validate);
router.put('/resources/:id/reject', ...modOnly, resourceController.reject);

module.exports = router;
