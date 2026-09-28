export default (srv) => {

    srv.before('CREATE', 'OrderItems', async (req) => {
        const { book_ID, quantity } = req.data;

        const book = await SELECT.one.from('sap.capire.bookshop.Books')
            .where({ ID: book_ID });

        const error = validateBookOrder(book, quantity);
         if (error) {
            req.error(error.code, error.message);
            return;
        }

        console.log(`Stock check PASSED for "${book.title}"`);
    });

    srv.after('CREATE', 'OrderItems', async (data, req) => {
        const { book_ID, quantity } = req.data;

        if (!book_ID || !quantity) {
            console.log('Missing book_ID or quantity in req.data!');
            return;
        }

        await UPDATE('sap.capire.bookshop.Books')
            .set({ stock: { '-=': quantity } })
            .where({ ID: book_ID });

        const book = await SELECT.one.from('sap.capire.bookshop.Books')
            .where({ ID: book_ID });

        if (book) {
            console.log(`Stock decreased for "${book.title}". New stock: ${book.stock}`);
        }
    });

    srv.on('cancelOrder', 'Orders', async (req) => {
        const orderID = req.params[0]?.ID || req.params.ID;

        const order = await SELECT.one.from('sap.capire.bookshop.Orders')
            .where({ ID: orderID });

        if (!order) {
            req.error(404, `Order ${orderID} not found`);
            return;
        }

        if (order.status === 'CANCELLED') {
            req.error(409, `Order ${orderID} is already cancelled`);
            return;
        }

        const orderItems = await SELECT.from('sap.capire.bookshop.OrderItems')
            .where({ order_ID: orderID });

        console.log(`Cancelling order for ${order.customerName} — restoring ${orderItems.length} item(s)`);

        for (const item of orderItems) {
            await UPDATE('sap.capire.bookshop.Books')
                .set({ stock: { '+=': item.quantity } })
                .where({ ID: item.book_ID });

            console.log(`Restored ${item.quantity} copies of book ${item.book_ID}`);
        }

        await UPDATE('sap.capire.bookshop.Orders')
            .set({ status: 'CANCELLED' })
            .where({ ID: orderID });

        return `Order ${orderID} cancelled. ${orderItems.length} item(s) restored.`;
    });

    srv.on('getStockLevel', async (req) => {
        const { bookID } = req.data;

        const book = await SELECT.one.from('sap.capire.bookshop.Books')
            .columns('stock')
            .where({ ID: bookID });

        if (!book) {
            req.error(404, `Book ${bookID} not found`);
            return;
        }

        return book.stock;
    });

    srv.on('processOrder', async (req) => {
        const { bookID, quantity, customerID } = req.data;

        console.log(`Processing order: ${quantity}x book ${bookID} for customer ${customerID}`);

        try {
            const result = await srv.tx(async (tx) => {

                // 1. Fetch the book
                const book = await tx.run(
                    SELECT.one.from('Books').where({ ID: bookID })
                );

                if (!book) {
                    throw new Error(`Book ${bookID} not found`);
                }

                if (book.stock === 0) {
                    throw new Error(`"${book.title}" is OUT OF STOCK`);
                }

                if (book.stock < quantity) {
                    throw new Error(`Only ${book.stock} copies of "${book.title}" available`);
                }

                // 2. Fetch the customer
                const customer = await tx.run(
                    SELECT.one.from('Customers').where({ ID: customerID })
                );

                if (!customer) {
                    throw new Error(`Customer ${customerID} not found`);
                }

                // 3. Budget check
                const totalCost = book.price * quantity;
                const remaining = customer.budget - customer.spent;

                console.log(`Total cost: ${totalCost} | Remaining budget: ${remaining}`);

                if (totalCost > remaining) {
                    throw new Error(
                        `Insufficient budget. Remaining: ${remaining}, required: ${totalCost}`
                    );
                }

                // 4. Decrease stock
                await tx.run(
                    UPDATE('Books')
                        .set({ stock: { '-=': quantity } })
                        .where({ ID: bookID })
                );

                // 5. Update customer spent
                await tx.run(
                    UPDATE('Customers')
                        .set({ spent: { '+=': totalCost } })
                        .where({ ID: customerID })
                );

                // 6. Create the order
                const order = await tx.run(
                    INSERT.into('Orders').entries({
                        customerName: customer.name,
                        orderDate: new Date(),
                        status: 'CONFIRMED'
                    })
                );

                // 7. Create the order item
                await tx.run(
                    INSERT.into('OrderItems').entries({
                        order_ID: order.ID,
                        book_ID: bookID,
                        quantity: quantity,
                        unitPrice: book.price
                    })
                );

                // 8. Write to PurchaseLogs
                await tx.run(
                    INSERT.into('PurchaseLogs').entries({
                        order_ID: order.ID,
                        customerName: customer.name,
                        bookTitle: book.title,
                        quantity: quantity,
                        totalCost: totalCost,
                        logDate: new Date(),
                        message: `Order ${order.ID} confirmed: ${quantity}x "${book.title}" for ${customer.name}`
                    })
                );

                console.log(`Order ${order.ID} processed successfully`);
                return { order, book, totalCost };
            });

            return `Order ${result.order.ID} confirmed. ${quantity}x "${result.book.title}" for ${result.totalCost}.`;

        } catch (error) {
            console.log(`Order failed: ${error.message}`);
            req.error(400, error.message);
        }
    });
    srv.on('restock', 'Books', async (req) => {
        const bookID = req.params[0]?.ID || req.params.ID;
        const { amount } = req.data;

        console.log(`Restocking book ${bookID} with ${amount} copies`);

        if (!amount || amount <= 0) {
            req.error(400, 'Amount must be greater than 0');
            return;
        }

        await UPDATE('sap.capire.bookshop.Books')
            .set({ stock: { '+=': amount } })
            .where({ ID: bookID });

        const book = await SELECT.one.from('sap.capire.bookshop.Books')
            .where({ ID: bookID });

        if (!book) {
            req.error(404, `Book ${bookID} not found`);
            return;
        }

        return book.stock;
    });

};