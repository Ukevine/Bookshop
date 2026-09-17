import { readFileSync } from 'node:fs';

const CSV = new URL('./external/data/API_BUSINESS_PARTNER-A_Supplier.csv', import.meta.url);

function loadSuppliers() {
    const [header, ...rows] = readFileSync(CSV, 'utf8').trim().split(/\r?\n/);
    const cols = header.split(',');
    return rows.map(r => Object.fromEntries(cols.map((c, i) => [c, r.split(',')[i]])));
}

const isMock = () => process.env.MOCK_EXTERNAL === 'true' || !process.env.SAP_API_KEY;

// Apply OData query options to mock data
function applyQuery(data, query) {
    let result = [...data];

    // $select
    if (query.columns && !query.columns.includes('*')) {
        const fields = query.columns
            .map(c => (c.ref ? c.ref[c.ref.length - 1] : c))
            .filter(Boolean);
        if (fields.length > 0) {
            result = result.map(row =>
                Object.fromEntries(fields.map(f => [f, row[f]]))
            );
        }
    }

    // $orderBy
    if (query.orderBy) {
        const first = query.orderBy[0];
        const field = first.ref ? first.ref[first.ref.length - 1] : null;
        const dir = first.sort || 'asc';
        if (field) {
            result.sort((a, b) => {
                const av = a[field];
                const bv = b[field];
                if (av < bv) return dir === 'desc' ? 1 : -1;
                if (av > bv) return dir === 'desc' ? -1 : 1;
                return 0;
            });
        }
    }

    // $skip
    if (query.limit && query.limit.offset) {
        result = result.slice(query.limit.offset.val);
    }

    // $top
    if (query.limit && query.limit.rows) {
        result = result.slice(0, query.limit.rows.val);
    }

    return result;
}

export default (srv) => {
    const mockSuppliers = loadSuppliers();
    console.log(`Loaded ${mockSuppliers.length} suppliers from CSV`);

    srv.on('READ', 'Suppliers', async (req) => {
        if (isMock()) {
            console.log('[MOCK] Returning from CSV');
            return applyQuery(mockSuppliers, req.query.SELECT || {});
        }

        console.log('[LIVE] Calling API_BUSINESS_PARTNER...');
        try {
            const external = await cds.connect.to('API_BUSINESS_PARTNER');
            return await external.run(req.query);
        } catch (err) {
            console.error('Live call failed:', err.message);
            req.error(503, 'Supplier service unavailable');
        }
    });
};