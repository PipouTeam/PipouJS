jest.mock('../../src/models/database', () => ({ query: jest.fn() }));

const db = require('../../src/models/database');
const categoryController = require('../../src/controllers/categoryController');

const mockRes = () => {
    const res = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    return res;
};

beforeEach(() => jest.clearAllMocks());

describe('list', () => {
    it('retourne la liste des catégories', async () => {
        const categories = [{ id: 1, name: 'Santé' }, { id: 2, name: 'Famille' }];
        db.query.mockResolvedValueOnce({ rows: categories });
        const req = {};
        const res = mockRes();
        await categoryController.list(req, res);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ categories }));
    });
});

describe('create', () => {
    it('400 si champ name manquant', async () => {
        const req = { body: {} };
        const res = mockRes();
        await categoryController.create(req, res);
        expect(res.status).toHaveBeenCalledWith(400);
    });

    it('201 si catégorie créée', async () => {
        const cat = { id: 1, name: 'Santé' };
        db.query.mockResolvedValueOnce({ rows: [cat] });
        const req = { body: { name: 'Santé' } };
        const res = mockRes();
        await categoryController.create(req, res);
        expect(res.status).toHaveBeenCalledWith(201);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ category: cat }));
    });
});

describe('update', () => {
    it('404 si catégorie inexistante', async () => {
        db.query.mockResolvedValueOnce({ rows: [] });
        const req = { params: { id: '99' }, body: { name: 'Nouveau' } };
        const res = mockRes();
        await categoryController.update(req, res);
        expect(res.status).toHaveBeenCalledWith(404);
    });

    it('retourne la catégorie mise à jour', async () => {
        const updated = { id: 1, name: 'Nouveau' };
        db.query.mockResolvedValueOnce({ rows: [updated] });
        const req = { params: { id: '1' }, body: { name: 'Nouveau' } };
        const res = mockRes();
        await categoryController.update(req, res);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ category: updated }));
    });
});

describe('remove', () => {
    it('supprime la catégorie et retourne 200', async () => {
        db.query.mockResolvedValueOnce({ rows: [{ id: 1 }] });
        const req = { params: { id: '1' } };
        const res = mockRes();
        await categoryController.remove(req, res);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ status: true }));
    });

    it('404 si catégorie inexistante', async () => {
        db.query.mockResolvedValueOnce({ rows: [] });
        const req = { params: { id: '99' } };
        const res = mockRes();
        await categoryController.remove(req, res);
        expect(res.status).toHaveBeenCalledWith(404);
    });
});
