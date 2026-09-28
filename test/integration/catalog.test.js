import cds from '@sap/cds';


const test = cds.test('.');

describe('Catalog Service — Basic', () => {
    it('GET /browse/Books returns a list', async () => {
        const { data, status } = await test.get('/browse/Books');
        expect(status).toBe(200);
        expect(data.value).toBeDefined();
        expect(Array.isArray(data.value)).toBe(true);
        expect(data.value.length).toBeGreaterThan(0);
    });

    it('GET /browse/Books(201) returns one book', async () => {
        const { data, status } = await test.get('/browse/Books(201)');
        expect(status).toBe(200);
        expect(data.ID).toBe(201);
        expect(data.title).toContain('Wuthering Heights');
    });
});