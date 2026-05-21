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

describe('GET /api/stats', () => {
    it('retourne des compteurs à zéro sur base vide', async () => {
        const res = await request(app).get('/api/stats');

        expect(res.status).toBe(200);
        expect(res.body.status).toBe(true);
        expect(res.body.resources).toBe(0);
        expect(res.body.categories).toBe(0);
        expect(res.body.contributors).toBe(0);
    });

    it('compte les ressources publiques validées', async () => {
        const admin = await createAdminAndLogin(app, pool);

        // Ressource publique validée (admin -> validated par défaut)
        await request(app)
            .post('/api/resources')
            .set('Authorization', `Bearer ${admin.token}`)
            .send({ title: 'Publique', visibility: 'public' });

        // Ressource privée validée (ne doit pas être comptée)
        await request(app)
            .post('/api/resources')
            .set('Authorization', `Bearer ${admin.token}`)
            .send({ title: 'Privée', visibility: 'private' });

        // Ressource publique pending (citoyen)
        const citizen = await createUserAndLogin(app);
        await request(app)
            .post('/api/resources')
            .set('Authorization', `Bearer ${citizen.token}`)
            .send({ title: 'Pending', visibility: 'public' });

        const res = await request(app).get('/api/stats');

        expect(res.body.resources).toBe(1);
    });

    it('compte les catégories', async () => {
        await pool.query("INSERT INTO categories (name) VALUES ('Santé'), ('Famille')");

        const res = await request(app).get('/api/stats');

        expect(res.body.categories).toBe(2);
    });

    it('compte les contributeurs uniques', async () => {
        const admin = await createAdminAndLogin(app, pool);
        const citizen = await createUserAndLogin(app);

        // Admin crée 2 ressources validées
        await request(app)
            .post('/api/resources')
            .set('Authorization', `Bearer ${admin.token}`)
            .send({ title: 'Admin 1', visibility: 'public' });

        await request(app)
            .post('/api/resources')
            .set('Authorization', `Bearer ${admin.token}`)
            .send({ title: 'Admin 2', visibility: 'public' });

        // Citoyen crée 1 ressource (pending, mais le COUNT est sur status=validated)
        // Pour être compté, il faut une ressource validée
        await pool.query(
            `INSERT INTO resources (title, status, visibility, author_id)
             VALUES ('Citizen validated', 'validated', 'public', $1)`,
            [citizen.user.id]
        );

        const res = await request(app).get('/api/stats');

        expect(res.body.contributors).toBe(2);
    });
});
