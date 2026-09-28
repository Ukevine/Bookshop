export default (srv) => {

    srv.before('READ', 'Books', async (req) => {
        console.log(' BOOK QUERY RECEIVED ');
        console.log('Time:', new Date().toISOString());
        console.log('Service: CatalogService (/browse)');
        console.log('Entity: Books');
    });

    srv.after('READ', 'Books', async (books, req) => {
        const bookArray = Array.isArray(books) ? books : [books];
        
        bookArray.forEach(book => {
            if (book.stock > 100) {
                book.title += ' [BULK DISCOUNT AVAILABLE]';
                console.log('Added discount badge to:', book.title);
            }
            if (book.stock > 0 && book.stock <= 5) {
                book.title += ' [LOW STOCK - ORDER SOON]';
                console.log('Added low stock warning to:', book.title);
            }
            if (book.stock === 0) {
                book.title += ' [OUT OF STOCK]';
                console.log('Marked as out of stock:', book.title);
            }
        });
        
        console.log('Enhanced', bookArray.length, 'book(s)');
    });

};