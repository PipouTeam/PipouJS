jest.mock('../../src/models/database', () => ({ query: jest.fn() }));

const db = require('../../src/models/database');
const resourceController = require('../../src/controllers/resourceController');

const mockRes = () => {
    const res = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    return res;
};

// Simule COUNT + SELECT pour list/adminList
const mockListQueries = (rows = []) => {
    db.query
        .mockResolvedValueOnce({ rows: [{ count: String(rows.length) }] })
        .mockResolvedValueOnce({ rows });
};

beforeEach(() => jest.clearAllMocks());

describe('list (public)', () => {
    it('filtre public + validated si non connecté', async () => {
        mockListQueries();
        const req = { query: {}, user: undefined };
        const res = mockRes();
        await resourceController.list(req, res);
        const sqlCall = db.query.mock.calls[0][0];
        expect(sqlCall).toContain("r.visibility = 'public'");
        expect(sqlCall).toContain("r.status = 'validated'");
    });

    it('filtre uniquement public même si connecté (shared = lien direct)', async () => {
        mockListQueries();
        const req = { query: {}, user: { id: 1, role: 'citizen' } };
        const res = mockRes();
        await resourceController.list(req, res);
        const sqlCall = db.query.mock.calls[0][0];
        expect(sqlCall).toContain("r.visibility = 'public'");
        expect(sqlCall).not.toContain("r.visibility = 'shared'");
    });

    it('retourne une réponse paginée', async () => {
        const resources = [{ id: 1, title: 'Test' }];
        mockListQueries(resources);
        const req = { query: { page: '1', limit: '10' }, user: undefined };
        const res = mockRes();
        await resourceController.list(req, res);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ total: 1, page: 1, resources }));
    });
});

describe('getOne', () => {
    it('404 si ressource inexistante', async () => {
        db.query.mockResolvedValueOnce({ rows: [] });
        const req = { params: { id: '99' }, user: undefined };
        const res = mockRes();
        await resourceController.getOne(req, res);
        expect(res.status).toHaveBeenCalledWith(404);
    });

    it('403 si ressource privée et non connecté', async () => {
        db.query.mockResolvedValueOnce({ rows: [{ id: 1, visibility: 'private', status: 'validated', author_id: 5 }] });
        const req = { params: { id: '1' }, user: undefined };
        const res = mockRes();
        await resourceController.getOne(req, res);
        expect(res.status).toHaveBeenCalledWith(403);
    });

    it('incrémente les vues pour une ressource publique validée', async () => {
        db.query
            .mockResolvedValueOnce({ rows: [{ id: 1, visibility: 'public', status: 'validated', author_id: 5 }] })
            .mockResolvedValueOnce({ rows: [] });
        const req = { params: { id: '1' }, user: undefined };
        const res = mockRes();
        await resourceController.getOne(req, res);
        expect(db.query).toHaveBeenCalledWith(expect.stringContaining('views = views + 1'), ['1']);
    });
});

describe('create (citoyen)', () => {
    it('400 si title manquant', async () => {
        const req = { body: {}, user: { id: 1, role: 'citizen' } };
        const res = mockRes();
        await resourceController.create(req, res);
        expect(res.status).toHaveBeenCalledWith(400);
    });

    it('status=pending si citoyen et visibility=public', async () => {
        db.query.mockResolvedValueOnce({ rows: [{ id: 10 }] });
        const req = { body: { title: 'Test', visibility: 'public' }, user: { id: 1, role: 'citizen' } };
        const res = mockRes();
        await resourceController.create(req, res);
        const insertCall = db.query.mock.calls[0];
        expect(insertCall[1]).toContain('pending');
    });

    it('status=validated si citoyen et visibility=private', async () => {
        db.query.mockResolvedValueOnce({ rows: [{ id: 11 }] });
        const req = { body: { title: 'Test', visibility: 'private' }, user: { id: 1, role: 'citizen' } };
        const res = mockRes();
        await resourceController.create(req, res);
        const insertCall = db.query.mock.calls[0];
        expect(insertCall[1]).toContain('validated');
    });
});

describe('adminList', () => {
    it('retourne toutes les ressources', async () => {
        mockListQueries([{ id: 1 }, { id: 2 }]);
        const req = { query: {} };
        const res = mockRes();
        await resourceController.adminList(req, res);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ total: 2 }));
    });
});

describe('suspend', () => {
    it('passe le status à suspended', async () => {
        db.query.mockResolvedValueOnce({ rows: [{ id: 1 }] });
        const req = { params: { id: '1' } };
        const res = mockRes();
        await resourceController.suspend(req, res);
        expect(db.query).toHaveBeenCalledWith(expect.stringContaining("status = 'suspended'"), ['1']);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ status: true }));
    });

    it('404 si ressource inexistante', async () => {
        db.query.mockResolvedValueOnce({ rows: [] });
        const req = { params: { id: '999' } };
        const res = mockRes();
        await resourceController.suspend(req, res);
        expect(res.status).toHaveBeenCalledWith(404);
    });
});
