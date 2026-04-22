jest.mock('../../src/models/database', () => ({ query: jest.fn() }));

const db = require('../../src/models/database');
const commentController = require('../../src/controllers/commentController');

const mockRes = () => {
    const res = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    return res;
};

beforeEach(() => jest.clearAllMocks());

describe('list', () => {
    it('404 si ressource inexistante', async () => {
        db.query.mockResolvedValueOnce({ rows: [] });
        const req = { params: { id: '99' }, user: undefined };
        const res = mockRes();
        await commentController.list(req, res);
        expect(res.status).toHaveBeenCalledWith(404);
    });

    it('403 si ressource privée et non connecté', async () => {
        db.query.mockResolvedValueOnce({ rows: [{ id: 1, visibility: 'private', status: 'validated' }] });
        const req = { params: { id: '1' }, user: undefined };
        const res = mockRes();
        await commentController.list(req, res);
        expect(res.status).toHaveBeenCalledWith(403);
    });

    it('autorise un admin même si ressource non publique', async () => {
        db.query
            .mockResolvedValueOnce({ rows: [{ id: 1, visibility: 'private', status: 'validated' }] })
            .mockResolvedValueOnce({ rows: [] });
        const req = { params: { id: '1' }, user: { id: 1, role: 'admin' } };
        const res = mockRes();
        await commentController.list(req, res);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ status: true, comments: [] }));
    });

    it('retourne les commentaires avec réponses imbriquées', async () => {
        db.query
            .mockResolvedValueOnce({ rows: [{ id: 1, visibility: 'public', status: 'validated' }] })
            .mockResolvedValueOnce({
                rows: [
                    { id: 10, content: 'Parent', parent_id: null, is_hidden: false, user_id: 1, user_first_name: 'Jean', user_last_name: 'Dupont' },
                    { id: 11, content: 'Réponse', parent_id: 10, is_hidden: false, user_id: 2, user_first_name: 'Marie', user_last_name: 'Martin' },
                ],
            });
        const req = { params: { id: '1' }, user: undefined };
        const res = mockRes();
        await commentController.list(req, res);
        const call = res.json.mock.calls[0][0];
        expect(call.comments).toHaveLength(1);
        expect(call.comments[0].replies).toHaveLength(1);
        expect(call.comments[0].replies[0].content).toBe('Réponse');
    });
});

describe('create', () => {
    it('400 si content manquant', async () => {
        const req = { params: { id: '1' }, body: {}, user: { id: 1 } };
        const res = mockRes();
        await commentController.create(req, res);
        expect(res.status).toHaveBeenCalledWith(400);
    });

    it('400 si content vide', async () => {
        const req = { params: { id: '1' }, body: { content: '   ' }, user: { id: 1 } };
        const res = mockRes();
        await commentController.create(req, res);
        expect(res.status).toHaveBeenCalledWith(400);
    });

    it('404 si ressource non validée', async () => {
        db.query.mockResolvedValueOnce({ rows: [] });
        const req = { params: { id: '99' }, body: { content: 'Bonjour' }, user: { id: 1 } };
        const res = mockRes();
        await commentController.create(req, res);
        expect(res.status).toHaveBeenCalledWith(404);
    });

    it('201 si commentaire créé', async () => {
        const comment = { id: 1, content: 'Bonjour', created_at: '2025-01-01' };
        db.query
            .mockResolvedValueOnce({ rows: [{ id: 1 }] })
            .mockResolvedValueOnce({ rows: [comment] });
        const req = { params: { id: '1' }, body: { content: 'Bonjour' }, user: { id: 1 } };
        const res = mockRes();
        await commentController.create(req, res);
        expect(res.status).toHaveBeenCalledWith(201);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ comment }));
    });
});

