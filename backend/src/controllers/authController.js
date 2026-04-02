const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const hasKeys = require('has-keys');
const db = require('../models/database');

const { SECRET } = process.env;

module.exports = {
    // U01 - Inscription
    async register(req, res) {
        if (!hasKeys(req.body, ['email', 'password', 'first_name', 'last_name'])) {
            return res.status(400).json({ status: false, message: 'Champs requis : email, password, first_name, last_name' });
        }
        const { email, password, first_name, last_name } = req.body;

        const existing = await db.query('SELECT id FROM users WHERE email = $1', [email]);
        if (existing.rows.length > 0) {
            return res.status(400).json({ status: false, message: 'Email déjà utilisé' });
        }

        const hash = await bcrypt.hash(password, 10);
        const result = await db.query(
            'INSERT INTO users (email, password, first_name, last_name) VALUES ($1, $2, $3, $4) RETURNING id',
            [email, hash, first_name, last_name]
        );

        return res.status(201).json({ status: true, message: 'Compte créé', id: result.rows[0].id });
    },

    // U02 - Connexion
    async login(req, res) {
        if (!hasKeys(req.body, ['email', 'password'])) {
            return res.status(400).json({ status: false, message: 'Champs requis : email, password' });
        }
        const { email, password } = req.body;

        const result = await db.query('SELECT * FROM users WHERE email = $1', [email]);
        if (result.rows.length === 0) {
            return res.status(401).json({ status: false, message: 'Identifiants invalides' });
        }

        const user = result.rows[0];
        if (!user.is_active) {
            return res.status(403).json({ status: false, message: 'Compte désactivé' });
        }

        const valid = await bcrypt.compare(password, user.password);
        if (!valid) {
            return res.status(401).json({ status: false, message: 'Identifiants invalides' });
        }

        const token = jwt.sign(
            { id: user.id, email: user.email, role: user.role },
            SECRET,
            { expiresIn: '7d' }
        );

        return res.json({
            status: true,
            token,
            user: {
                id: user.id,
                email: user.email,
                first_name: user.first_name,
                last_name: user.last_name,
                role: user.role,
            },
        });
    },

    // Profil courant
    async me(req, res) {
        const result = await db.query(
            'SELECT id, email, first_name, last_name, role, created_at FROM users WHERE id = $1',
            [req.user.id]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ status: false, message: 'Utilisateur introuvable' });
        }
        return res.json({ status: true, user: result.rows[0] });
    },

    // U06 - Modifier son propre profil
    async updateMe(req, res) {
        const { first_name, last_name, email } = req.body;
        const fields = [];
        const values = [];
        let i = 1;

        if (first_name) { fields.push(`first_name = $${i++}`); values.push(first_name); }
        if (last_name) { fields.push(`last_name = $${i++}`); values.push(last_name); }
        if (email) { fields.push(`email = $${i++}`); values.push(email); }

        if (fields.length === 0) {
            return res.status(400).json({ status: false, message: 'Aucun champ à mettre à jour' });
        }

        fields.push(`updated_at = CURRENT_TIMESTAMP`);
        values.push(req.user.id);

        await db.query(
            `UPDATE users SET ${fields.join(', ')} WHERE id = $${i}`,
            values
        );

        return res.json({ status: true, message: 'Profil mis à jour' });
    },
};
