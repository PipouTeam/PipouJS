const { requireRole } = require('../../src/middleware/roles');

const mockRes = () => {
    const res = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    return res;
};

describe('requireRole', () => {
    it('retourne 401 si req.user absent', () => {
        const req = {};
        const res = mockRes();
        const next = jest.fn();
        requireRole('admin')(req, res, next);
        expect(res.status).toHaveBeenCalledWith(401);
        expect(next).not.toHaveBeenCalled();
    });

    it('retourne 403 si rôle insuffisant (citizen < admin)', () => {
        const req = { user: { role: 'citizen' } };
        const res = mockRes();
        const next = jest.fn();
        requireRole('admin')(req, res, next);
        expect(res.status).toHaveBeenCalledWith(403);
        expect(next).not.toHaveBeenCalled();
    });

    it('appelle next() si rôle exact requis', () => {
        const req = { user: { role: 'admin' } };
        const res = mockRes();
        const next = jest.fn();
        requireRole('admin')(req, res, next);
        expect(next).toHaveBeenCalled();
    });

    it('appelle next() si rôle supérieur au minimum requis', () => {
        const req = { user: { role: 'super_admin' } };
        const res = mockRes();
        const next = jest.fn();
        requireRole('moderator')(req, res, next);
        expect(next).toHaveBeenCalled();
    });
});
