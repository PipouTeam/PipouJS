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

describe('GET /api/moderation/pending', () => {
    it('retourne 501 (non implémenté)', async () => {
        const moderator = await createModeratorAndLogin(app, pool);

        const res = await request(app)
            .get('/api/moderation/pending')
            .set('Authorization', `Bearer ${moderator.token}`);

        expect(res.status).toBe(501);
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
    it('retourne 501 (non implémenté)', async () => {
        const moderator = await createModeratorAndLogin(app, pool);

        const res = await request(app)
            .put('/api/moderation/resources/1/validate')
            .set('Authorization', `Bearer ${moderator.token}`);

        expect(res.status).toBe(501);
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
    it('retourne 501 (non implémenté)', async () => {
        const moderator = await createModeratorAndLogin(app, pool);

        const res = await request(app)
            .put('/api/moderation/resources/1/reject')
            .set('Authorization', `Bearer ${moderator.token}`);

        expect(res.status).toBe(501);
    });

    it('refuse l\'accès à un citoyen', async () => {
        const citizen = await createUserAndLogin(app);

        const res = await request(app)
            .put('/api/moderation/resources/1/reject')
            .set('Authorization', `Bearer ${citizen.token}`);

        expect(res.status).toBe(403);
    });
});
