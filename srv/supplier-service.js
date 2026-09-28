import connectivity from '@sap-cloud-sdk/connectivity';

const { getDestination, executeHttpRequest } = connectivity;
import { readFileSync } from 'node:fs';

const CSV = new URL('./external/data/API_BUSINESS_PARTNER-A_Supplier.csv', import.meta.url);

function loadSuppliers() {
    const [header, ...rows] = readFileSync(CSV, 'utf8').trim().split(/\r?\n/);
    const cols = header.split(',');
    return rows.map(r => Object.fromEntries(cols.map((c, i) => [c, r.split(',')[i]])));
}

const MODE = () => {
    if (process.env.MOCK_EXTERNAL === 'true') return 'MOCK';
    if (process.env.USE_PRINCIPAL_PROP === 'true') return 'PRINCIPAL_PROP';
    if (process.env.USE_DESTINATION === 'true') return 'DESTINATION';
    return 'LIVE';
};

function applyQuery(data, query) {
    let result = [...data];

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
        const mode = MODE();
        console.log(`[${mode}] Supplier request`);
        
        if (mode === 'MOCK') {
            return applyQuery(mockSuppliers, req.query.SELECT || {});
        }
        if (mode === 'PRINCIPAL_PROP') {
            try {
                const userJwt = req.http?.req?.headers?.authorization;

                if (!userJwt) {
                    req.error(401, 'No user token available');
                    return;
                }

                console.log('Calling destination with user propagation...');

                const dest = await getDestination({
                    destinationName: 'S4HANA_PRINCIPAL_PROP',
                    jwt: userJwt                           
                });

                if (!dest) {
                    req.error(500, 'Destination not configured');
                    return;
                }
                const response = await executeHttpRequest(dest, {
                    method: 'GET',
                    url: '/A_Supplier?$top=10'
                });

                const suppliers = response.data.d?.results || response.data.value || [];
                return suppliers;

            } catch (err) {
                console.error('Principal Propagation failed:', err.message);
                req.error(503, `Backend call failed: ${err.message}`);
                return;
            }
        }

        if (mode === 'DESTINATION') {
            try {
                const dest = await getDestination({ destinationName: 'S4HANA_BUSINESS_PARTNER' });
                if (!dest) { req.error(500, 'Destination not found'); return; }

                const response = await fetch(`${dest.url}/A_Supplier?$top=10`, {
                    headers: { 'Accept': 'application/json' }
                });

                const data = await response.json();
                return data.d?.results || data.value || [];
            } catch (err) {
                req.error(503, `Destination error: ${err.message}`);
                return;
            }
        }

        try {
            const external = await cds.connect.to('API_BUSINESS_PARTNER');
            return await external.run(req.query);
        } catch (err) {
            req.error(503, 'Supplier service unavailable');
        }
    });
};