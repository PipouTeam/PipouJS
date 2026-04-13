// Module Commentaires (E01-E04)
// Table utilisée : comments (id, resource_id, user_id, parent_id, content, is_hidden)
//
// Endpoints à implémenter :
//   GET    /api/resources/:id/comments              → E01 : liste des commentaires (public, avec réponses)
//   POST   /api/resources/:id/comments              → E01 : poster un commentaire (JWT requis)
//   POST   /api/resources/:id/comments/:cid/reply   → E02 : répondre à un commentaire (parent_id = cid)
//   DELETE /api/comments/:id                        → E03 : supprimer son commentaire (ou moderator+)
//
// Modération :
//   DELETE /api/moderation/comments/:id             → M04 : masquer/supprimer (moderator+)

module.exports = {
    async list(req, res) {
        // TODO : retourner commentaires + réponses imbriquées (1 niveau)
        return res.status(501).json({ status: false, message: 'Not implemented' });
    },

    async create(req, res) {
        // TODO : créer commentaire (body: { content, parent_id? })
        return res.status(501).json({ status: false, message: 'Not implemented' });
    },

    async remove(req, res) {
        // TODO : supprimer si owner ou moderator+
        return res.status(501).json({ status: false, message: 'Not implemented' });
    },

    async moderate(req, res) {
        // TODO M04 : masquer ou supprimer un commentaire (moderator+)
        return res.status(501).json({ status: false, message: 'Not implemented' });
    },
};