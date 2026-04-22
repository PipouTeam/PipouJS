const request = require('supertest');

// Cree un utilisateur et retourne son token JWT
async function createUserAndLogin(app, overrides = {}) {
    const userData = {
        email: `user_${Date.now()}_${Math.random().toString(36).slice(2)}@test.com`,
        password: 'TestPassword123!',
        first_name: 'Test',
        last_name: 'User',
        ...overrides,
    };

    await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(201);

    const loginRes = await request(app)
        .post('/api/auth/login')
        .send({ email: userData.email, password: userData.password })
        .expect(200);

    return {
        token: loginRes.body.token,
        user: loginRes.body.user,
        credentials: userData,
    };
}

// Cree un admin en inserant directement dans la DB puis login
async function createAdminAndLogin(app, pool) {
    const bcrypt = require('bcryptjs');
    const email = `admin_${Date.now()}_${Math.random().toString(36).slice(2)}@test.com`;
    const password = 'AdminPass123!';
    const hash = await bcrypt.hash(password, 10);

    const result = await pool.query(
        `INSERT INTO users (email, password, first_name, last_name, role)
         VALUES ($1, $2, 'Admin', 'User', 'admin') RETURNING id`,
        [email, hash]
    );

    const loginRes = await request(app)
        .post('/api/auth/login')
        .send({ email, password })
        .expect(200);

    return {
        token: loginRes.body.token,
        user: loginRes.body.user,
        credentials: { email, password },
    };
}

// Cree un super_admin directement en DB
async function createSuperAdminAndLogin(app, pool) {
    const bcrypt = require('bcryptjs');
    const email = `superadmin_${Date.now()}_${Math.random().toString(36).slice(2)}@test.com`;
    const password = 'SuperPass123!';
    const hash = await bcrypt.hash(password, 10);

    await pool.query(
        `INSERT INTO users (email, password, first_name, last_name, role)
         VALUES ($1, $2, 'Super', 'Admin', 'super_admin')`,
        [email, hash]
    );

    const loginRes = await request(app)
        .post('/api/auth/login')
        .send({ email, password })
        .expect(200);

    return {
        token: loginRes.body.token,
        user: loginRes.body.user,
    };
}

// Cree un moderateur directement en DB
async function createModeratorAndLogin(app, pool) {
    const bcrypt = require('bcryptjs');
    const email = `moderator_${Date.now()}_${Math.random().toString(36).slice(2)}@test.com`;
    const password = 'ModeratorPass123!';
    const hash = await bcrypt.hash(password, 10);

    await pool.query(
        `INSERT INTO users (email, password, first_name, last_name, role)
         VALUES ($1, $2, 'Moderator', 'User', 'moderator')`,
        [email, hash]
    );

    const loginRes = await request(app)
        .post('/api/auth/login')
        .send({ email, password })
        .expect(200);

    return {
        token: loginRes.body.token,
        user: loginRes.body.user,
        credentials: { email, password },
    };
}

module.exports = { createUserAndLogin, createAdminAndLogin, createSuperAdminAndLogin, createModeratorAndLogin };
