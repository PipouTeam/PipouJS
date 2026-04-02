// TODO collègue : Module Progression utilisateur (P01-P05)
// Table utilisée : user_resources (user_id, resource_id, is_favorite, is_exploited, is_saved)
//
// Endpoints à implémenter :
//   GET    /api/progress/dashboard        → P05 : favoris, exploitées, mises de côté (compteurs + listes)
//   POST   /api/progress/favorites/:id    → P01 : ajouter aux favoris
//   DELETE /api/progress/favorites/:id    → P02 : retirer des favoris
//   PUT    /api/progress/exploited/:id    → P03 : marquer comme exploitée
//   POST   /api/progress/saved/:id        → P04 : mettre de côté
//   DELETE /api/progress/saved/:id        → P04 : retirer de la liste "à voir"
//
// Pattern pour upsert PostgreSQL :
//   INSERT INTO user_resources (user_id, resource_id, is_favorite)
//   VALUES ($1, $2, TRUE)
//   ON CONFLICT (user_id, resource_id)
//   DO UPDATE SET is_favorite = TRUE, updated_at = CURRENT_TIMESTAMP

module.exports = {
    async dashboard(req, res) {
        // TODO : retourner { favorites: [...], exploited: [...], saved: [...] }
        return res.status(501).json({ status: false, message: 'Not implemented' });
    },

    async addFavorite(req, res) {
        // TODO
        return res.status(501).json({ status: false, message: 'Not implemented' });
    },

    async removeFavorite(req, res) {
        // TODO
        return res.status(501).json({ status: false, message: 'Not implemented' });
    },

    async markExploited(req, res) {
        // TODO
        return res.status(501).json({ status: false, message: 'Not implemented' });
    },

    async addSaved(req, res) {
        // TODO
        return res.status(501).json({ status: false, message: 'Not implemented' });
    },

    async removeSaved(req, res) {
        // TODO
        return res.status(501).json({ status: false, message: 'Not implemented' });
    },
};
