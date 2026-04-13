const router = require('express').Router();
const authController = require('../controllers/authController');
const { requireAuth } = require('../middleware/auth');

// U01 - Inscription
router.post('/register', authController.register);

// U02 - Connexion
router.post('/login', authController.login);

// U02 - Profil courant
router.get('/me', requireAuth, authController.me);

// U06 - Modifier son profil
router.put('/me', requireAuth, authController.updateMe);

module.exports = router;
