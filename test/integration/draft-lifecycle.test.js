import cds from '@sap/cds';

const test = cds.test('.');
test.defaults.auth = { username: 'alice', password: 'password' };

const ORIGINAL_STOCK_201 = 12;

describe('Draft Lifecycle — Books', () => {

    beforeEach(async () => {
        try {
            await test.delete('/fiori/Books(ID=201,IsActiveEntity=false)');
        } catch (e) { /* no draft */ }

        try {
            await test.patch('/admin/Books(201)', {
                stock: ORIGINAL_STOCK_201,
                price: 19.99
            });
        } catch (e) {
        }
    });

    it('POST /fiori/Books creates a new draft', async () => {
        const { data, status } = await test.post('/fiori/Books', {
            title: 'Draft Test Book',
            stock: 10,
            price: 25.99,
            author_ID: 101,
            genre_ID: 11
        });

        expect(status).toBe(201);
        expect(data.ID).toBeDefined();
        expect(data.IsActiveEntity).toBe(false);
        expect(data.title).toBe('Draft Test Book');
    });

    it('draftEdit creates a draft from active record', async () => {
        const { data, status } = await test.post(
            '/fiori/Books(ID=201,IsActiveEntity=true)/draftEdit',
            {}
        );
        expect(status).toBe(201);
        expect(data.ID).toBe(201);
        expect(data.IsActiveEntity).toBe(false);
        expect(data.title).toContain('Wuthering Heights');
    });

    it('PATCH updates a draft without affecting active record', async () => {
        await test.post('/fiori/Books(ID=201,IsActiveEntity=true)/draftEdit', {});

        const { status } = await test.patch(
            '/fiori/Books(ID=201,IsActiveEntity=false)',
            { stock: 99 }
        );
        expect(status).toBe(200);

        const draft = await test.get('/fiori/Books(ID=201,IsActiveEntity=false)');
        expect(draft.data.stock).toBe(99);
        const active = await test.get('/fiori/Books(ID=201,IsActiveEntity=true)');
        expect(active.data.stock).toBe(ORIGINAL_STOCK_201);
    });

    it('SAVE commits draft to active record', async () => {
        await test.post('/fiori/Books(ID=201,IsActiveEntity=true)/draftEdit', {});
        await test.patch(
            '/fiori/Books(ID=201,IsActiveEntity=false)',
            { stock: 50 }
        );

        const { status } = await test.post(
            '/fiori/Books(ID=201,IsActiveEntity=false)/draftActivate',
            {}
        );
        expect(status).toBe(200);

        const active = await test.get('/fiori/Books(ID=201,IsActiveEntity=true)');
        expect(active.data.stock).toBe(50);

    });

    it('DELETE discards a draft', async () => {
        await test.post('/fiori/Books(ID=201,IsActiveEntity=true)/draftEdit', {});
        await test.patch(
            '/fiori/Books(ID=201,IsActiveEntity=false)',
            { stock: 999 }
        );

        const { status } = await test.delete(
            '/fiori/Books(ID=201,IsActiveEntity=false)'
        );
        expect(status).toBe(204);

        const active = await test.get('/fiori/Books(ID=201,IsActiveEntity=true)');
        expect(active.data.stock).toBe(ORIGINAL_STOCK_201);
    });

});