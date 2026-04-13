const { S3Client, PutObjectCommand, DeleteObjectCommand } = require('@aws-sdk/client-s3');
const path = require('path');

const s3 = new S3Client({
    endpoint: process.env.S3_ENDPOINT,
    region: 'us-east-1',            // Cellar ignore la région, mais le SDK l'exige
    credentials: {
        accessKeyId: process.env.S3_ACCESS_KEY,
        secretAccessKey: process.env.S3_SECRET_KEY,
    },
    forcePathStyle: true,            // Obligatoire pour Cellar (path-style vs virtual-hosted)
});

const BUCKET = process.env.S3_BUCKET;

/**
 * Upload un fichier sur S3/Cellar.
 * @param {Buffer} buffer    - Contenu du fichier (depuis multer memoryStorage)
 * @param {string} originalName - Nom original du fichier
 * @param {string} mimetype  - Type MIME
 * @returns {Promise<string>} URL publique du fichier
 */
async function uploadFile(buffer, originalName, mimetype) {
    const ext = path.extname(originalName);
    const key = `${Date.now()}-${Math.round(Math.random() * 1e6)}${ext}`;

    await s3.send(new PutObjectCommand({
        Bucket: BUCKET,
        Key: key,
        Body: buffer,
        ContentType: mimetype,
        ACL: 'public-read',
    }));

    const base = process.env.S3_PUBLIC_URL || process.env.S3_ENDPOINT;
    return { url: `${base}/${BUCKET}/${key}`, key };
}

/**
 * Supprime un fichier sur S3/Cellar à partir de son URL.
 * @param {string} fileUrl - URL publique du fichier
 */
async function deleteFile(fileUrl) {
    try {
        const url = new URL(fileUrl);
        // Path-style : /<bucket>/<key> → on retire le bucket du chemin
        const parts = url.pathname.slice(1).split('/');
        parts.shift(); // retire le nom du bucket
        const key = parts.join('/');
        await s3.send(new DeleteObjectCommand({
            Bucket: BUCKET,
            Key: key,
        }));
    } catch (err) {
        console.error('S3 delete error:', err.message);
    }
}

/**
 * Supprime plusieurs fichiers S3 par leurs clés.
 * @param {string[]} keys - Liste de clés S3
 */
async function deleteFiles(keys) {
    for (const key of keys) {
        try {
            await s3.send(new DeleteObjectCommand({ Bucket: BUCKET, Key: key }));
        } catch (err) {
            console.error(`S3 delete error (${key}):`, err.message);
        }
    }
}

module.exports = { uploadFile, deleteFile, deleteFiles };
