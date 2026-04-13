const hasKeys = require('has-keys');
const db = require('../models/database');

// Champs de jointure pour les détails d'une ressource
const RESOURCE_JOINS = `
    LEFT JOIN categories c ON r.category_id = c.id
    LEFT JOIN relation_types rt ON r.relation_type_id = rt.id
    LEFT JOIN resource_types rtype ON r.resource_type_id = rtype.id
    LEFT JOIN users u ON r.author_id = u.id
`;

const RESOURCE_FIELDS = `
    r.id, r.title, r.content, r.media_url, r.status, r.visibility, r.views, r.created_at, r.updated_at,
    c.name AS category, c.id AS category_id,
    rt.name AS relation_type, rt.id AS relation_type_id,
    rtype.name AS resource_type, rtype.id AS resource_type_id,
    u.id AS author_id, u.first_name AS author_first_name, u.last_name AS author_last_name
`;

module.exports = {
    // R01-R05 : Liste publique avec pagination, filtres, tri, recherche
    async list(req, res) {
        const {
            page = 1, limit = 10,
            category_id, relation_type_id, resource_type_id,
            sort = 'created_at', order = 'DESC',
            search,
        } = req.query;

        const offset = (parseInt(page) - 1) * parseInt(limit);
        const conditions = [];
        const values = [];
        let i = 1;

        // Visibilité selon l'utilisateur connecté ou non (R01, R06)
        if (req.user) {
            conditions.push(`(r.visibility = 'public' OR r.visibility = 'shared')`);
        } else {
            conditions.push(`r.visibility = 'public'`);
        }
        conditions.push(`r.status = 'validated'`);

        if (category_id) { conditions.push(`r.category_id = $${i++}`); values.push(category_id); }
        if (relation_type_id) { conditions.push(`r.relation_type_id = $${i++}`); values.push(relation_type_id); }
        if (resource_type_id) { conditions.push(`r.resource_type_id = $${i++}`); values.push(resource_type_id); }
        if (search) {
            conditions.push(`(r.title ILIKE $${i} OR r.content ILIKE $${i})`);
            values.push(`%${search}%`);
            i++;
        }

        const allowedSorts = { created_at: 'r.created_at', views: 'r.views', title: 'r.title' };
        const sortField = allowedSorts[sort] || 'r.created_at';
        const sortOrder = order.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

        const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

        const countResult = await db.query(
            `SELECT COUNT(*) FROM resources r ${RESOURCE_JOINS} ${where}`,
            values
        );
        const total = parseInt(countResult.rows[0].count);

        values.push(parseInt(limit), offset);
        const result = await db.query(
            `SELECT ${RESOURCE_FIELDS} FROM resources r ${RESOURCE_JOINS} ${where}
             ORDER BY ${sortField} ${sortOrder}
             LIMIT $${i++} OFFSET $${i}`,
            values
        );

        return res.json({
            status: true,
            total,
            page: parseInt(page),
            pages: Math.ceil(total / parseInt(limit)),
            resources: result.rows,
        });
    },

    // R02 : Détail d'une ressource
    async getOne(req, res) {
        const { id } = req.params;
        const result = await db.query(
            `SELECT ${RESOURCE_FIELDS} FROM resources r ${RESOURCE_JOINS} WHERE r.id = $1`,
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ status: false, message: 'Ressource introuvable' });
        }

        const resource = result.rows[0];

        // Vérification visibilité
        const isPublic = resource.visibility === 'public' && resource.status === 'validated';
        const isShared = resource.visibility === 'shared' && resource.status === 'validated' && req.user;
        const isOwner = req.user && req.user.id === resource.author_id;
        const isAdmin = req.user && ['admin', 'super_admin'].includes(req.user.role);

        if (!isPublic && !isShared && !isOwner && !isAdmin) {
            return res.status(403).json({ status: false, message: 'Accès refusé' });
        }

        // Incrémenter les vues pour les ressources publiques
        if (isPublic || isShared) {
            await db.query('UPDATE resources SET views = views + 1 WHERE id = $1', [id]);
        }

        return res.json({ status: true, resource });
    },

    // CR04 : Mes ressources (citoyen)
    async listMine(req, res) {
        const result = await db.query(
            `SELECT ${RESOURCE_FIELDS} FROM resources r ${RESOURCE_JOINS}
             WHERE r.author_id = $1 ORDER BY r.created_at DESC`,
            [req.user.id]
        );
        return res.json({ status: true, resources: result.rows });
    },

    // CR01 : Créer une ressource (citoyen)
    async create(req, res) {
        if (!hasKeys(req.body, ['title'])) {
            return res.status(400).json({ status: false, message: 'Champ requis : title' });
        }
        const { title, content, media_url, category_id, relation_type_id, resource_type_id, visibility = 'public' } = req.body;

        const isAdmin = ['admin', 'super_admin'].includes(req.user.role);
        // Si citoyen publie publiquement → en attente de modération
        const status = (!isAdmin && visibility === 'public') ? 'pending' : 'validated';

        const result = await db.query(
            `INSERT INTO resources (title, content, media_url, category_id, relation_type_id, resource_type_id, author_id, status, visibility)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING id`,
            [title, content, media_url, category_id, relation_type_id, resource_type_id, req.user.id, status, visibility]
        );

        return res.status(201).json({ status: true, message: 'Ressource créée', id: result.rows[0].id });
    },

    // CR02 : Modifier sa ressource
    async update(req, res) {
        const { id } = req.params;
        const resource = await db.query('SELECT * FROM resources WHERE id = $1', [id]);

        if (resource.rows.length === 0) {
            return res.status(404).json({ status: false, message: 'Ressource introuvable' });
        }

        const isOwner = resource.rows[0].author_id === req.user.id;
        const isAdmin = ['admin', 'super_admin'].includes(req.user.role);

        if (!isOwner && !isAdmin) {
            return res.status(403).json({ status: false, message: 'Accès refusé' });
        }

        const { title, content, media_url, category_id, relation_type_id, resource_type_id, visibility } = req.body;
        const fields = [];
        const values = [];
        let i = 1;

        if (title !== undefined) { fields.push(`title = $${i++}`); values.push(title); }
        if (content !== undefined) { fields.push(`content = $${i++}`); values.push(content); }
        if (media_url !== undefined) { fields.push(`media_url = $${i++}`); values.push(media_url); }
        if (category_id !== undefined) { fields.push(`category_id = $${i++}`); values.push(category_id); }
        if (relation_type_id !== undefined) { fields.push(`relation_type_id = $${i++}`); values.push(relation_type_id); }
        if (resource_type_id !== undefined) { fields.push(`resource_type_id = $${i++}`); values.push(resource_type_id); }
        if (visibility !== undefined) { fields.push(`visibility = $${i++}`); values.push(visibility); }

        if (fields.length === 0) {
            return res.status(400).json({ status: false, message: 'Aucun champ à mettre à jour' });
        }

        fields.push(`updated_at = CURRENT_TIMESTAMP`);
        values.push(id);

        await db.query(`UPDATE resources SET ${fields.join(', ')} WHERE id = $${i}`, values);

        return res.json({ status: true, message: 'Ressource mise à jour' });
    },

    // CR03 : Supprimer sa ressource
    async remove(req, res) {
        const { id } = req.params;
        const resource = await db.query('SELECT author_id FROM resources WHERE id = $1', [id]);

        if (resource.rows.length === 0) {
            return res.status(404).json({ status: false, message: 'Ressource introuvable' });
        }

        const isOwner = resource.rows[0].author_id === req.user.id;
        const isAdmin = ['admin', 'super_admin'].includes(req.user.role);

        if (!isOwner && !isAdmin) {
            return res.status(403).json({ status: false, message: 'Accès refusé' });
        }

        await db.query('DELETE FROM resources WHERE id = $1', [id]);
        return res.json({ status: true, message: 'Ressource supprimée' });
    },

    // ─── Admin ──────────────────────────────────────────────────────────────

    // C01/C02 : Liste admin avec tous statuts et filtres
    async adminList(req, res) {
        const { status, category_id, relation_type_id, resource_type_id, author_id, page = 1, limit = 20 } = req.query;
        const offset = (parseInt(page) - 1) * parseInt(limit);
        const conditions = [];
        const values = [];
        let i = 1;

        if (status) { conditions.push(`r.status = $${i++}`); values.push(status); }
        if (category_id) { conditions.push(`r.category_id = $${i++}`); values.push(category_id); }
        if (relation_type_id) { conditions.push(`r.relation_type_id = $${i++}`); values.push(relation_type_id); }
        if (resource_type_id) { conditions.push(`r.resource_type_id = $${i++}`); values.push(resource_type_id); }
        if (author_id) { conditions.push(`r.author_id = $${i++}`); values.push(author_id); }

        const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

        const countResult = await db.query(
            `SELECT COUNT(*) FROM resources r ${RESOURCE_JOINS} ${where}`, values
        );
        const total = parseInt(countResult.rows[0].count);

        values.push(parseInt(limit), offset);
        const result = await db.query(
            `SELECT ${RESOURCE_FIELDS} FROM resources r ${RESOURCE_JOINS} ${where}
             ORDER BY r.created_at DESC LIMIT $${i++} OFFSET $${i}`,
            values
        );

        return res.json({ status: true, total, page: parseInt(page), resources: result.rows });
    },

    // C03 : Créer une ressource (admin)
    async adminCreate(req, res) {
        if (!hasKeys(req.body, ['title'])) {
            return res.status(400).json({ status: false, message: 'Champ requis : title' });
        }
        const { title, content, media_url, category_id, relation_type_id, resource_type_id, visibility = 'public', status = 'validated' } = req.body;

        const result = await db.query(
            `INSERT INTO resources (title, content, media_url, category_id, relation_type_id, resource_type_id, author_id, status, visibility)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING id`,
            [title, content, media_url, category_id, relation_type_id, resource_type_id, req.user.id, status, visibility]
        );

        return res.status(201).json({ status: true, message: 'Ressource créée', id: result.rows[0].id });
    },

    // C04 : Modifier une ressource (admin)
    async adminUpdate(req, res) {
        const { id } = req.params;
        const { title, content, media_url, category_id, relation_type_id, resource_type_id, visibility, status } = req.body;
        const fields = [];
        const values = [];
        let i = 1;

        if (title !== undefined) { fields.push(`title = $${i++}`); values.push(title); }
        if (content !== undefined) { fields.push(`content = $${i++}`); values.push(content); }
        if (media_url !== undefined) { fields.push(`media_url = $${i++}`); values.push(media_url); }
        if (category_id !== undefined) { fields.push(`category_id = $${i++}`); values.push(category_id); }
        if (relation_type_id !== undefined) { fields.push(`relation_type_id = $${i++}`); values.push(relation_type_id); }
        if (resource_type_id !== undefined) { fields.push(`resource_type_id = $${i++}`); values.push(resource_type_id); }
        if (visibility !== undefined) { fields.push(`visibility = $${i++}`); values.push(visibility); }
        if (status !== undefined) { fields.push(`status = $${i++}`); values.push(status); }

        if (fields.length === 0) {
            return res.status(400).json({ status: false, message: 'Aucun champ à mettre à jour' });
        }

        fields.push(`updated_at = CURRENT_TIMESTAMP`);
        values.push(id);

        const result = await db.query(
            `UPDATE resources SET ${fields.join(', ')} WHERE id = $${i} RETURNING id`,
            values
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ status: false, message: 'Ressource introuvable' });
        }

        return res.json({ status: true, message: 'Ressource mise à jour' });
    },

    // C05 : Supprimer (admin)
    async adminRemove(req, res) {
        const { id } = req.params;
        const result = await db.query('DELETE FROM resources WHERE id = $1 RETURNING id', [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ status: false, message: 'Ressource introuvable' });
        }
        return res.json({ status: true, message: 'Ressource supprimée' });
    },

    // C06 : Suspendre (admin)
    async suspend(req, res) {
        const { id } = req.params;
        const result = await db.query(
            `UPDATE resources SET status = 'suspended', updated_at = CURRENT_TIMESTAMP WHERE id = $1 RETURNING id`,
            [id]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ status: false, message: 'Ressource introuvable' });
        }
        return res.json({ status: true, message: 'Ressource suspendue' });
    },

    // ─── Modération (TODO collègue M01-M03) ─────────────────────────────────

    // M03 : Liste des ressources en attente
    async pendingList(req, res) {
        // TODO collègue : implémenter M03 - liste resources avec status='pending'
        return res.status(501).json({ status: false, message: 'Not implemented' });
    },

    // M01 : Valider une ressource
    async validate(req, res) {
        // TODO collègue : implémenter M01 - passer status à 'validated'
        return res.status(501).json({ status: false, message: 'Not implemented' });
    },

    // M02 : Rejeter une ressource
    async reject(req, res) {
        // TODO collègue : implémenter M02 - passer status à 'draft' ou autre + motif
        return res.status(501).json({ status: false, message: 'Not implemented' });
    },
};
