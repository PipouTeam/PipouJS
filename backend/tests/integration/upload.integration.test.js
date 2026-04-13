const request = require('supertest');
const { Pool } = require('pg');
const { S3Client, HeadObjectCommand, DeleteObjectCommand } = require('@aws-sdk/client-s3');
const path = require('path');
const { createTestDatabase, cleanTables, dropTestDatabase, TEST_DB } = require('./setup');
const { createUserAndLogin, createAdminAndLogin } = require('./helpers');

let app, pool, s3;

// Config S3 pour les tests (MinIO local)
const S3_ENDPOINT = process.env.S3_ENDPOINT || 'http://127.0.0.1:9000';
const S3_ACCESS_KEY = process.env.S3_ACCESS_KEY || 'minioadmin';
const S3_SECRET_KEY = process.env.S3_SECRET_KEY || 'minioadmin';
const S3_BUCKET = process.env.S3_BUCKET || 'pipou-resources';

beforeAll(async () => {
    await createTestDatabase();

    process.env.DB_DATABASE = TEST_DB;
    process.env.SECRET = 'test_secret';
    process.env.PORT = '0';
    process.env.DB_HOST = process.env.DB_HOST || '127.0.0.1';
    process.env.DB_PORT = process.env.DB_PORT || '5432';
    process.env.DB_USER = process.env.DB_USER || 'pipou';
    process.env.DB_PASSWORD = process.env.DB_PASSWORD || 'pipou_secret';
    process.env.S3_ENDPOINT = S3_ENDPOINT;
    process.env.S3_ACCESS_KEY = S3_ACCESS_KEY;
    process.env.S3_SECRET_KEY = S3_SECRET_KEY;
    process.env.S3_BUCKET = S3_BUCKET;

    const dbModule = require('../../src/models/database');
    pool = new Pool({
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        database: TEST_DB,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
    });
    dbModule.query = pool.query.bind(pool);
    dbModule.connect = pool.connect.bind(pool);

    s3 = new S3Client({
        endpoint: S3_ENDPOINT,
        region: 'us-east-1',
        credentials: { accessKeyId: S3_ACCESS_KEY, secretAccessKey: S3_SECRET_KEY },
        forcePathStyle: true,
    });

    app = require('../../src/app');
});

afterAll(async () => {
    await pool.end();
    await dropTestDatabase();
});

beforeEach(async () => {
    await cleanTables(pool);
});

// Helper : verifie qu'un objet existe dans S3
async function objectExists(key) {
    try {
        await s3.send(new HeadObjectCommand({ Bucket: S3_BUCKET, Key: key }));
        return true;
    } catch {
        return false;
    }
}

// Helper : extrait la key S3 depuis une URL path-style
function keyFromUrl(url) {
    const parts = new URL(url).pathname.slice(1).split('/');
    parts.shift(); // retire le bucket
    return parts.join('/');
}

// Helper : cree un petit buffer PNG valide (1x1 pixel)
function tinyPng() {
    return Buffer.from(
        'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAAC0lEQVQI12NgAAIABQAB' +
        'Nl7BcQAAAABJRU5ErkJggg==',
        'base64'
    );
}

// Helper : cree un petit buffer PDF valide
function tinyPdf() {
    return Buffer.from('%PDF-1.4\n1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj\n2 0 obj<</Type/Pages/Kids[]/Count 0>>endobj\nxref\n0 3\ntrailer<</Size 3/Root 1 0 R>>\nstartxref\n0\n%%EOF');
}

describe('POST /api/upload — Upload S3 (MinIO)', () => {
    it('devrait uploader une image et retourner une URL S3', async () => {
        const citizen = await createUserAndLogin(app);

        const res = await request(app)
            .post('/api/upload')
            .set('Authorization', `Bearer ${citizen.token}`)
            .attach('file', tinyPng(), 'photo.png');

        expect(res.status).toBe(200);
        expect(res.body.status).toBe(true);
        expect(res.body.url).toContain(S3_BUCKET);
        expect(res.body.url).toMatch(/\.png$/);

        // Verifier que le fichier existe dans MinIO
        const key = keyFromUrl(res.body.url);
        expect(await objectExists(key)).toBe(true);

        // Cleanup
        await s3.send(new DeleteObjectCommand({ Bucket: S3_BUCKET, Key: key }));
    });

    it('devrait uploader un PDF', async () => {
        const citizen = await createUserAndLogin(app);

        const res = await request(app)
            .post('/api/upload')
            .set('Authorization', `Bearer ${citizen.token}`)
            .attach('file', tinyPdf(), 'document.pdf');

        expect(res.status).toBe(200);
        expect(res.body.url).toMatch(/\.pdf$/);

        const key = keyFromUrl(res.body.url);
        expect(await objectExists(key)).toBe(true);

        await s3.send(new DeleteObjectCommand({ Bucket: S3_BUCKET, Key: key }));
    });

    it('devrait refuser un type de fichier non supporte', async () => {
        const citizen = await createUserAndLogin(app);

        const res = await request(app)
            .post('/api/upload')
            .set('Authorization', `Bearer ${citizen.token}`)
            .attach('file', Buffer.from('not an exe'), 'virus.exe');

        expect([400, 500]).toContain(res.status);
    });

    it('devrait refuser sans authentification', async () => {
        const res = await request(app)
            .post('/api/upload')
            .attach('file', tinyPng(), 'photo.png');

        expect(res.status).toBe(401);
    });
});

