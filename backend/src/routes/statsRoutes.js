const router = require('express').Router();
const db = require('../models/database');

// GET /api/stats — statistiques publiques pour la page d'accueil
router.get('/', async (req, res) => {
    const [resources, categories, contributors] = await Promise.all([
        db.query("SELECT COUNT(*) FROM resources WHERE status = 'validated' AND visibility = 'public'"),
        db.query("SELECT COUNT(*) FROM categories"),
        db.query("SELECT COUNT(DISTINCT author_id) FROM resources WHERE status = 'validated'"),
    ]);

    return res.json({
        status: true,
        resources: parseInt(resources.rows[0].count),
        categories: parseInt(categories.rows[0].count),
        contributors: parseInt(contributors.rows[0].count),
    });
});

module.exports = router;
