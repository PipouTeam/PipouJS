const request = require('supertest');
const { Pool } = require('pg');
const { createTestDatabase, cleanTables, dropTestDatabase, TEST_DB } = require('./setup');
const { createUserAndLogin, createAdminAndLogin, createSuperAdminAndLogin } = require('./helpers');

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

describe('GET /api/users', () => {
    it('devrait lister tous les utilisateurs (admin)', async () => {
        // Creer quelques utilisateurs
        await createUserAndLogin(app, { first_name: 'Alice' });
        await createUserAndLogin(app, { first_name: 'Bob' });
        const admin = await createAdminAndLogin(app, pool);

        const res = await request(app)
            .get('/api/users')
            .set('Authorization', `Bearer ${admin.token}`);

        expect(res.status).toBe(200);
        expect(res.body.users.length).toBeGreaterThanOrEqual(3);
        // Verifier qu'il n'y a pas de mot de passe retourne
        res.body.users.forEach(u => {
            expect(u.password).toBeUndefined();
        });
    });

    it('devrait refuser l\'acces a un citoyen', async () => {
        const citizen = await createUserAndLogin(app);

        const res = await request(app)
            .get('/api/users')
            .set('Authorization', `Bearer ${citizen.token}`);

        expect(res.status).toBe(403);
    });

    it('devrait refuser sans authentification', async () => {
        const res = await request(app).get('/api/users');
        expect(res.status).toBe(401);
    });
});

describe('PUT /api/users/:id/deactivate', () => {
    it('devrait desactiver un utilisateur (admin)', async () => {
        const citizen = await createUserAndLogin(app);
        const admin = await createAdminAndLogin(app, pool);

        const res = await request(app)
            .put(`/api/users/${citizen.user.id}/deactivate`)
            .set('Authorization', `Bearer ${admin.token}`);

        expect(res.status).toBe(200);
        expect(res.body.message).toMatch(/désactivé/i);

        // Verifier en DB
        const dbUser = await pool.query('SELECT is_active FROM users WHERE id = $1', [citizen.user.id]);
        expect(dbUser.rows[0].is_active).toBe(false);
    });

    it('devrait empecher le login apres desactivation', async () => {
        const citizen = await createUserAndLogin(app);
        const admin = await createAdminAndLogin(app, pool);

        await request(app)
            .put(`/api/users/${citizen.user.id}/deactivate`)
            .set('Authorization', `Bearer ${admin.token}`)
            .expect(200);

        const loginRes = await request(app)
            .post('/api/auth/login')
            .send({ email: citizen.credentials.email, password: citizen.credentials.password });

        expect(loginRes.status).toBe(403);
    });
});

describe('PUT /api/users/:id/activate', () => {
    it('devrait reactiver un utilisateur desactive', async () => {
        const citizen = await createUserAndLogin(app);
        const admin = await createAdminAndLogin(app, pool);

        // Desactiver
        await request(app)
            .put(`/api/users/${citizen.user.id}/deactivate`)
            .set('Authorization', `Bearer ${admin.token}`)
            .expect(200);

        // Reactiver
        const res = await request(app)
            .put(`/api/users/${citizen.user.id}/activate`)
            .set('Authorization', `Bearer ${admin.token}`);

        expect(res.status).toBe(200);

        // Verifier que le login fonctionne a nouveau
        const loginRes = await request(app)
            .post('/api/auth/login')
            .send({ email: citizen.credentials.email, password: citizen.credentials.password });

        expect(loginRes.status).toBe(200);
    });
});

describe('POST /api/users/staff', () => {
    it('devrait creer un moderateur (super_admin)', async () => {
        const superAdmin = await createSuperAdminAndLogin(app, pool);

        const res = await request(app)
            .post('/api/users/staff')
            .set('Authorization', `Bearer ${superAdmin.token}`)
            .send({
                email: 'mod@example.com',
                password: 'ModPass123!',
                first_name: 'Mod',
                last_name: 'Erateur',
                role: 'moderator',
            });

        expect(res.status).toBe(201);
        expect(res.body.id).toBeDefined();

        // Verifier le role en DB
        const dbUser = await pool.query('SELECT role FROM users WHERE email = $1', ['mod@example.com']);
        expect(dbUser.rows[0].role).toBe('moderator');
    });

    it('devrait refuser un role invalide', async () => {
        const superAdmin = await createSuperAdminAndLogin(app, pool);

        const res = await request(app)
            .post('/api/users/staff')
            .set('Authorization', `Bearer ${superAdmin.token}`)
            .send({
                email: 'bad@example.com',
                password: 'Pass123!',
                first_name: 'Bad',
                last_name: 'Role',
                role: 'super_admin',
            });

        expect(res.status).toBe(400);
    });

    it('devrait refuser si l\'admin n\'est pas super_admin', async () => {
        const admin = await createAdminAndLogin(app, pool);

        const res = await request(app)
            .post('/api/users/staff')
            .set('Authorization', `Bearer ${admin.token}`)
            .send({
                email: 'mod2@example.com',
                password: 'ModPass123!',
                first_name: 'Mod',
                last_name: 'Erateur',
                role: 'moderator',
            });

        expect(res.status).toBe(403);
    });
});