describe('E2E : Upload → Ressource → Consultation', () => {
    it('devrait uploader un fichier, creer une ressource avec media_url, et la consulter', async () => {
        const admin = await createAdminAndLogin(app, pool);

        // 1. Upload du fichier
        const uploadRes = await request(app)
            .post('/api/upload')
            .set('Authorization', `Bearer ${admin.token}`)
            .attach('file', tinyPng(), 'cover.png');

        expect(uploadRes.status).toBe(200);
        const mediaUrl = uploadRes.body.url;

        // 2. Creer la ressource avec media_url
        const createRes = await request(app)
            .post('/api/resources')
            .set('Authorization', `Bearer ${admin.token}`)
            .send({
                title: 'Ressource avec image',
                content: 'Contenu de test',
                media_url: mediaUrl,
                visibility: 'public',
            });

        expect(createRes.status).toBe(201);
        const resourceId = createRes.body.id;

        // 3. Verifier en base
        const dbRes = await pool.query('SELECT * FROM resources WHERE id = $1', [resourceId]);
        expect(dbRes.rows[0].media_url).toBe(mediaUrl);
        expect(dbRes.rows[0].title).toBe('Ressource avec image');

        // 4. Consulter via l'API publique
        const getRes = await request(app)
            .get(`/api/resources/${resourceId}`);

        expect(getRes.status).toBe(200);
        expect(getRes.body.resource.media_url).toBe(mediaUrl);
        expect(getRes.body.resource.title).toBe('Ressource avec image');

        // 5. Verifier que le fichier est accessible dans S3
        const key = keyFromUrl(mediaUrl);
        expect(await objectExists(key)).toBe(true);

        // Cleanup S3
        await s3.send(new DeleteObjectCommand({ Bucket: S3_BUCKET, Key: key }));
    });

    it('devrait mettre a jour le media_url d\'une ressource', async () => {
        const citizen = await createUserAndLogin(app);

        // Upload image 1
        const upload1 = await request(app)
            .post('/api/upload')
            .set('Authorization', `Bearer ${citizen.token}`)
            .attach('file', tinyPng(), 'v1.png');

        // Creer la ressource (private pour skip moderation)
        const createRes = await request(app)
            .post('/api/resources')
            .set('Authorization', `Bearer ${citizen.token}`)
            .send({ title: 'Evolue', media_url: upload1.body.url, visibility: 'private' });

        // Upload image 2
        const upload2 = await request(app)
            .post('/api/upload')
            .set('Authorization', `Bearer ${citizen.token}`)
            .attach('file', tinyPdf(), 'v2.pdf');

        // Mettre a jour media_url
        const updateRes = await request(app)
            .put(`/api/resources/${createRes.body.id}`)
            .set('Authorization', `Bearer ${citizen.token}`)
            .send({ media_url: upload2.body.url });

        expect(updateRes.status).toBe(200);

        const dbRes = await pool.query('SELECT media_url FROM resources WHERE id = $1', [createRes.body.id]);
        expect(dbRes.rows[0].media_url).toBe(upload2.body.url);

        // Cleanup
        await s3.send(new DeleteObjectCommand({ Bucket: S3_BUCKET, Key: keyFromUrl(upload1.body.url) }));
        await s3.send(new DeleteObjectCommand({ Bucket: S3_BUCKET, Key: keyFromUrl(upload2.body.url) }));
    });

    it('devrait lister les ressources avec media_url', async () => {
        const admin = await createAdminAndLogin(app, pool);

        const uploadRes = await request(app)
            .post('/api/upload')
            .set('Authorization', `Bearer ${admin.token}`)
            .attach('file', tinyPng(), 'list.png');

        await request(app)
            .post('/api/resources')
            .set('Authorization', `Bearer ${admin.token}`)
            .send({ title: 'Avec media', media_url: uploadRes.body.url, visibility: 'public' });

        await request(app)
            .post('/api/resources')
            .set('Authorization', `Bearer ${admin.token}`)
            .send({ title: 'Sans media', visibility: 'public' });

        const listRes = await request(app).get('/api/resources');

        expect(listRes.status).toBe(200);
        expect(listRes.body.resources).toHaveLength(2);

        const withMedia = listRes.body.resources.find(r => r.title === 'Avec media');
        const withoutMedia = listRes.body.resources.find(r => r.title === 'Sans media');

        expect(withMedia.media_url).toContain(S3_BUCKET);
        expect(withoutMedia.media_url).toBeNull();

        // Cleanup
        await s3.send(new DeleteObjectCommand({ Bucket: S3_BUCKET, Key: keyFromUrl(uploadRes.body.url) }));
    });
});
