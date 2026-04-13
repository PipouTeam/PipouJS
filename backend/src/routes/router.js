const router = require('express').Router();

router.use('/api/auth', require('./authRoutes'));
router.use('/api/users', require('./userRoutes'));
router.use('/api/resources', require('./resourceRoutes'));
router.use('/api/resources/:resourceId/comments', require('./commentRoutes'));
router.use('/api/admin/resources', require('./adminResourceRoutes'));
router.use('/api/moderation', require('./moderationRoutes'));
router.use('/api/categories', require('./categoryRoutes'));
router.use('/api/relation-types', require('./relationTypeRoutes'));
router.use('/api/resource-types', require('./resourceTypeRoutes'));
router.use('/api/progress', require('./progressRoutes'));
router.use('/api/upload',  require('./uploadRoutes'));

module.exports = router;
