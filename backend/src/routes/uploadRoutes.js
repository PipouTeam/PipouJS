const router  = require('express').Router();
const multer  = require('multer');
const { requireAuth } = require('../middleware/auth');
const { uploadFile }  = require('../services/s3');
const db = require('../models/database');

// Stockage en mémoire — le fichier est envoyé directement à S3
const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 50 * 1024 * 1024 }, // 50 Mo
    fileFilter: (req, file, cb) => {
        const allowed = [
            'application/pdf',
            'image/jpeg', 'image/png', 'image/webp', 'image/gif',
            'video/mp4', 'video/webm',
            'audio/mpeg', 'audio/ogg',
        ];
        if (allowed.includes(file.mimetype)) return cb(null, true);
        cb(new Error('Type de fichier non supporté'));
    },
});

// POST /api/upload — upload vers S3/Cellar, retourne l'URL publique
router.post('/', requireAuth, upload.single('file'), async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ status: false, message: 'Aucun fichier reçu' });
    }

    const { url, key } = await uploadFile(req.file.buffer, req.file.originalname, req.file.mimetype);

    // Traçabilité RGPD : lier le fichier à l'utilisateur
    await db.query(
        'INSERT INTO user_files (user_id, s3_key, original_name, mime_type, size_bytes) VALUES ($1, $2, $3, $4, $5)',
        [req.user.id, key, req.file.originalname, req.file.mimetype, req.file.size]
    );

    return res.json({ status: true, url });
});

module.exports = router;
