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

describe('POST /api/resources', () => {
    it('devrait creer une ressource publique en statut pending (citoyen)', async () => {
        const citizen = await createUserAndLogin(app);

        const res = await request(app)
            .post('/api/resources')
            .set('Authorization', `Bearer ${citizen.token}`)
            .send({ title: 'Ma ressource', content: 'Contenu test', visibility: 'public' });

        expect(res.status).toBe(201);
        expect(res.body.id).toBeDefined();

        // Verifier le statut pending en DB
        const dbRes = await pool.query('SELECT * FROM resources WHERE id = $1', [res.body.id]);
        expect(dbRes.rows[0].status).toBe('pending');
        expect(dbRes.rows[0].visibility).toBe('public');
        expect(dbRes.rows[0].author_id).toBe(citizen.user.id);
    });

    it('devrait creer une ressource privee en statut validated (citoyen)', async () => {
        const citizen = await createUserAndLogin(app);

        const res = await request(app)
            .post('/api/resources')
            .set('Authorization', `Bearer ${citizen.token}`)
            .send({ title: 'Privee', content: 'Secret', visibility: 'private' });

        expect(res.status).toBe(201);

        const dbRes = await pool.query('SELECT status FROM resources WHERE id = $1', [res.body.id]);
        expect(dbRes.rows[0].status).toBe('validated');
    });

    it('devrait creer une ressource publique en statut validated (admin)', async () => {
        const admin = await createAdminAndLogin(app, pool);

        const res = await request(app)
            .post('/api/resources')
            .set('Authorization', `Bearer ${admin.token}`)
            .send({ title: 'Admin resource', visibility: 'public' });

        expect(res.status).toBe(201);

        const dbRes = await pool.query('SELECT status FROM resources WHERE id = $1', [res.body.id]);
        expect(dbRes.rows[0].status).toBe('validated');
    });

    it('devrait refuser sans titre', async () => {
        const citizen = await createUserAndLogin(app);

        const res = await request(app)
            .post('/api/resources')
            .set('Authorization', `Bearer ${citizen.token}`)
            .send({ content: 'Sans titre' });

        expect(res.status).toBe(400);
    });

    it('devrait creer une ressource avec categorie et types', async () => {
        const citizen = await createUserAndLogin(app);
        const cat = await pool.query("INSERT INTO categories (name) VALUES ('Test Cat') RETURNING id");
        const rtype = await pool.query("INSERT INTO resource_types (name) VALUES ('Article') RETURNING id");
        const reltype = await pool.query("INSERT INTO relation_types (name) VALUES ('Soi') RETURNING id");

        const res = await request(app)
            .post('/api/resources')
            .set('Authorization', `Bearer ${citizen.token}`)
            .send({
                title: 'Avec refs',
                category_id: cat.rows[0].id,
                resource_type_id: rtype.rows[0].id,
                relation_type_id: reltype.rows[0].id,
                visibility: 'private',
            });

        expect(res.status).toBe(201);

        const dbRes = await pool.query('SELECT * FROM resources WHERE id = $1', [res.body.id]);
        expect(dbRes.rows[0].category_id).toBe(cat.rows[0].id);
        expect(dbRes.rows[0].resource_type_id).toBe(rtype.rows[0].id);
        expect(dbRes.rows[0].relation_type_id).toBe(reltype.rows[0].id);
    });

    it('devrait refuser sans authentification', async () => {
        const res = await request(app)
            .post('/api/resources')
            .send({ title: 'Anonyme' });

        expect(res.status).toBe(401);
    });
});

