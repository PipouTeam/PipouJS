const request = require('supertest');
const { Pool } = require('pg');
const { createTestDatabase, cleanTables, dropTestDatabase, TEST_DB } = require('./setup');
const { createUserAndLogin, createAdminAndLogin } = require('./helpers');

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

// Helper : creer une ressource validee
async function createResource(adminToken) {
    const res = await request(app)
        .post('/api/resources')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ title: 'Ressource test', visibility: 'public' });
    return res.body.id;
}

describe('GET /api/progress/dashboard', () => {
    it('retourne un dashboard vide par défaut', async () => {
        const citizen = await createUserAndLogin(app);

        const res = await request(app)
            .get('/api/progress/dashboard')
            .set('Authorization', `Bearer ${citizen.token}`);

        expect(res.status).toBe(200);
        expect(res.body.favorites).toEqual([]);
        expect(res.body.exploited).toEqual([]);
        expect(res.body.saved).toEqual([]);
    });

    it('refuse sans authentification', async () => {
        const res = await request(app).get('/api/progress/dashboard');
        expect(res.status).toBe(401);
    });

    it('retourne les favoris après ajout', async () => {
        const admin = await createAdminAndLogin(app, pool);
        const citizen = await createUserAndLogin(app);
        const resourceId = await createResource(admin.token);

        await request(app)
            .post(`/api/progress/favorites/${resourceId}`)
            .set('Authorization', `Bearer ${citizen.token}`);

        const res = await request(app)
            .get('/api/progress/dashboard')
            .set('Authorization', `Bearer ${citizen.token}`);

        expect(res.status).toBe(200);
        expect(res.body.favorites).toHaveLength(1);
        expect(res.body.favorites[0].id).toBe(resourceId);
    });
});

describe('POST /api/progress/favorites/:resourceId', () => {
    it('ajoute une ressource aux favoris', async () => {
        const admin = await createAdminAndLogin(app, pool);
        const citizen = await createUserAndLogin(app);
        const resourceId = await createResource(admin.token);

        const res = await request(app)
            .post(`/api/progress/favorites/${resourceId}`)
            .set('Authorization', `Bearer ${citizen.token}`);

        expect(res.status).toBe(200);
        expect(res.body.status).toBe(true);
    });

    it('est idempotent (double ajout)', async () => {
        const admin = await createAdminAndLogin(app, pool);
        const citizen = await createUserAndLogin(app);
        const resourceId = await createResource(admin.token);

        await request(app)
            .post(`/api/progress/favorites/${resourceId}`)
            .set('Authorization', `Bearer ${citizen.token}`);

        await request(app)
            .post(`/api/progress/favorites/${resourceId}`)
            .set('Authorization', `Bearer ${citizen.token}`);

        const dashboard = await request(app)
            .get('/api/progress/dashboard')
            .set('Authorization', `Bearer ${citizen.token}`);

        expect(dashboard.body.favorites).toHaveLength(1);
    });
});

describe('DELETE /api/progress/favorites/:resourceId', () => {
    it('retire une ressource des favoris', async () => {
        const admin = await createAdminAndLogin(app, pool);
        const citizen = await createUserAndLogin(app);
        const resourceId = await createResource(admin.token);

        await request(app)
            .post(`/api/progress/favorites/${resourceId}`)
            .set('Authorization', `Bearer ${citizen.token}`);

        await request(app)
            .delete(`/api/progress/favorites/${resourceId}`)
            .set('Authorization', `Bearer ${citizen.token}`);

        const dashboard = await request(app)
            .get('/api/progress/dashboard')
            .set('Authorization', `Bearer ${citizen.token}`);

        expect(dashboard.body.favorites).toHaveLength(0);
    });
});

describe('PUT /api/progress/exploited/:resourceId', () => {
    it('marque une ressource comme exploitée', async () => {
        const admin = await createAdminAndLogin(app, pool);
        const citizen = await createUserAndLogin(app);
        const resourceId = await createResource(admin.token);

        const res = await request(app)
            .put(`/api/progress/exploited/${resourceId}`)
            .set('Authorization', `Bearer ${citizen.token}`);

        expect(res.status).toBe(200);

        const dashboard = await request(app)
            .get('/api/progress/dashboard')
            .set('Authorization', `Bearer ${citizen.token}`);

        expect(dashboard.body.exploited).toHaveLength(1);
    });
});

describe('POST & DELETE /api/progress/saved/:resourceId', () => {
    it('ajoute puis retire une ressource mise de côté', async () => {
        const admin = await createAdminAndLogin(app, pool);
        const citizen = await createUserAndLogin(app);
        const resourceId = await createResource(admin.token);

        // Ajouter
        await request(app)
            .post(`/api/progress/saved/${resourceId}`)
            .set('Authorization', `Bearer ${citizen.token}`);

        let dashboard = await request(app)
            .get('/api/progress/dashboard')
            .set('Authorization', `Bearer ${citizen.token}`);

        expect(dashboard.body.saved).toHaveLength(1);

        // Retirer
        await request(app)
            .delete(`/api/progress/saved/${resourceId}`)
            .set('Authorization', `Bearer ${citizen.token}`);

        dashboard = await request(app)
            .get('/api/progress/dashboard')
            .set('Authorization', `Bearer ${citizen.token}`);

        expect(dashboard.body.saved).toHaveLength(0);
    });
});
