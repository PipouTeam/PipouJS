const router = require('express').Router();
const resourceController = require('../controllers/resourceController');
const { requireAuth, optionalAuth } = require('../middleware/auth');

// R01, R03, R04, R05 - Liste publique avec pagination, filtres, tri, recherche
router.get('/', optionalAuth, resourceController.list);

// CR04 - Mes ressources
router.get('/mine', requireAuth, resourceController.listMine);

// R02 - Détail d'une ressource
router.get('/:id', optionalAuth, resourceController.getOne);

// CR01 - Créer une ressource (citoyen)
router.post('/', requireAuth, resourceController.create);

// CR02 - Modifier sa ressource
router.put('/:id', requireAuth, resourceController.update);

// CR03 - Supprimer sa ressource
router.delete('/:id', requireAuth, resourceController.remove);

module.exports = router;