describe('GET /api/resources', () => {
    it('devrait lister les ressources publiques validees (non authentifie)', async () => {
        const admin = await createAdminAndLogin(app, pool);

        // Creer des ressources avec differents statuts et visibilites
        await request(app)
            .post('/api/resources')
            .set('Authorization', `Bearer ${admin.token}`)
            .send({ title: 'Publique validee', visibility: 'public' });

        await pool.query(
            `INSERT INTO resources (title, status, visibility, author_id)
             VALUES ('Privee', 'validated', 'private', $1)`,
            [admin.user.id]
        );

        await pool.query(
            `INSERT INTO resources (title, status, visibility, author_id)
             VALUES ('Pending', 'pending', 'public', $1)`,
            [admin.user.id]
        );

        const res = await request(app).get('/api/resources');

        expect(res.status).toBe(200);
        expect(res.body.resources).toHaveLength(1);
        expect(res.body.resources[0].title).toBe('Publique validee');
        expect(res.body.total).toBe(1);
    });

    it('devrait aussi inclure les ressources shared pour un utilisateur connecte', async () => {
        const admin = await createAdminAndLogin(app, pool);
        const citizen = await createUserAndLogin(app);

        await request(app)
            .post('/api/resources')
            .set('Authorization', `Bearer ${admin.token}`)
            .send({ title: 'Publique', visibility: 'public' });

        await pool.query(
            `INSERT INTO resources (title, status, visibility, author_id)
             VALUES ('Partagee', 'validated', 'shared', $1)`,
            [admin.user.id]
        );

        const res = await request(app)
            .get('/api/resources')
            .set('Authorization', `Bearer ${citizen.token}`);

        expect(res.status).toBe(200);
        expect(res.body.resources).toHaveLength(2);
    });

    it('devrait supporter la pagination', async () => {
        const admin = await createAdminAndLogin(app, pool);

        // Creer 5 ressources validees publiques
        for (let i = 1; i <= 5; i++) {
            await request(app)
                .post('/api/resources')
                .set('Authorization', `Bearer ${admin.token}`)
                .send({ title: `Ressource ${i}`, visibility: 'public' });
        }

        const res = await request(app)
            .get('/api/resources?page=1&limit=2');

        expect(res.status).toBe(200);
        expect(res.body.resources).toHaveLength(2);
        expect(res.body.total).toBe(5);
        expect(res.body.pages).toBe(3);
        expect(res.body.page).toBe(1);
    });

    it('devrait supporter la recherche par titre', async () => {
        const admin = await createAdminAndLogin(app, pool);

        await request(app)
            .post('/api/resources')
            .set('Authorization', `Bearer ${admin.token}`)
            .send({ title: 'JavaScript Guide', visibility: 'public' });

        await request(app)
            .post('/api/resources')
            .set('Authorization', `Bearer ${admin.token}`)
            .send({ title: 'Python Guide', visibility: 'public' });

        const res = await request(app)
            .get('/api/resources?search=JavaScript');

        expect(res.status).toBe(200);
        expect(res.body.resources).toHaveLength(1);
        expect(res.body.resources[0].title).toBe('JavaScript Guide');
    });

    it('devrait supporter le filtre par categorie', async () => {
        const admin = await createAdminAndLogin(app, pool);
        const cat = await pool.query("INSERT INTO categories (name) VALUES ('Web') RETURNING id");

        await request(app)
            .post('/api/resources')
            .set('Authorization', `Bearer ${admin.token}`)
            .send({ title: 'Avec cat', category_id: cat.rows[0].id, visibility: 'public' });

        await request(app)
            .post('/api/resources')
            .set('Authorization', `Bearer ${admin.token}`)
            .send({ title: 'Sans cat', visibility: 'public' });

        const res = await request(app)
            .get(`/api/resources?category_id=${cat.rows[0].id}`);

        expect(res.status).toBe(200);
        expect(res.body.resources).toHaveLength(1);
        expect(res.body.resources[0].title).toBe('Avec cat');
    });
});

