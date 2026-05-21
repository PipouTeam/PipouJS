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

// Helper : creer une ressource publique validee
async function createValidatedResource(adminToken) {
    const res = await request(app)
        .post('/api/resources')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ title: 'Ressource test', content: 'Contenu', visibility: 'public' });
    return res.body.id;
}

describe('GET /api/resources/:resourceId/comments', () => {
    it('retourne les commentaires d\'une ressource publique', async () => {
        const admin = await createAdminAndLogin(app, pool);
        const resourceId = await createValidatedResource(admin.token);

        const res = await request(app)
            .get(`/api/resources/${resourceId}/comments`);

        expect(res.status).toBe(200);
        expect(res.body.comments).toEqual([]);
    });

    it('retourne 404 si ressource inexistante', async () => {
        const res = await request(app)
            .get('/api/resources/99999/comments');

        expect(res.status).toBe(404);
    });

    it('imbrique les réponses dans le parent', async () => {
        const admin = await createAdminAndLogin(app, pool);
        const citizen = await createUserAndLogin(app);
        const resourceId = await createValidatedResource(admin.token);

        // Poster un commentaire
        const commentRes = await request(app)
            .post(`/api/resources/${resourceId}/comments`)
            .set('Authorization', `Bearer ${citizen.token}`)
            .send({ content: 'Commentaire parent' });

        expect(commentRes.status).toBe(201);
        const parentId = commentRes.body.comment.id;

        // Poster une réponse
        await request(app)
            .post(`/api/resources/${resourceId}/comments/${parentId}/reply`)
            .set('Authorization', `Bearer ${citizen.token}`)
            .send({ content: 'Réponse au parent' });

        // Lister
        const res = await request(app)
            .get(`/api/resources/${resourceId}/comments`);

        expect(res.status).toBe(200);
        expect(res.body.comments).toHaveLength(1);
        expect(res.body.comments[0].content).toBe('Commentaire parent');
        expect(res.body.comments[0].replies).toHaveLength(1);
        expect(res.body.comments[0].replies[0].content).toBe('Réponse au parent');
    });
});

describe('POST /api/resources/:resourceId/comments', () => {
    it('crée un commentaire (authentifié)', async () => {
        const admin = await createAdminAndLogin(app, pool);
        const citizen = await createUserAndLogin(app);
        const resourceId = await createValidatedResource(admin.token);

        const res = await request(app)
            .post(`/api/resources/${resourceId}/comments`)
            .set('Authorization', `Bearer ${citizen.token}`)
            .send({ content: 'Super ressource !' });

        expect(res.status).toBe(201);
        expect(res.body.comment.content).toBe('Super ressource !');
    });

    it('refuse sans authentification', async () => {
        const admin = await createAdminAndLogin(app, pool);
        const resourceId = await createValidatedResource(admin.token);

        const res = await request(app)
            .post(`/api/resources/${resourceId}/comments`)
            .send({ content: 'Anonyme' });

        expect(res.status).toBe(401);
    });

    it('refuse un contenu vide', async () => {
        const admin = await createAdminAndLogin(app, pool);
        const citizen = await createUserAndLogin(app);
        const resourceId = await createValidatedResource(admin.token);

        const res = await request(app)
            .post(`/api/resources/${resourceId}/comments`)
            .set('Authorization', `Bearer ${citizen.token}`)
            .send({ content: '   ' });

        expect(res.status).toBe(400);
    });
});

