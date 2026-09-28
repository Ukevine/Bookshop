import cds from '@sap/cds';

const test = cds.test('.');
test.defaults.auth = { username: 'alice', password: 'password' };

describe('SAVE-only Validation Rules', () => {

    beforeEach(async () => {
        try {
            await test.delete('/fiori/Books(ID=201,IsActiveEntity=false)');
        } catch (e) {}
        try {
            const allDrafts = await test.get('/fiori/Books?$filter=IsActiveEntity eq false');
            for (const draft of allDrafts.data.value) {
                await test.delete(`/fiori/Books(ID=${draft.ID},IsActiveEntity=false)`);
            }
        } catch (e) { }
    });

    afterEach(async () => {
        try {
            await test.delete('/fiori/Books(ID=201,IsActiveEntity=false)');
        } catch (e) { }
    });

    it('PATCH with rule-breaking data should PASS', async () => {
        await test.post('/fiori/Books(ID=201,IsActiveEntity=true)/draftEdit', {});

        const { status } = await test.patch(
            '/fiori/Books(ID=201,IsActiveEntity=false)',
            { stock: 0, price: 100 }
        );
        expect(status).toBe(200);
    });

    it('SAVE with rule-breaking data should FAIL', async () => {
        await test.post('/fiori/Books(ID=201,IsActiveEntity=true)/draftEdit', {});
        await test.patch(
            '/fiori/Books(ID=201,IsActiveEntity=false)',
            { stock: 0, price: 100 }
        );

        let errorCaught = false;
        try {
            await test.post('/fiori/Books(ID=201,IsActiveEntity=false)/draftActivate', {});
        } catch (err) {
            errorCaught = true;
            expect(err.response.status).toBe(400);
            expect(err.response.data.error.message).toContain('cannot cost more than $50');
        }

        expect(errorCaught).toBe(true);
    });

    it('SAVE fails if title is empty', async () => {
        await test.post('/fiori/Books(ID=201,IsActiveEntity=true)/draftEdit', {});
        await test.patch('/fiori/Books(ID=201,IsActiveEntity=false)', { title: '' });

        let errorCaught = false;
        try {
            await test.post('/fiori/Books(ID=201,IsActiveEntity=false)/draftActivate', {});
        } catch (err) {
            errorCaught = true;
            expect(err.response.status).toBe(400);
            const msg = err.response.data.error.message;
            expect(msg === 'Title is required' || msg === 'Provide the missing value.').toBe(true);
        }
        expect(errorCaught).toBe(true);
    });

    it('SAVE succeeds when rule-breaking data is fixed', async () => {
        await test.post('/fiori/Books(ID=201,IsActiveEntity=true)/draftEdit', {});

        await test.patch(
            '/fiori/Books(ID=201,IsActiveEntity=false)',
            { stock: 0, price: 40 }
        );

        const { status } = await test.post(
            '/fiori/Books(ID=201,IsActiveEntity=false)/draftActivate',
            {}
        );

        expect(status).toBe(200);
    });

    it.skip('PATCH rejects negative stock (light validation)', async () => {
    });

});