describe('GET /api/resources/:id', () => {
    it('devrait retourner une ressource publique validee', async () => {
        const admin = await createAdminAndLogin(app, pool);

        const createRes = await request(app)
            .post('/api/resources')
            .set('Authorization', `Bearer ${admin.token}`)
            .send({ title: 'Detail', content: 'Contenu detaille', visibility: 'public' });

        const res = await request(app)
            .get(`/api/resources/${createRes.body.id}`);

        expect(res.status).toBe(200);
        expect(res.body.resource.title).toBe('Detail');
        expect(res.body.resource.content).toBe('Contenu detaille');
    });

    it('devrait incrementer les vues', async () => {
        const admin = await createAdminAndLogin(app, pool);

        const createRes = await request(app)
            .post('/api/resources')
            .set('Authorization', `Bearer ${admin.token}`)
            .send({ title: 'Views', visibility: 'public' });

        // Premier acces
        await request(app).get(`/api/resources/${createRes.body.id}`);
        // Deuxieme acces
        await request(app).get(`/api/resources/${createRes.body.id}`);

        const dbRes = await pool.query('SELECT views FROM resources WHERE id = $1', [createRes.body.id]);
        expect(dbRes.rows[0].views).toBe(2);
    });

    it('devrait refuser l\'acces a une ressource privee (non proprietaire)', async () => {
        const admin = await createAdminAndLogin(app, pool);
        const citizen = await createUserAndLogin(app);

        const createRes = await request(app)
            .post('/api/resources')
            .set('Authorization', `Bearer ${admin.token}`)
            .send({ title: 'Privee', visibility: 'private' });

        // L'admin a mis visibility=private, status=validated
        // Un citoyen ne devrait pas y acceder
        const res = await request(app)
            .get(`/api/resources/${createRes.body.id}`)
            .set('Authorization', `Bearer ${citizen.token}`);

        expect(res.status).toBe(403);
    });

    it('devrait retourner 404 pour un id inexistant', async () => {
        const res = await request(app).get('/api/resources/99999');
        expect(res.status).toBe(404);
    });
});

describe('GET /api/resources/mine', () => {
    it('devrait retourner uniquement les ressources de l\'utilisateur', async () => {
        const citizen1 = await createUserAndLogin(app, { first_name: 'Alice' });
        const citizen2 = await createUserAndLogin(app, { first_name: 'Bob' });

        await request(app)
            .post('/api/resources')
            .set('Authorization', `Bearer ${citizen1.token}`)
            .send({ title: 'Alice 1', visibility: 'private' });

        await request(app)
            .post('/api/resources')
            .set('Authorization', `Bearer ${citizen2.token}`)
            .send({ title: 'Bob 1', visibility: 'private' });

        const res = await request(app)
            .get('/api/resources/mine')
            .set('Authorization', `Bearer ${citizen1.token}`);

        expect(res.status).toBe(200);
        expect(res.body.resources).toHaveLength(1);
        expect(res.body.resources[0].title).toBe('Alice 1');
    });
});

describe('PUT /api/resources/:id', () => {
    it('devrait modifier sa propre ressource', async () => {
        const citizen = await createUserAndLogin(app);

        const createRes = await request(app)
            .post('/api/resources')
            .set('Authorization', `Bearer ${citizen.token}`)
            .send({ title: 'Original', visibility: 'private' });

        const res = await request(app)
            .put(`/api/resources/${createRes.body.id}`)
            .set('Authorization', `Bearer ${citizen.token}`)
            .send({ title: 'Modifie', content: 'Nouveau contenu' });

        expect(res.status).toBe(200);

        const dbRes = await pool.query('SELECT * FROM resources WHERE id = $1', [createRes.body.id]);
        expect(dbRes.rows[0].title).toBe('Modifie');
        expect(dbRes.rows[0].content).toBe('Nouveau contenu');
    });

    it('devrait refuser la modification par un autre citoyen', async () => {
        const citizen1 = await createUserAndLogin(app);
        const citizen2 = await createUserAndLogin(app);

        const createRes = await request(app)
            .post('/api/resources')
            .set('Authorization', `Bearer ${citizen1.token}`)
            .send({ title: 'A moi', visibility: 'private' });

        const res = await request(app)
            .put(`/api/resources/${createRes.body.id}`)
            .set('Authorization', `Bearer ${citizen2.token}`)
            .send({ title: 'Tente de modifier' });

        expect(res.status).toBe(403);
    });

    it('devrait permettre a un admin de modifier', async () => {
        const citizen = await createUserAndLogin(app);
        const admin = await createAdminAndLogin(app, pool);

        const createRes = await request(app)
            .post('/api/resources')
            .set('Authorization', `Bearer ${citizen.token}`)
            .send({ title: 'Citoyen', visibility: 'private' });

        const res = await request(app)
            .put(`/api/resources/${createRes.body.id}`)
            .set('Authorization', `Bearer ${admin.token}`)
            .send({ title: 'Modifie par admin' });

        expect(res.status).toBe(200);
    });
});