describe('POST /api/resources/:resourceId/comments/:cid/reply', () => {
    it('crée une réponse', async () => {
        const admin = await createAdminAndLogin(app, pool);
        const citizen = await createUserAndLogin(app);
        const resourceId = await createValidatedResource(admin.token);

        const commentRes = await request(app)
            .post(`/api/resources/${resourceId}/comments`)
            .set('Authorization', `Bearer ${citizen.token}`)
            .send({ content: 'Parent' });

        const res = await request(app)
            .post(`/api/resources/${resourceId}/comments/${commentRes.body.comment.id}/reply`)
            .set('Authorization', `Bearer ${citizen.token}`)
            .send({ content: 'Réponse' });

        expect(res.status).toBe(201);
        expect(res.body.comment.parent_id).toBe(commentRes.body.comment.id);
    });

    it('refuse de répondre à une réponse', async () => {
        const admin = await createAdminAndLogin(app, pool);
        const citizen = await createUserAndLogin(app);
        const resourceId = await createValidatedResource(admin.token);

        // Commentaire parent
        const parentRes = await request(app)
            .post(`/api/resources/${resourceId}/comments`)
            .set('Authorization', `Bearer ${citizen.token}`)
            .send({ content: 'Parent' });

        // Réponse
        const replyRes = await request(app)
            .post(`/api/resources/${resourceId}/comments/${parentRes.body.comment.id}/reply`)
            .set('Authorization', `Bearer ${citizen.token}`)
            .send({ content: 'Réponse' });

        // Tenter de répondre à la réponse
        const res = await request(app)
            .post(`/api/resources/${resourceId}/comments/${replyRes.body.comment.id}/reply`)
            .set('Authorization', `Bearer ${citizen.token}`)
            .send({ content: 'Réponse à une réponse' });

        expect(res.status).toBe(400);
    });
});

describe('DELETE /api/resources/:resourceId/comments/:commentId', () => {
    it('supprime son propre commentaire', async () => {
        const admin = await createAdminAndLogin(app, pool);
        const citizen = await createUserAndLogin(app);
        const resourceId = await createValidatedResource(admin.token);

        const commentRes = await request(app)
            .post(`/api/resources/${resourceId}/comments`)
            .set('Authorization', `Bearer ${citizen.token}`)
            .send({ content: 'A supprimer' });

        const res = await request(app)
            .delete(`/api/resources/${resourceId}/comments/${commentRes.body.comment.id}`)
            .set('Authorization', `Bearer ${citizen.token}`);

        expect(res.status).toBe(200);

        const check = await pool.query('SELECT * FROM comments WHERE id = $1', [commentRes.body.comment.id]);
        expect(check.rows).toHaveLength(0);
    });

    it('refuse la suppression par un autre utilisateur', async () => {
        const admin = await createAdminAndLogin(app, pool);
        const citizen1 = await createUserAndLogin(app);
        const citizen2 = await createUserAndLogin(app);
        const resourceId = await createValidatedResource(admin.token);

        const commentRes = await request(app)
            .post(`/api/resources/${resourceId}/comments`)
            .set('Authorization', `Bearer ${citizen1.token}`)
            .send({ content: 'A moi' });

        const res = await request(app)
            .delete(`/api/resources/${resourceId}/comments/${commentRes.body.comment.id}`)
            .set('Authorization', `Bearer ${citizen2.token}`);

        expect(res.status).toBe(403);
    });

    it('permet la suppression par un modérateur', async () => {
        const admin = await createAdminAndLogin(app, pool);
        const citizen = await createUserAndLogin(app);
        const moderator = await createModeratorAndLogin(app, pool);
        const resourceId = await createValidatedResource(admin.token);

        const commentRes = await request(app)
            .post(`/api/resources/${resourceId}/comments`)
            .set('Authorization', `Bearer ${citizen.token}`)
            .send({ content: 'A modérer' });

        const res = await request(app)
            .delete(`/api/resources/${resourceId}/comments/${commentRes.body.comment.id}`)
            .set('Authorization', `Bearer ${moderator.token}`);

        expect(res.status).toBe(200);
    });

    it('supprime les réponses en cascade', async () => {
        const admin = await createAdminAndLogin(app, pool);
        const citizen = await createUserAndLogin(app);
        const resourceId = await createValidatedResource(admin.token);

        // Parent
        const parentRes = await request(app)
            .post(`/api/resources/${resourceId}/comments`)
            .set('Authorization', `Bearer ${citizen.token}`)
            .send({ content: 'Parent' });

        // Réponse
        const replyRes = await request(app)
            .post(`/api/resources/${resourceId}/comments/${parentRes.body.comment.id}/reply`)
            .set('Authorization', `Bearer ${citizen.token}`)
            .send({ content: 'Réponse' });

        // Supprimer le parent
        await request(app)
            .delete(`/api/resources/${resourceId}/comments/${parentRes.body.comment.id}`)
            .set('Authorization', `Bearer ${citizen.token}`);

        // Vérifier que parent et réponse sont supprimés
        const check = await pool.query('SELECT * FROM comments WHERE resource_id = $1', [resourceId]);
        expect(check.rows).toHaveLength(0);
    });
});
