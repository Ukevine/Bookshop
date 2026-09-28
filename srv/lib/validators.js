export function validateBookOrder(book, quantity) {
    if (!book) {
        return { code: 404, message: 'Book not found' };
    }

    if (book.stock === 0) {
        return {
            code: 409,
            message: `"${book.title}" is OUT OF STOCK! Cannot order.`
        };
    }

    if (book.stock < quantity) {
        return {
            code: 409,
            message: `Only ${book.stock} copies of "${book.title}" available. You requested ${quantity}.`
        };
    }

    return null;  // Valid
}

export function validateBookOnSave(book) {
    const errors = [];

    if (!book.title || book.title.trim() === '') {
        errors.push({ code: 400, message: 'Title is required', target: 'title' });
    }

    if (book.price < 1 || book.price > 111) {
        errors.push({ code: 400, message: 'Price must be between 1 and 111', target: 'price' });
    }

    if (book.stock < 0) {
        errors.push({ code: 400, message: 'Stock cannot be negative', target: 'stock' });
    }

    // Business rule
    if (book.stock === 0 && book.price > 50) {
        errors.push({
            code: 400,
            message: 'An out-of-stock book cannot cost more than $50',
            target: 'price'
        });
    }

    return errors;
}