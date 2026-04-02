const router = require('express').Router();
const resourceController = require('../controllers/resourceController');
const { requireAuth } = require('../middleware/auth');
const { requireRole } = require('../middleware/roles');

const modOnly = [requireAuth, requireRole('moderator')];

// M03 - Liste des ressources en attente (TODO)
router.get('/pending', ...modOnly, resourceController.pendingList);

// M01 - Valider une ressource (TODO)
router.put('/resources/:id/validate', ...modOnly, resourceController.validate);

// M02 - Rejeter une ressource (TODO)
router.put('/resources/:id/reject', ...modOnly, resourceController.reject);

// M04 - Masquer un commentaire (TODO)

module.exports = router;
