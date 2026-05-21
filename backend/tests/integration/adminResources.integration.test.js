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

describe('POST /api/admin/resources', () => {
    it('crée une ressource avec status validated par défaut (admin)', async () => {
        const admin = await createAdminAndLogin(app, pool);

        const res = await request(app)
            .post('/api/admin/resources')
            .set('Authorization', `Bearer ${admin.token}`)
            .send({ title: 'Admin resource' });

        expect(res.status).toBe(201);
        expect(res.body.id).toBeDefined();

        const dbRes = await pool.query('SELECT status FROM resources WHERE id = $1', [res.body.id]);
        expect(dbRes.rows[0].status).toBe('validated');
    });

    it('crée une ressource avec un status custom', async () => {
        const admin = await createAdminAndLogin(app, pool);

        const res = await request(app)
            .post('/api/admin/resources')
            .set('Authorization', `Bearer ${admin.token}`)
            .send({ title: 'Draft resource', status: 'draft' });

        expect(res.status).toBe(201);

        const dbRes = await pool.query('SELECT status FROM resources WHERE id = $1', [res.body.id]);
        expect(dbRes.rows[0].status).toBe('draft');
    });

    it('refuse sans titre', async () => {
        const admin = await createAdminAndLogin(app, pool);

        const res = await request(app)
            .post('/api/admin/resources')
            .set('Authorization', `Bearer ${admin.token}`)
            .send({ content: 'Sans titre' });

        expect(res.status).toBe(400);
    });

    it('refuse l\'accès à un citoyen', async () => {
        const citizen = await createUserAndLogin(app);

        const res = await request(app)
            .post('/api/admin/resources')
            .set('Authorization', `Bearer ${citizen.token}`)
            .send({ title: 'Citoyen tente' });

        expect(res.status).toBe(403);
    });
});

describe('PUT /api/admin/resources/:id', () => {
    it('met à jour une ressource (admin)', async () => {
        const admin = await createAdminAndLogin(app, pool);

        const createRes = await request(app)
            .post('/api/admin/resources')
            .set('Authorization', `Bearer ${admin.token}`)
            .send({ title: 'Original' });

        const res = await request(app)
            .put(`/api/admin/resources/${createRes.body.id}`)
            .set('Authorization', `Bearer ${admin.token}`)
            .send({ title: 'Modifié par admin', status: 'suspended' });

        expect(res.status).toBe(200);

        const dbRes = await pool.query('SELECT * FROM resources WHERE id = $1', [createRes.body.id]);
        expect(dbRes.rows[0].title).toBe('Modifié par admin');
        expect(dbRes.rows[0].status).toBe('suspended');
    });

    it('retourne 404 pour un id inexistant', async () => {
        const admin = await createAdminAndLogin(app, pool);

        const res = await request(app)
            .put('/api/admin/resources/99999')
            .set('Authorization', `Bearer ${admin.token}`)
            .send({ title: 'Nouveau' });

        expect(res.status).toBe(404);
    });

    it('refuse l\'accès à un citoyen', async () => {
        const citizen = await createUserAndLogin(app);

        const res = await request(app)
            .put('/api/admin/resources/1')
            .set('Authorization', `Bearer ${citizen.token}`)
            .send({ title: 'Tente' });

        expect(res.status).toBe(403);
    });
});
