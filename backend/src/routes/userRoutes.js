const router = require('express').Router();
const userController = require('../controllers/userController');
const { requireAuth } = require('../middleware/auth');
const { requireRole } = require('../middleware/roles');

// U03 - Liste des utilisateurs (admin)
router.get('/', requireAuth, requireRole('admin'), userController.list);

// U04 - Désactiver un compte (admin)
router.put('/:id/deactivate', requireAuth, requireRole('admin'), userController.deactivate);

// U04 - Réactiver un compte (admin)
router.put('/:id/activate', requireAuth, requireRole('admin'), userController.activate);

// U05 - Créer un compte staff (super_admin)
router.post('/staff', requireAuth, requireRole('super_admin'), userController.createStaff);

// RGPD - Supprimer un utilisateur et purger ses fichiers S3 (admin)
router.delete('/:id', requireAuth, requireRole('admin'), userController.deleteUser);

module.exports = router;