describe('reply', () => {
    it('400 si content manquant', async () => {
        const req = { params: { id: '1', cid: '10' }, body: {}, user: { id: 1 } };
        const res = mockRes();
        await commentController.reply(req, res);
        expect(res.status).toHaveBeenCalledWith(400);
    });

    it('404 si ressource non validée', async () => {
        db.query.mockResolvedValueOnce({ rows: [] });
        const req = { params: { id: '99', cid: '10' }, body: { content: 'Réponse' }, user: { id: 1 } };
        const res = mockRes();
        await commentController.reply(req, res);
        expect(res.status).toHaveBeenCalledWith(404);
    });

    it('404 si commentaire parent introuvable', async () => {
        db.query
            .mockResolvedValueOnce({ rows: [{ id: 1 }] })
            .mockResolvedValueOnce({ rows: [] });
        const req = { params: { id: '1', cid: '99' }, body: { content: 'Réponse' }, user: { id: 1 } };
        const res = mockRes();
        await commentController.reply(req, res);
        expect(res.status).toHaveBeenCalledWith(404);
    });

    it('400 si le parent est déjà une réponse', async () => {
        db.query
            .mockResolvedValueOnce({ rows: [{ id: 1 }] })
            .mockResolvedValueOnce({ rows: [{ id: 10, parent_id: 5 }] });
        const req = { params: { id: '1', cid: '10' }, body: { content: 'Réponse' }, user: { id: 1 } };
        const res = mockRes();
        await commentController.reply(req, res);
        expect(res.status).toHaveBeenCalledWith(400);
    });

    it('201 si réponse postée', async () => {
        const reply = { id: 11, content: 'Réponse', parent_id: 10, created_at: '2025-01-01' };
        db.query
            .mockResolvedValueOnce({ rows: [{ id: 1 }] })
            .mockResolvedValueOnce({ rows: [{ id: 10, parent_id: null }] })
            .mockResolvedValueOnce({ rows: [reply] });
        const req = { params: { id: '1', cid: '10' }, body: { content: 'Réponse' }, user: { id: 1 } };
        const res = mockRes();
        await commentController.reply(req, res);
        expect(res.status).toHaveBeenCalledWith(201);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ comment: reply }));
    });
});

describe('remove', () => {
    it('404 si commentaire inexistant', async () => {
        db.query.mockResolvedValueOnce({ rows: [] });
        const req = { params: { commentId: '99' }, user: { id: 1, role: 'citizen' } };
        const res = mockRes();
        await commentController.remove(req, res);
        expect(res.status).toHaveBeenCalledWith(404);
    });

    it('403 si ni propriétaire ni modérateur', async () => {
        db.query.mockResolvedValueOnce({ rows: [{ id: 10, user_id: 5 }] });
        const req = { params: { commentId: '10' }, user: { id: 1, role: 'citizen' } };
        const res = mockRes();
        await commentController.remove(req, res);
        expect(res.status).toHaveBeenCalledWith(403);
    });

    it('supprime si propriétaire', async () => {
        db.query
            .mockResolvedValueOnce({ rows: [{ id: 10, user_id: 1 }] })
            .mockResolvedValueOnce({})
            .mockResolvedValueOnce({});
        const req = { params: { commentId: '10' }, user: { id: 1, role: 'citizen' } };
        const res = mockRes();
        await commentController.remove(req, res);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ status: true }));
    });

    it('supprime si modérateur', async () => {
        db.query
            .mockResolvedValueOnce({ rows: [{ id: 10, user_id: 5 }] })
            .mockResolvedValueOnce({})
            .mockResolvedValueOnce({});
        const req = { params: { commentId: '10' }, user: { id: 1, role: 'moderator' } };
        const res = mockRes();
        await commentController.remove(req, res);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ status: true }));
    });

    it('supprime les réponses enfants puis le commentaire', async () => {
        db.query
            .mockResolvedValueOnce({ rows: [{ id: 10, user_id: 1 }] })
            .mockResolvedValueOnce({})
            .mockResolvedValueOnce({});
        const req = { params: { commentId: '10' }, user: { id: 1, role: 'citizen' } };
        const res = mockRes();
        await commentController.remove(req, res);
        expect(db.query.mock.calls[1][0]).toContain('DELETE FROM comments WHERE parent_id');
        expect(db.query.mock.calls[2][0]).toContain('DELETE FROM comments WHERE id');
    });
});

describe('moderate', () => {
    it('404 si commentaire inexistant', async () => {
        db.query.mockResolvedValueOnce({ rows: [] });
        const req = { params: { id: '99' } };
        const res = mockRes();
        await commentController.moderate(req, res);
        expect(res.status).toHaveBeenCalledWith(404);
    });

    it('masque le commentaire', async () => {
        db.query
            .mockResolvedValueOnce({ rows: [{ id: 10 }] })
            .mockResolvedValueOnce({});
        const req = { params: { id: '10' } };
        const res = mockRes();
        await commentController.moderate(req, res);
        expect(db.query).toHaveBeenCalledWith(expect.stringContaining('is_hidden = true'), ['10']);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ status: true }));
    });
});