describe('DELETE /api/resources/:id', () => {
    it('devrait supprimer sa propre ressource', async () => {
        const citizen = await createUserAndLogin(app);

        const createRes = await request(app)
            .post('/api/resources')
            .set('Authorization', `Bearer ${citizen.token}`)
            .send({ title: 'A supprimer', visibility: 'private' });

        const res = await request(app)
            .delete(`/api/resources/${createRes.body.id}`)
            .set('Authorization', `Bearer ${citizen.token}`);

        expect(res.status).toBe(200);

        const check = await pool.query('SELECT * FROM resources WHERE id = $1', [createRes.body.id]);
        expect(check.rows).toHaveLength(0);
    });

    it('devrait refuser la suppression par un autre citoyen', async () => {
        const citizen1 = await createUserAndLogin(app);
        const citizen2 = await createUserAndLogin(app);

        const createRes = await request(app)
            .post('/api/resources')
            .set('Authorization', `Bearer ${citizen1.token}`)
            .send({ title: 'A moi', visibility: 'private' });

        const res = await request(app)
            .delete(`/api/resources/${createRes.body.id}`)
            .set('Authorization', `Bearer ${citizen2.token}`);

        expect(res.status).toBe(403);
    });
});

describe('Admin Resources /api/admin/resources', () => {
    it('devrait lister toutes les ressources (admin)', async () => {
        const admin = await createAdminAndLogin(app, pool);
        const citizen = await createUserAndLogin(app);

        // Creer des ressources avec differents statuts
        await request(app)
            .post('/api/resources')
            .set('Authorization', `Bearer ${citizen.token}`)
            .send({ title: 'Pending', visibility: 'public' }); // -> pending

        await request(app)
            .post('/api/resources')
            .set('Authorization', `Bearer ${admin.token}`)
            .send({ title: 'Validated', visibility: 'public' }); // -> validated

        const res = await request(app)
            .get('/api/admin/resources')
            .set('Authorization', `Bearer ${admin.token}`);

        expect(res.status).toBe(200);
        expect(res.body.resources).toHaveLength(2);
    });

    it('devrait filtrer par statut (admin)', async () => {
        const admin = await createAdminAndLogin(app, pool);
        const citizen = await createUserAndLogin(app);

        await request(app)
            .post('/api/resources')
            .set('Authorization', `Bearer ${citizen.token}`)
            .send({ title: 'Pending', visibility: 'public' });

        await request(app)
            .post('/api/resources')
            .set('Authorization', `Bearer ${admin.token}`)
            .send({ title: 'Validated', visibility: 'public' });

        const res = await request(app)
            .get('/api/admin/resources?status=pending')
            .set('Authorization', `Bearer ${admin.token}`);

        expect(res.status).toBe(200);
        expect(res.body.resources).toHaveLength(1);
        expect(res.body.resources[0].title).toBe('Pending');
    });

    it('devrait suspendre une ressource (admin)', async () => {
        const admin = await createAdminAndLogin(app, pool);

        const createRes = await request(app)
            .post('/api/admin/resources')
            .set('Authorization', `Bearer ${admin.token}`)
            .send({ title: 'A suspendre' });

        const res = await request(app)
            .put(`/api/admin/resources/${createRes.body.id}/suspend`)
            .set('Authorization', `Bearer ${admin.token}`);

        expect(res.status).toBe(200);

        const dbRes = await pool.query('SELECT status FROM resources WHERE id = $1', [createRes.body.id]);
        expect(dbRes.rows[0].status).toBe('suspended');
    });

    it('devrait supprimer une ressource (admin)', async () => {
        const admin = await createAdminAndLogin(app, pool);

        const createRes = await request(app)
            .post('/api/admin/resources')
            .set('Authorization', `Bearer ${admin.token}`)
            .send({ title: 'A supprimer admin' });

        const res = await request(app)
            .delete(`/api/admin/resources/${createRes.body.id}`)
            .set('Authorization', `Bearer ${admin.token}`);

        expect(res.status).toBe(200);

        const check = await pool.query('SELECT * FROM resources WHERE id = $1', [createRes.body.id]);
        expect(check.rows).toHaveLength(0);
    });

    it('devrait refuser l\'acces admin a un citoyen', async () => {
        const citizen = await createUserAndLogin(app);

        const res = await request(app)
            .get('/api/admin/resources')
            .set('Authorization', `Bearer ${citizen.token}`);

        expect(res.status).toBe(403);
    });
});
