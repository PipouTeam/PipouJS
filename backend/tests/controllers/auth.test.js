process.env.SECRET = 'test_secret';

jest.mock('../../src/models/database', () => ({ query: jest.fn() }));

const db = require('../../src/models/database');
const authController = require('../../src/controllers/authController');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const mockRes = () => {
    const res = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    return res;
};

beforeEach(() => jest.clearAllMocks());

describe('register', () => {
    it('400 si champs manquants', async () => {
        const req = { body: { email: 'a@b.com' } };
        const res = mockRes();
        await authController.register(req, res);
        expect(res.status).toHaveBeenCalledWith(400);
    });

    it('400 si email déjà pris', async () => {
        db.query.mockResolvedValueOnce({ rows: [{ id: 1 }] });
        const req = { body: { email: 'a@b.com', password: '123', first_name: 'A', last_name: 'B' } };
        const res = mockRes();
        await authController.register(req, res);
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: 'Email déjà utilisé' }));
    });

    it('201 si inscription réussie', async () => {
        db.query
            .mockResolvedValueOnce({ rows: [] })
            .mockResolvedValueOnce({ rows: [{ id: 42 }] });
        const req = { body: { email: 'a@b.com', password: 'secret', first_name: 'Alice', last_name: 'B' } };
        const res = mockRes();
        await authController.register(req, res);
        expect(res.status).toHaveBeenCalledWith(201);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ id: 42 }));
    });
});

describe('login', () => {
    it('400 si champs manquants', async () => {
        const req = { body: { email: 'a@b.com' } };
        const res = mockRes();
        await authController.login(req, res);
        expect(res.status).toHaveBeenCalledWith(400);
    });

    it('401 si email inconnu', async () => {
        db.query.mockResolvedValueOnce({ rows: [] });
        const req = { body: { email: 'inconnu@b.com', password: '123' } };
        const res = mockRes();
        await authController.login(req, res);
        expect(res.status).toHaveBeenCalledWith(401);
    });

    it('403 si compte désactivé', async () => {
        db.query.mockResolvedValueOnce({ rows: [{ id: 1, is_active: false, password: 'hash' }] });
        const req = { body: { email: 'a@b.com', password: '123' } };
        const res = mockRes();
        await authController.login(req, res);
        expect(res.status).toHaveBeenCalledWith(403);
    });

    it('401 si mot de passe incorrect', async () => {
        const hash = await bcrypt.hash('correct', 10);
        db.query.mockResolvedValueOnce({ rows: [{ id: 1, is_active: true, password: hash, role: 'citizen' }] });
        const req = { body: { email: 'a@b.com', password: 'mauvais' } };
        const res = mockRes();
        await authController.login(req, res);
        expect(res.status).toHaveBeenCalledWith(401);
    });

    it('200 et retourne un token si succès', async () => {
        const hash = await bcrypt.hash('secret', 10);
        db.query.mockResolvedValueOnce({ rows: [{ id: 1, email: 'a@b.com', is_active: true, password: hash, role: 'citizen', first_name: 'A', last_name: 'B' }] });
        const req = { body: { email: 'a@b.com', password: 'secret' } };
        const res = mockRes();
        await authController.login(req, res);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ token: expect.any(String) }));
        const call = res.json.mock.calls[0][0];
        const decoded = jwt.verify(call.token, 'test_secret');
        expect(decoded.id).toBe(1);
    });
});

describe('me', () => {
    it('retourne le profil de l\'utilisateur connecté', async () => {
        db.query.mockResolvedValueOnce({ rows: [{ id: 1, email: 'a@b.com', first_name: 'A', last_name: 'B', role: 'citizen' }] });
        const req = { user: { id: 1 } };
        const res = mockRes();
        await authController.me(req, res);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ status: true }));
    });

    it('404 si utilisateur introuvable', async () => {
        db.query.mockResolvedValueOnce({ rows: [] });
        const req = { user: { id: 999 } };
        const res = mockRes();
        await authController.me(req, res);
        expect(res.status).toHaveBeenCalledWith(404);
    });
});
