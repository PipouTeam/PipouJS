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

describe('GET /api/categories', () => {
    it('devrait retourner la liste des categories (public)', async () => {
        await pool.query("INSERT INTO categories (name) VALUES ('Cat A'), ('Cat B')");

        const res = await request(app).get('/api/categories');

        expect(res.status).toBe(200);
        expect(res.body.categories).toHaveLength(2);
        // Tri alphabetique
        expect(res.body.categories[0].name).toBe('Cat A');
        expect(res.body.categories[1].name).toBe('Cat B');
    });

    it('devrait retourner un tableau vide si aucune categorie', async () => {
        const res = await request(app).get('/api/categories');

        expect(res.status).toBe(200);
        expect(res.body.categories).toHaveLength(0);
    });
});

describe('POST /api/categories', () => {
    it('devrait creer une categorie (admin)', async () => {
        const admin = await createAdminAndLogin(app, pool);

        const res = await request(app)
            .post('/api/categories')
            .set('Authorization', `Bearer ${admin.token}`)
            .send({ name: 'Nouvelle Categorie' });

        expect(res.status).toBe(201);
        expect(res.body.category.name).toBe('Nouvelle Categorie');
        expect(res.body.category.id).toBeDefined();

        // Verifier en DB
        const dbCat = await pool.query('SELECT * FROM categories');
        expect(dbCat.rows).toHaveLength(1);
    });

    it('devrait refuser sans le champ name', async () => {
        const admin = await createAdminAndLogin(app, pool);

        const res = await request(app)
            .post('/api/categories')
            .set('Authorization', `Bearer ${admin.token}`)
            .send({});

        expect(res.status).toBe(400);
    });

    it('devrait refuser pour un citoyen', async () => {
        const citizen = await createUserAndLogin(app);

        const res = await request(app)
            .post('/api/categories')
            .set('Authorization', `Bearer ${citizen.token}`)
            .send({ name: 'Tentative' });

        expect(res.status).toBe(403);
    });
});

describe('PUT /api/categories/:id', () => {
    it('devrait modifier une categorie (admin)', async () => {
        const admin = await createAdminAndLogin(app, pool);
        const cat = await pool.query("INSERT INTO categories (name) VALUES ('Ancien') RETURNING id");

        const res = await request(app)
            .put(`/api/categories/${cat.rows[0].id}`)
            .set('Authorization', `Bearer ${admin.token}`)
            .send({ name: 'Nouveau' });

        expect(res.status).toBe(200);
        expect(res.body.category.name).toBe('Nouveau');
    });

    it('devrait retourner 404 pour un id inexistant', async () => {
        const admin = await createAdminAndLogin(app, pool);

        const res = await request(app)
            .put('/api/categories/99999')
            .set('Authorization', `Bearer ${admin.token}`)
            .send({ name: 'Test' });

        expect(res.status).toBe(404);
    });
});

describe('DELETE /api/categories/:id', () => {
    it('devrait supprimer une categorie (admin)', async () => {
        const admin = await createAdminAndLogin(app, pool);
        const cat = await pool.query("INSERT INTO categories (name) VALUES ('A supprimer') RETURNING id");

        const res = await request(app)
            .delete(`/api/categories/${cat.rows[0].id}`)
            .set('Authorization', `Bearer ${admin.token}`);

        expect(res.status).toBe(200);

        // Verifier la suppression en DB
        const check = await pool.query('SELECT * FROM categories WHERE id = $1', [cat.rows[0].id]);
        expect(check.rows).toHaveLength(0);
    });

    it('devrait retourner 404 pour un id inexistant', async () => {
        const admin = await createAdminAndLogin(app, pool);

        const res = await request(app)
            .delete('/api/categories/99999')
            .set('Authorization', `Bearer ${admin.token}`);

        expect(res.status).toBe(404);
    });
});
