jest.mock('../../src/models/database', () => ({ query: jest.fn() }));

const db = require('../../src/models/database');
const progressController = require('../../src/controllers/progressController');

const mockRes = () => {
    const res = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    return res;
};

beforeEach(() => jest.clearAllMocks());

describe('dashboard', () => {
    it('retourne les favoris, exploités et mis de côté', async () => {
        const rows = [
            { id: 1, title: 'R1', is_favorite: true, is_exploited: false, is_saved: false },
            { id: 2, title: 'R2', is_favorite: false, is_exploited: true, is_saved: true },
        ];
        db.query.mockResolvedValueOnce({ rows });
        const req = { user: { id: 1 } };
        const res = mockRes();
        await progressController.dashboard(req, res);
        const call = res.json.mock.calls[0][0];
        expect(call.status).toBe(true);
        expect(call.favorites).toHaveLength(1);
        expect(call.exploited).toHaveLength(1);
        expect(call.saved).toHaveLength(1);
    });

    it('retourne des tableaux vides si aucune interaction', async () => {
        db.query.mockResolvedValueOnce({ rows: [] });
        const req = { user: { id: 1 } };
        const res = mockRes();
        await progressController.dashboard(req, res);
        const call = res.json.mock.calls[0][0];
        expect(call.favorites).toHaveLength(0);
        expect(call.exploited).toHaveLength(0);
        expect(call.saved).toHaveLength(0);
    });

    it('utilise req.user.id dans la requête', async () => {
        db.query.mockResolvedValueOnce({ rows: [] });
        const req = { user: { id: 42 } };
        const res = mockRes();
        await progressController.dashboard(req, res);
        expect(db.query).toHaveBeenCalledWith(expect.any(String), [42]);
    });
});

describe('addFavorite', () => {
    it('exécute un INSERT ON CONFLICT et retourne status:true', async () => {
        db.query.mockResolvedValueOnce({});
        const req = { user: { id: 1 }, params: { resourceId: '42' } };
        const res = mockRes();
        await progressController.addFavorite(req, res);
        expect(db.query).toHaveBeenCalledWith(expect.stringContaining('is_favorite = TRUE'), [1, '42']);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ status: true }));
    });
});

describe('removeFavorite', () => {
    it('met is_favorite à FALSE', async () => {
        db.query.mockResolvedValueOnce({});
        const req = { user: { id: 1 }, params: { resourceId: '42' } };
        const res = mockRes();
        await progressController.removeFavorite(req, res);
        expect(db.query).toHaveBeenCalledWith(expect.stringContaining('is_favorite = FALSE'), [1, '42']);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ status: true }));
    });
});

describe('markExploited', () => {
    it('met is_exploited à TRUE', async () => {
        db.query.mockResolvedValueOnce({});
        const req = { user: { id: 1 }, params: { resourceId: '42' } };
        const res = mockRes();
        await progressController.markExploited(req, res);
        expect(db.query).toHaveBeenCalledWith(expect.stringContaining('is_exploited = TRUE'), [1, '42']);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ status: true }));
    });
});

describe('addSaved', () => {
    it('met is_saved à TRUE', async () => {
        db.query.mockResolvedValueOnce({});
        const req = { user: { id: 1 }, params: { resourceId: '42' } };
        const res = mockRes();
        await progressController.addSaved(req, res);
        expect(db.query).toHaveBeenCalledWith(expect.stringContaining('is_saved = TRUE'), [1, '42']);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ status: true }));
    });
});

describe('removeSaved', () => {
    it('met is_saved à FALSE', async () => {
        db.query.mockResolvedValueOnce({});
        const req = { user: { id: 1 }, params: { resourceId: '42' } };
        const res = mockRes();
        await progressController.removeSaved(req, res);
        expect(db.query).toHaveBeenCalledWith(expect.stringContaining('is_saved = FALSE'), [1, '42']);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ status: true }));
    });
});
