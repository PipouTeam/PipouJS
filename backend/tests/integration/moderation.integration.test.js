const request = require('supertest');
const { Pool } = require('pg');
const { createTestDatabase, cleanTables, dropTestDatabase, TEST_DB } = require('./setup');
const { createUserAndLogin, createAdminAndLogin, createModeratorAndLogin } = require('./helpers');

let app, pool;

beforeAll(async () => {
    await createTestDatabase();

    process.env.DB_DATABASE = TEST_DB;
    process.env.SECRET = 'test_secret';
    process.env.PORT = '0';
    process.env.DB_HOST = process.env.DB_HOST || '127.0.0.1';
    process.env.DB_PORT = process.env.DB_PORT || '5432';
    process.env.DB_USER = process.env.DB_USER || 'pipou';
    process.env.DB_PASSWORD = process.env.DB_PASSWORD || 'pipou_secret';

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

    app = require('../../src/app');
});

afterAll(async () => {
    await pool.end();
    await dropTestDatabase();
});

beforeEach(async () => {
    await cleanTables(pool);
});

// Helper : creer une ressource pending (citoyen publie en public -> pending)
async function createPendingResource(citizenToken) {
    const res = await request(app)
        .post('/api/resources')
        .set('Authorization', `Bearer ${citizenToken}`)
        .send({ title: 'Ressource en attente', content: 'Contenu', visibility: 'public' });
    return res.body.id;
}

describe('GET /api/moderation/pending', () => {
    it('retourne les ressources en attente', async () => {
        const moderator = await createModeratorAndLogin(app, pool);
        const citizen = await createUserAndLogin(app);

        await createPendingResource(citizen.token);
        await createPendingResource(citizen.token);

        const res = await request(app)
            .get('/api/moderation/pending')
            .set('Authorization', `Bearer ${moderator.token}`);

        expect(res.status).toBe(200);
        expect(res.body.status).toBe(true);
        expect(res.body.resources).toHaveLength(2);
        expect(res.body.total).toBe(2);
    });

    it('ne retourne pas les ressources validées', async () => {
        const moderator = await createModeratorAndLogin(app, pool);
        const admin = await createAdminAndLogin(app, pool);
        const citizen = await createUserAndLogin(app);

        // Ressource pending (citoyen)
        await createPendingResource(citizen.token);

        // Ressource validée (admin)
        await request(app)
            .post('/api/resources')
            .set('Authorization', `Bearer ${admin.token}`)
            .send({ title: 'Validée', visibility: 'public' });

        const res = await request(app)
            .get('/api/moderation/pending')
            .set('Authorization', `Bearer ${moderator.token}`);

        expect(res.body.resources).toHaveLength(1);
        expect(res.body.resources[0].title).toBe('Ressource en attente');
    });

    it('refuse l\'accès à un citoyen', async () => {
        const citizen = await createUserAndLogin(app);

        const res = await request(app)
            .get('/api/moderation/pending')
            .set('Authorization', `Bearer ${citizen.token}`);

        expect(res.status).toBe(403);
    });

    it('refuse sans authentification', async () => {
        const res = await request(app).get('/api/moderation/pending');
        expect(res.status).toBe(401);
    });
});

describe('PUT /api/moderation/resources/:id/validate', () => {
    it('valide une ressource pending', async () => {
        const moderator = await createModeratorAndLogin(app, pool);
        const citizen = await createUserAndLogin(app);
        const resourceId = await createPendingResource(citizen.token);

        const res = await request(app)
            .put(`/api/moderation/resources/${resourceId}/validate`)
            .set('Authorization', `Bearer ${moderator.token}`);

        expect(res.status).toBe(200);
        expect(res.body.message).toBe('Ressource validée');

        // Vérifier en DB
        const dbRes = await pool.query('SELECT status FROM resources WHERE id = $1', [resourceId]);
        expect(dbRes.rows[0].status).toBe('validated');
    });

    it('404 si ressource inexistante', async () => {
        const moderator = await createModeratorAndLogin(app, pool);

        const res = await request(app)
            .put('/api/moderation/resources/99999/validate')
            .set('Authorization', `Bearer ${moderator.token}`);

        expect(res.status).toBe(404);
    });

    it('refuse l\'accès à un citoyen', async () => {
        const citizen = await createUserAndLogin(app);

        const res = await request(app)
            .put('/api/moderation/resources/1/validate')
            .set('Authorization', `Bearer ${citizen.token}`);

        expect(res.status).toBe(403);
    });
});

describe('PUT /api/moderation/resources/:id/reject', () => {
    it('rejette une ressource pending', async () => {
        const moderator = await createModeratorAndLogin(app, pool);
        const citizen = await createUserAndLogin(app);
        const resourceId = await createPendingResource(citizen.token);

        const res = await request(app)
            .put(`/api/moderation/resources/${resourceId}/reject`)
            .set('Authorization', `Bearer ${moderator.token}`);

        expect(res.status).toBe(200);
        expect(res.body.message).toBe('Ressource rejetée');

        // Vérifier en DB
        const dbRes = await pool.query('SELECT status FROM resources WHERE id = $1', [resourceId]);
        expect(dbRes.rows[0].status).toBe('rejected');
    });

    it('404 si ressource inexistante', async () => {
        const moderator = await createModeratorAndLogin(app, pool);

        const res = await request(app)
            .put('/api/moderation/resources/99999/reject')
            .set('Authorization', `Bearer ${moderator.token}`);

        expect(res.status).toBe(404);
    });

    it('refuse l\'accès à un citoyen', async () => {
        const citizen = await createUserAndLogin(app);

        const res = await request(app)
            .put('/api/moderation/resources/1/reject')
            .set('Authorization', `Bearer ${citizen.token}`);

        expect(res.status).toBe(403);
    });
});

describe('Parcours complet de modération', () => {
    it('citoyen soumet → modérateur liste → valide', async () => {
        const moderator = await createModeratorAndLogin(app, pool);
        const citizen = await createUserAndLogin(app);
        const resourceId = await createPendingResource(citizen.token);

        // La ressource apparaît dans pending
        let pending = await request(app)
            .get('/api/moderation/pending')
            .set('Authorization', `Bearer ${moderator.token}`);
        expect(pending.body.resources).toHaveLength(1);

        // Valider
        await request(app)
            .put(`/api/moderation/resources/${resourceId}/validate`)
            .set('Authorization', `Bearer ${moderator.token}`);

        // La ressource n'apparaît plus dans pending
        pending = await request(app)
            .get('/api/moderation/pending')
            .set('Authorization', `Bearer ${moderator.token}`);
        expect(pending.body.resources).toHaveLength(0);

        // La ressource est visible publiquement
        const publicRes = await request(app).get(`/api/resources/${resourceId}`);
        expect(publicRes.status).toBe(200);
        expect(publicRes.body.resource.status).toBe('validated');
    });
});
