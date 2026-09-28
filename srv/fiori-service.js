export default (srv) => {

    srv.before('PATCH', 'Books', async (req) => {
        console.log('PATCH called:', JSON.stringify(req.data));
        if (req.data.stock !== undefined && req.data.stock < 0) {
            req.error(400, 'Stock cannot be negative', 'stock');
        }
        if (req.data.title !== undefined && req.data.title.length > 200) {
            req.error(400, 'Title cannot exceed 200 characters', 'title');
        }
        if (req.data.price !== undefined &&
            (req.data.price < 0 || req.data.price > 1000)) {
            req.error(400, 'Price must be between 0 and 1000', 'price');
        }
    });

    srv.before('SAVE', 'Books', async (req) => {
        console.log('💾 SAVE called — full validation');

        const draft = req.data;

        if (!draft.title || draft.title.trim() === '') {
            req.error(400, 'Title is required', 'title');
        }

        if (draft.price < 1 || draft.price > 111) {
            req.error(400, 'Price must be between 1 and 111', 'price');
        }
        if (draft.stock < 0) {
            req.error(400, 'Stock cannot be negative', 'stock');
        }

        if (draft.stock === 0 && draft.price > 50) {
            req.error(400,
                'Out-of-stock books cannot cost more than $50',
                'price'
            );
        }

    });

    srv.after('SAVE', 'Books', async (data, req) => {
        console.log(`✅ Book ${data.ID} saved successfully`);
    });

    srv.before('NEW', 'Books', async (req) => {
        console.log('NEW draft requested');
        req.data.currency_code = 'USD';
        req.data.stock = 0;
        req.data.price = 1;
    });
    srv.before('CANCEL', 'Books', async (req) => {
        console.log('CANCEL requested for draft');
    });
};