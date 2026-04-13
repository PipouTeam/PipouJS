process.env.SECRET = 'test_secret';

const jwt = require('jsonwebtoken');
const { requireAuth, optionalAuth } = require('../../src/middleware/auth');

const mockRes = () => {
    const res = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    return res;
};

describe('requireAuth', () => {
    it('retourne 401 si pas de header Authorization', () => {
        const req = { headers: {} };
        const res = mockRes();
        const next = jest.fn();
        requireAuth(req, res, next);
        expect(res.status).toHaveBeenCalledWith(401);
        expect(next).not.toHaveBeenCalled();
    });

    it('retourne 401 si header mal formé (pas Bearer)', () => {
        const req = { headers: { authorization: 'Basic abc' } };
        const res = mockRes();
        const next = jest.fn();
        requireAuth(req, res, next);
        expect(res.status).toHaveBeenCalledWith(401);
        expect(next).not.toHaveBeenCalled();
    });

    it('retourne 401 si token invalide', () => {
        const req = { headers: { authorization: 'Bearer tokenbidon' } };
        const res = mockRes();
        const next = jest.fn();
        requireAuth(req, res, next);
        expect(res.status).toHaveBeenCalledWith(401);
        expect(next).not.toHaveBeenCalled();
    });

    it('appelle next() et définit req.user si token valide', () => {
        const payload = { id: 1, email: 'a@b.com', role: 'citizen' };
        const token = jwt.sign(payload, 'test_secret');
        const req = { headers: { authorization: `Bearer ${token}` } };
        const res = mockRes();
        const next = jest.fn();
        requireAuth(req, res, next);
        expect(next).toHaveBeenCalled();
        expect(req.user).toMatchObject(payload);
    });
});

describe('optionalAuth', () => {
    it('appelle next() même sans token', () => {
        const req = { headers: {} };
        const res = mockRes();
        const next = jest.fn();
        optionalAuth(req, res, next);
        expect(next).toHaveBeenCalled();
        expect(req.user).toBeUndefined();
    });

    it('définit req.user si token valide', () => {
        const payload = { id: 2, role: 'admin' };
        const token = jwt.sign(payload, 'test_secret');
        const req = { headers: { authorization: `Bearer ${token}` } };
        const res = mockRes();
        const next = jest.fn();
        optionalAuth(req, res, next);
        expect(next).toHaveBeenCalled();
        expect(req.user).toMatchObject(payload);
    });

    it('appelle next() sans planter si token invalide', () => {
        const req = { headers: { authorization: 'Bearer tokenbidon' } };
        const res = mockRes();
        const next = jest.fn();
        optionalAuth(req, res, next);
        expect(next).toHaveBeenCalled();
        expect(req.user).toBeUndefined();
    });
});
