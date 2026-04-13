const db = require('../models/database');

module.exports = {
    // P05 : Tableau de bord — favoris + exploités
    async dashboard(req, res) {
        const userId = req.user.id;

        const result = await db.query(`
            SELECT
                ur.is_favorite, ur.is_exploited,
                r.id, r.title, r.visibility, r.status,
                c.name  AS category,  c.id  AS category_id,
                rt.name AS resource_type, rt.id AS resource_type_id
            FROM user_resources ur
            JOIN resources r ON ur.resource_id = r.id
            LEFT JOIN categories c ON r.category_id = c.id
            LEFT JOIN resource_types rt ON r.resource_type_id = rt.id
            WHERE ur.user_id = $1
        `, [userId]);

        const favorites = result.rows.filter(r => r.is_favorite)
        const exploited = result.rows.filter(r => r.is_exploited)

        return res.json({ status: true, favorites, exploited });
    },

    // P01 : Ajouter aux favoris
    async addFavorite(req, res) {
        const { resourceId } = req.params;
        const userId = req.user.id;

        await db.query(`
            INSERT INTO user_resources (user_id, resource_id, is_favorite)
            VALUES ($1, $2, TRUE)
            ON CONFLICT (user_id, resource_id)
            DO UPDATE SET is_favorite = TRUE, updated_at = CURRENT_TIMESTAMP
        `, [userId, resourceId]);

        return res.json({ status: true, message: 'Ajouté aux favoris' });
    },

    // P02 : Retirer des favoris
    async removeFavorite(req, res) {
        const { resourceId } = req.params;
        const userId = req.user.id;

        await db.query(`
            INSERT INTO user_resources (user_id, resource_id, is_favorite)
            VALUES ($1, $2, FALSE)
            ON CONFLICT (user_id, resource_id)
            DO UPDATE SET is_favorite = FALSE, updated_at = CURRENT_TIMESTAMP
        `, [userId, resourceId]);

        return res.json({ status: true, message: 'Retiré des favoris' });
    },

    // P03 : Marquer comme exploitée
    async markExploited(req, res) {
        const { resourceId } = req.params;
        const userId = req.user.id;

        await db.query(`
            INSERT INTO user_resources (user_id, resource_id, is_exploited)
            VALUES ($1, $2, TRUE)
            ON CONFLICT (user_id, resource_id)
            DO UPDATE SET is_exploited = TRUE, updated_at = CURRENT_TIMESTAMP
        `, [userId, resourceId]);

        return res.json({ status: true, message: 'Ressource marquée comme consultée' });
    },

    // P04 : Mettre de côté / retirer
    async addSaved(req, res) {
        const { resourceId } = req.params;
        const userId = req.user.id;

        await db.query(`
            INSERT INTO user_resources (user_id, resource_id, is_saved)
            VALUES ($1, $2, TRUE)
            ON CONFLICT (user_id, resource_id)
            DO UPDATE SET is_saved = TRUE, updated_at = CURRENT_TIMESTAMP
        `, [userId, resourceId]);

        return res.json({ status: true, message: 'Ressource mise de côté' });
    },

    async removeSaved(req, res) {
        const { resourceId } = req.params;
        const userId = req.user.id;

        await db.query(`
            INSERT INTO user_resources (user_id, resource_id, is_saved)
            VALUES ($1, $2, FALSE)
            ON CONFLICT (user_id, resource_id)
            DO UPDATE SET is_saved = FALSE, updated_at = CURRENT_TIMESTAMP
        `, [userId, resourceId]);

        return res.json({ status: true, message: 'Ressource retirée de la liste' });
    },
};
