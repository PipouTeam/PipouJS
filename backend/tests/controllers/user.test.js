jest.mock('../../src/models/database', () => ({ query: jest.fn() }));

const db = require('../../src/models/database');
const userController = require('../../src/controllers/userController');

const mockRes = () => {
    const res = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    return res;
};

beforeEach(() => jest.clearAllMocks());

describe('list', () => {
    it('retourne la liste des utilisateurs', async () => {
        const users = [{ id: 1, email: 'a@b.com', role: 'citizen' }];
        db.query.mockResolvedValueOnce({ rows: users });
        const req = {};
        const res = mockRes();
        await userController.list(req, res);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ users }));
    });
});

describe('deactivate', () => {
    it('désactive le compte et retourne un message', async () => {
        db.query.mockResolvedValueOnce({ rows: [] });
        const req = { params: { id: '5' } };
        const res = mockRes();
        await userController.deactivate(req, res);
        expect(db.query).toHaveBeenCalledWith(expect.stringContaining('is_active = FALSE'), ['5']);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ status: true }));
    });
});

describe('activate', () => {
    it('réactive le compte et retourne un message', async () => {
        db.query.mockResolvedValueOnce({ rows: [] });
        const req = { params: { id: '5' } };
        const res = mockRes();
        await userController.activate(req, res);
        expect(db.query).toHaveBeenCalledWith(expect.stringContaining('is_active = TRUE'), ['5']);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ status: true }));
    });
});

describe('createStaff', () => {
    it('400 si rôle invalide', async () => {
        const req = { body: { email: 'a@b.com', password: '123', first_name: 'A', last_name: 'B', role: 'citizen' } };
        const res = mockRes();
        await userController.createStaff(req, res);
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: expect.stringContaining('Rôle invalide') }));
    });

    it('201 si données valides', async () => {
        db.query
            .mockResolvedValueOnce({ rows: [] })
            .mockResolvedValueOnce({ rows: [{ id: 10 }] });
        const req = { body: { email: 'mod@b.com', password: 'secret', first_name: 'Mod', last_name: 'M', role: 'moderator' } };
        const res = mockRes();
        await userController.createStaff(req, res);
        expect(res.status).toHaveBeenCalledWith(201);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ id: 10 }));
    });
});
