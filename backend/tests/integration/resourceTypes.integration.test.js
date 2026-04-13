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

describe('GET /api/resource-types', () => {
    it('devrait retourner la liste (public)', async () => {
        await pool.query("INSERT INTO resource_types (name) VALUES ('Article'), ('Video')");

        const res = await request(app).get('/api/resource-types');

        expect(res.status).toBe(200);
        expect(res.body.resource_types).toHaveLength(2);
    });
});

describe('POST /api/resource-types', () => {
    it('devrait creer un type de ressource (admin)', async () => {
        const admin = await createAdminAndLogin(app, pool);

        const res = await request(app)
            .post('/api/resource-types')
            .set('Authorization', `Bearer ${admin.token}`)
            .send({ name: 'Podcast' });

        expect(res.status).toBe(201);
        expect(res.body.resource_type.name).toBe('Podcast');
    });

    it('devrait refuser pour un citoyen', async () => {
        const citizen = await createUserAndLogin(app);

        const res = await request(app)
            .post('/api/resource-types')
            .set('Authorization', `Bearer ${citizen.token}`)
            .send({ name: 'Tentative' });

        expect(res.status).toBe(403);
    });
});

describe('PUT /api/resource-types/:id', () => {
    it('devrait modifier un type de ressource (admin)', async () => {
        const admin = await createAdminAndLogin(app, pool);
        const rt = await pool.query("INSERT INTO resource_types (name) VALUES ('Ancien') RETURNING id");

        const res = await request(app)
            .put(`/api/resource-types/${rt.rows[0].id}`)
            .set('Authorization', `Bearer ${admin.token}`)
            .send({ name: 'Nouveau' });

        expect(res.status).toBe(200);
        expect(res.body.resource_type.name).toBe('Nouveau');
    });

    it('devrait retourner 404 pour un id inexistant', async () => {
        const admin = await createAdminAndLogin(app, pool);

        const res = await request(app)
            .put('/api/resource-types/99999')
            .set('Authorization', `Bearer ${admin.token}`)
            .send({ name: 'Nope' });

        expect(res.status).toBe(404);
    });
});

describe('DELETE /api/resource-types/:id', () => {
    it('devrait supprimer un type de ressource (admin)', async () => {
        const admin = await createAdminAndLogin(app, pool);
        const rt = await pool.query("INSERT INTO resource_types (name) VALUES ('Suppr') RETURNING id");

        const res = await request(app)
            .delete(`/api/resource-types/${rt.rows[0].id}`)
            .set('Authorization', `Bearer ${admin.token}`);

        expect(res.status).toBe(200);

        const check = await pool.query('SELECT * FROM resource_types WHERE id = $1', [rt.rows[0].id]);
        expect(check.rows).toHaveLength(0);
    });
});
