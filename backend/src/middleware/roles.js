const ROLE_LEVELS = {
    citizen: 1,
    moderator: 2,
    admin: 3,
    super_admin: 4,
};

// Génère un middleware qui exige un rôle minimum
const requireRole = (minRole) => (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({ status: false, message: 'Non authentifié' });
    }
    const userLevel = ROLE_LEVELS[req.user.role] || 0;
    const requiredLevel = ROLE_LEVELS[minRole] || 0;
    if (userLevel < requiredLevel) {
        return res.status(403).json({ status: false, message: 'Accès refusé' });
    }
    next();
};

module.exports = { requireRole };
