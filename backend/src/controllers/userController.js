const bcrypt = require('bcryptjs');
const hasKeys = require('has-keys');
const db = require('../models/database');
const { deleteFiles } = require('../services/s3');

module.exports = {
    // Liste tous les utilisateurs (admin)
    async list(req, res) {
        const result = await db.query(
            'SELECT id, email, first_name, last_name, role, is_active, created_at FROM users ORDER BY created_at DESC'
        );
        return res.json({ status: true, users: result.rows });
    },

    // U04 - Désactiver un compte
    async deactivate(req, res) {
        const { id } = req.params;
        await db.query('UPDATE users SET is_active = FALSE, updated_at = CURRENT_TIMESTAMP WHERE id = $1', [id]);
        return res.json({ status: true, message: 'Compte désactivé' });
    },

    // U04 - Réactiver un compte
    async activate(req, res) {
        const { id } = req.params;
        await db.query('UPDATE users SET is_active = TRUE, updated_at = CURRENT_TIMESTAMP WHERE id = $1', [id]);
        return res.json({ status: true, message: 'Compte réactivé' });
    },

    // U05 - Créer un compte staff (moderator ou admin) — super_admin uniquement
    async createStaff(req, res) {
        if (!hasKeys(req.body, ['email', 'password', 'first_name', 'last_name', 'role'])) {
            return res.status(400).json({ status: false, message: 'Champs requis : email, password, first_name, last_name, role' });
        }
        const { email, password, first_name, last_name, role } = req.body;

        if (!['moderator', 'admin'].includes(role)) {
            return res.status(400).json({ status: false, message: 'Rôle invalide (moderator ou admin)' });
        }

        const existing = await db.query('SELECT id FROM users WHERE email = $1', [email]);
        if (existing.rows.length > 0) {
            return res.status(400).json({ status: false, message: 'Email déjà utilisé' });
        }

        const hash = await bcrypt.hash(password, 10);
        const result = await db.query(
            'INSERT INTO users (email, password, first_name, last_name, role) VALUES ($1, $2, $3, $4, $5) RETURNING id',
            [email, hash, first_name, last_name, role]
        );

        return res.status(201).json({ status: true, message: 'Compte staff créé', id: result.rows[0].id });
    },

    // RGPD : Supprimer un utilisateur et tous ses fichiers S3
    async deleteUser(req, res) {
        const { id } = req.params;

        const user = await db.query('SELECT id FROM users WHERE id = $1', [id]);
        if (user.rows.length === 0) {
            return res.status(404).json({ status: false, message: 'Utilisateur introuvable' });
        }

        // Récupérer toutes les clés S3 de l'utilisateur avant suppression
        const files = await db.query('SELECT s3_key FROM user_files WHERE user_id = $1', [id]);
        const keys = files.rows.map(f => f.s3_key);

        // Supprimer les fichiers S3
        if (keys.length > 0) {
            await deleteFiles(keys);
        }

        // CASCADE supprime resources, user_resources, comments, user_files
        await db.query('DELETE FROM users WHERE id = $1', [id]);

        return res.json({ status: true, message: 'Utilisateur et données associées supprimés' });
    },
};
