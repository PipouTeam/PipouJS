const db = require('../models/database');

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

    // E01 : Liste des commentaires d'une ressource (public, avec réponses imbriquées)
    async list(req, res) {
        const { id: resource_id } = req.params;

        // Vérifier que la ressource existe et est accessible
        const resource = await db.query(
            `SELECT id, visibility, status FROM resources WHERE id = $1`,
            [resource_id]
        );
        if (resource.rows.length === 0) {
            return res.status(404).json({ status: false, message: 'Ressource introuvable' });
        }

        const r = resource.rows[0];
        const isPublic = r.visibility === 'public' && r.status === 'validated';
        const isShared = r.visibility === 'shared' && r.status === 'validated' && req.user;
        const isAdmin  = req.user && ['admin', 'super_admin'].includes(req.user.role);

        if (!isPublic && !isShared && !isAdmin) {
            return res.status(403).json({ status: false, message: 'Accès refusé' });
        }

        // Récupérer tous les commentaires visibles (parents + réponses)
        const result = await db.query(
            `SELECT
                c.id, c.content, c.parent_id, c.is_hidden, c.created_at,
                u.id         AS user_id,
                u.first_name AS user_first_name,
                u.last_name  AS user_last_name
             FROM comments c
             JOIN users u ON c.user_id = u.id
             WHERE c.resource_id = $1
               AND c.is_hidden = false
             ORDER BY c.created_at ASC`,
            [resource_id]
        );

        // Construire l'arbre parent → replies (1 niveau)
        const map = {};
        const roots = [];

        for (const row of result.rows) {
            map[row.id] = { ...row, replies: [] };
        }
        for (const row of result.rows) {
            if (row.parent_id && map[row.parent_id]) {
                map[row.parent_id].replies.push(map[row.id]);
            } else {
                roots.push(map[row.id]);
            }
        }

        return res.json({ status: true, comments: roots });
    },

    // E01 : Poster un commentaire (JWT requis)
    async create(req, res) {
        const { id: resource_id } = req.params;
        const { content } = req.body;

        if (!content || content.trim() === '') {
            return res.status(400).json({ status: false, message: 'Champ requis : content' });
        }

        // Vérifier que la ressource est validée
        const resource = await db.query(
            `SELECT id FROM resources WHERE id = $1 AND status = 'validated'`,
            [resource_id]
        );
        if (resource.rows.length === 0) {
            return res.status(404).json({ status: false, message: 'Ressource introuvable ou non validée' });
        }

        const result = await db.query(
            `INSERT INTO comments (resource_id, user_id, content)
             VALUES ($1, $2, $3)
             RETURNING id, content, created_at`,
            [resource_id, req.user.id, content.trim()]
        );

        return res.status(201).json({
            status: true,
            message: 'Commentaire posté',
            comment: result.rows[0],
        });
    },

    // E02 : Répondre à un commentaire (parent_id = cid)
    async reply(req, res) {
        const { id: resource_id, cid } = req.params;
        const { content } = req.body;

        if (!content || content.trim() === '') {
            return res.status(400).json({ status: false, message: 'Champ requis : content' });
        }

        // Vérifier que la ressource est validée
        const resource = await db.query(
            `SELECT id FROM resources WHERE id = $1 AND status = 'validated'`,
            [resource_id]
        );
        if (resource.rows.length === 0) {
            return res.status(404).json({ status: false, message: 'Ressource introuvable ou non validée' });
        }

        // Vérifier que le commentaire parent existe, appartient à cette ressource et n'est pas lui-même une réponse
        const parent = await db.query(
            `SELECT id, parent_id FROM comments WHERE id = $1 AND resource_id = $2 AND is_hidden = false`,
            [cid, resource_id]
        );
        if (parent.rows.length === 0) {
            return res.status(404).json({ status: false, message: 'Commentaire parent introuvable' });
        }
        if (parent.rows[0].parent_id !== null) {
            return res.status(400).json({ status: false, message: 'Impossible de répondre à une réponse' });
        }

        const result = await db.query(
            `INSERT INTO comments (resource_id, user_id, content, parent_id)
             VALUES ($1, $2, $3, $4)
             RETURNING id, content, parent_id, created_at`,
            [resource_id, req.user.id, content.trim(), cid]
        );

        return res.status(201).json({
            status: true,
            message: 'Réponse postée',
            comment: result.rows[0],
        });
    },

    // E03 : Supprimer son commentaire (ou moderator+)
    async remove(req, res) {
        const { commentId } = req.params;

        const comment = await db.query(
            `SELECT id, user_id FROM comments WHERE id = $1`,
            [commentId]
        );
        if (comment.rows.length === 0) {
            return res.status(404).json({ status: false, message: 'Commentaire introuvable' });
        }

        const isOwner     = comment.rows[0].user_id === req.user.id;
        const isModerator = ['moderator', 'admin', 'super_admin'].includes(req.user.role);

        if (!isOwner && !isModerator) {
            return res.status(403).json({ status: false, message: 'Accès refusé' });
        }

        // Supprimer les réponses enfants puis le commentaire
        await db.query(`DELETE FROM comments WHERE parent_id = $1`, [commentId]);
        await db.query(`DELETE FROM comments WHERE id = $1`, [commentId]);

        return res.json({ status: true, message: 'Commentaire supprimé' });
    },

    // M04 : Masquer un commentaire (moderator+)
    async moderate(req, res) {
        const { id } = req.params;

        const comment = await db.query(
            `SELECT id FROM comments WHERE id = $1`,
            [id]
        );
        if (comment.rows.length === 0) {
            return res.status(404).json({ status: false, message: 'Commentaire introuvable' });
        }

        await db.query(
            `UPDATE comments SET is_hidden = true WHERE id = $1`,
            [id]
        );

        return res.json({ status: true, message: 'Commentaire masqué' });
    },
};