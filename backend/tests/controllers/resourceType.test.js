jest.mock('../../src/models/database', () => ({ query: jest.fn() }));

const db = require('../../src/models/database');
const resourceTypeController = require('../../src/controllers/resourceTypeController');

const mockRes = () => {
    const res = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    return res;
};

beforeEach(() => jest.clearAllMocks());

describe('list', () => {
    it('retourne la liste des types de ressource', async () => {
        const types = [{ id: 1, name: 'Article' }, { id: 2, name: 'Vidéo' }];
        db.query.mockResolvedValueOnce({ rows: types });
        const req = {};
        const res = mockRes();
        await resourceTypeController.list(req, res);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ resource_types: types }));
    });
});

describe('create', () => {
    it('400 si champ name manquant', async () => {
        const req = { body: {} };
        const res = mockRes();
        await resourceTypeController.create(req, res);
        expect(res.status).toHaveBeenCalledWith(400);
    });

    it('201 si type de ressource créé', async () => {
        const type = { id: 1, name: 'Article' };
        db.query.mockResolvedValueOnce({ rows: [type] });
        const req = { body: { name: 'Article' } };
        const res = mockRes();
        await resourceTypeController.create(req, res);
        expect(res.status).toHaveBeenCalledWith(201);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ resource_type: type }));
    });
});

describe('update', () => {
    it('400 si champ name manquant', async () => {
        const req = { params: { id: '1' }, body: {} };
        const res = mockRes();
        await resourceTypeController.update(req, res);
        expect(res.status).toHaveBeenCalledWith(400);
    });

    it('404 si type de ressource inexistant', async () => {
        db.query.mockResolvedValueOnce({ rows: [] });
        const req = { params: { id: '99' }, body: { name: 'Nouveau' } };
        const res = mockRes();
        await resourceTypeController.update(req, res);
        expect(res.status).toHaveBeenCalledWith(404);
    });

    it('retourne le type de ressource mis à jour', async () => {
        const updated = { id: 1, name: 'Nouveau' };
        db.query.mockResolvedValueOnce({ rows: [updated] });
        const req = { params: { id: '1' }, body: { name: 'Nouveau' } };
        const res = mockRes();
        await resourceTypeController.update(req, res);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ resource_type: updated }));
    });
});

describe('remove', () => {
    it('supprime le type de ressource et retourne 200', async () => {
        db.query.mockResolvedValueOnce({ rows: [{ id: 1 }] });
        const req = { params: { id: '1' } };
        const res = mockRes();
        await resourceTypeController.remove(req, res);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ status: true }));
    });

    it('404 si type de ressource inexistant', async () => {
        db.query.mockResolvedValueOnce({ rows: [] });
        const req = { params: { id: '99' } };
        const res = mockRes();
        await resourceTypeController.remove(req, res);
        expect(res.status).toHaveBeenCalledWith(404);
    });
});
