const request = require('supertest');
const { Pool } = require('pg');
const { createTestDatabase, cleanTables, dropTestDatabase, TEST_DB } = require('./setup');

let app, pool;

beforeAll(async () => {
    await createTestDatabase();

    // Configurer les env vars pour pointer vers la DB de test
    process.env.DB_DATABASE = TEST_DB;
    process.env.SECRET = 'test_secret';
    process.env.PORT = '0';
    process.env.DB_HOST = process.env.DB_HOST || '127.0.0.1';
    process.env.DB_PORT = process.env.DB_PORT || '5432';
    process.env.DB_USER = process.env.DB_USER || 'pipou';
    process.env.DB_PASSWORD = process.env.DB_PASSWORD || 'pipou_secret';

    // Forcer le rechargement du pool avec la bonne DB
    const dbModule = require('../../src/models/database');
    pool = new Pool({
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        database: TEST_DB,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
    });
    // Remplacer le pool utilise par l'app
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

describe('POST /api/auth/register', () => {
    it('devrait creer un compte avec succes', async () => {
        const res = await request(app)
            .post('/api/auth/register')
            .send({
                email: 'test@example.com',
                password: 'Password123!',
                first_name: 'Jean',
                last_name: 'Dupont',
            });

        expect(res.status).toBe(201);
        expect(res.body.status).toBe(true);
        expect(res.body.id).toBeDefined();

        // Verifier que l'utilisateur est bien en base
        const dbUser = await pool.query('SELECT * FROM users WHERE email = $1', ['test@example.com']);
        expect(dbUser.rows).toHaveLength(1);
        expect(dbUser.rows[0].first_name).toBe('Jean');
        expect(dbUser.rows[0].role).toBe('citizen');
        expect(dbUser.rows[0].is_active).toBe(true);
        // Le mot de passe doit etre hashe
        expect(dbUser.rows[0].password).not.toBe('Password123!');
    });

    it('devrait refuser si des champs sont manquants', async () => {
        const res = await request(app)
            .post('/api/auth/register')
            .send({ email: 'test@example.com' });

        expect(res.status).toBe(400);
        expect(res.body.status).toBe(false);
    });

    it('devrait refuser un email deja utilise', async () => {
        await request(app)
            .post('/api/auth/register')
            .send({
                email: 'dupe@example.com',
                password: 'Password123!',
                first_name: 'A',
                last_name: 'B',
            });

        const res = await request(app)
            .post('/api/auth/register')
            .send({
                email: 'dupe@example.com',
                password: 'Other123!',
                first_name: 'C',
                last_name: 'D',
            });

        expect(res.status).toBe(400);
        expect(res.body.message).toMatch(/Email/i);
    });
});

describe('POST /api/auth/login', () => {
    beforeEach(async () => {
        await request(app)
            .post('/api/auth/register')
            .send({
                email: 'login@example.com',
                password: 'Password123!',
                first_name: 'Jean',
                last_name: 'Dupont',
            });
    });

    it('devrait connecter un utilisateur valide et retourner un token', async () => {
        const res = await request(app)
            .post('/api/auth/login')
            .send({ email: 'login@example.com', password: 'Password123!' });

        expect(res.status).toBe(200);
        expect(res.body.status).toBe(true);
        expect(res.body.token).toBeDefined();
        expect(res.body.user.email).toBe('login@example.com');
        expect(res.body.user.first_name).toBe('Jean');
        expect(res.body.user.role).toBe('citizen');
        // Le mot de passe ne doit pas etre retourne
        expect(res.body.user.password).toBeUndefined();
    });

    it('devrait refuser avec un mauvais mot de passe', async () => {
        const res = await request(app)
            .post('/api/auth/login')
            .send({ email: 'login@example.com', password: 'WrongPassword!' });

        expect(res.status).toBe(401);
    });

    it('devrait refuser un email inconnu', async () => {
        const res = await request(app)
            .post('/api/auth/login')
            .send({ email: 'unknown@example.com', password: 'Password123!' });

        expect(res.status).toBe(401);
    });

    it('devrait refuser un compte desactive', async () => {
        await pool.query("UPDATE users SET is_active = FALSE WHERE email = 'login@example.com'");

        const res = await request(app)
            .post('/api/auth/login')
            .send({ email: 'login@example.com', password: 'Password123!' });

        expect(res.status).toBe(403);
    });

    it('devrait refuser si champs manquants', async () => {
        const res = await request(app)
            .post('/api/auth/login')
            .send({ email: 'login@example.com' });

        expect(res.status).toBe(400);
    });
});

describe('GET /api/auth/me', () => {
    it('devrait retourner le profil de l\'utilisateur connecte', async () => {
        // Register + login
        await request(app)
            .post('/api/auth/register')
            .send({
                email: 'me@example.com',
                password: 'Password123!',
                first_name: 'Me',
                last_name: 'Test',
            });

        const loginRes = await request(app)
            .post('/api/auth/login')
            .send({ email: 'me@example.com', password: 'Password123!' });

        const res = await request(app)
            .get('/api/auth/me')
            .set('Authorization', `Bearer ${loginRes.body.token}`);

        expect(res.status).toBe(200);
        expect(res.body.user.email).toBe('me@example.com');
        expect(res.body.user.first_name).toBe('Me');
        expect(res.body.user.password).toBeUndefined();
    });

    it('devrait refuser sans token', async () => {
        const res = await request(app).get('/api/auth/me');
        expect(res.status).toBe(401);
    });
});

describe('PUT /api/auth/me', () => {
    it('devrait mettre a jour le profil', async () => {
        await request(app)
            .post('/api/auth/register')
            .send({
                email: 'update@example.com',
                password: 'Password123!',
                first_name: 'Old',
                last_name: 'Name',
            });

        const loginRes = await request(app)
            .post('/api/auth/login')
            .send({ email: 'update@example.com', password: 'Password123!' });

        const token = loginRes.body.token;

        const res = await request(app)
            .put('/api/auth/me')
            .set('Authorization', `Bearer ${token}`)
            .send({ first_name: 'New', last_name: 'Updated' });

        expect(res.status).toBe(200);
        expect(res.body.status).toBe(true);

        // Verifier en DB
        const dbUser = await pool.query("SELECT * FROM users WHERE email = 'update@example.com'");
        expect(dbUser.rows[0].first_name).toBe('New');
        expect(dbUser.rows[0].last_name).toBe('Updated');
    });
});
