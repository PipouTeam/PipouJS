const hasKeys = require('has-keys');
const db = require('../models/database');

module.exports = {
    async list(req, res) {
        const result = await db.query('SELECT * FROM categories ORDER BY name ASC');
        return res.json({ status: true, categories: result.rows });
    },

    async create(req, res) {
        if (!hasKeys(req.body, ['name'])) {
            return res.status(400).json({ status: false, message: 'Champ requis : name' });
        }
        const result = await db.query(
            'INSERT INTO categories (name) VALUES ($1) RETURNING *',
            [req.body.name]
        );
        return res.status(201).json({ status: true, category: result.rows[0] });
    },

    async update(req, res) {
        if (!hasKeys(req.body, ['name'])) {
            return res.status(400).json({ status: false, message: 'Champ requis : name' });
        }
        const result = await db.query(
            'UPDATE categories SET name = $1 WHERE id = $2 RETURNING *',
            [req.body.name, req.params.id]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ status: false, message: 'Catégorie introuvable' });
        }
        return res.json({ status: true, category: result.rows[0] });
    },

    async remove(req, res) {
        const result = await db.query('DELETE FROM categories WHERE id = $1 RETURNING id', [req.params.id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ status: false, message: 'Catégorie introuvable' });
        }
        return res.json({ status: true, message: 'Catégorie supprimée' });
    },
};
