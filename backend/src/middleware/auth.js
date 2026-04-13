const jwt = require('jsonwebtoken');

const { SECRET } = process.env;

// Middleware strict : exige un token valide
const requireAuth = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ status: false, message: 'Token manquant' });
    }
    const token = authHeader.split(' ')[1];
    try {
        req.user = jwt.verify(token, SECRET);
        next();
    } catch {
        return res.status(401).json({ status: false, message: 'Token invalide ou expiré' });
    }
};

// Middleware optionnel : enrichit req.user si token présent, continue sinon
const optionalAuth = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    if (authHeader && authHeader.startsWith('Bearer ')) {
        try {
            req.user = jwt.verify(authHeader.split(' ')[1], SECRET);
        } catch {
            // token invalide ignoré
        }
    }
    next();
};

module.exports = { requireAuth, optionalAuth };
