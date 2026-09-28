import { validateBookOrder, validateBookOnSave } from '../../srv/lib/validators.js';

describe('validateBookOrder', () => {

    it('should return null for a valid order', () => {
        const book = { stock: 12, title: 'Wuthering Heights' };
        const result = validateBookOrder(book, 2);
        expect(result).toBeNull();
    });

    it('should return 404 error if book does not exist', () => {
        const result = validateBookOrder(null, 2);
        expect(result).toEqual({
            code: 404,
            message: 'Book not found'
        });
    });

    it('should return 409 error if stock is zero', () => {
        const book = { stock: 0, title: 'Pride and Prejudice' };
        const result = validateBookOrder(book, 1);
        expect(result).toEqual({
            code: 409,
            message: '"Pride and Prejudice" is OUT OF STOCK! Cannot order.'
        });
    });

    it('should return 409 error if quantity exceeds stock', () => {
        const book = { stock: 5, title: 'Jane Eyre' };
        const result = validateBookOrder(book, 10);
        expect(result).toEqual({
            code: 409,
            message: 'Only 5 copies of "Jane Eyre" available. You requested 10.'
        });
    });

    it('should allow ordering exactly the available stock', () => {
        const book = { stock: 5, title: 'Jane Eyre' };
        const result = validateBookOrder(book, 5);
        expect(result).toBeNull();
    });

});

describe('validateBookOnSave', () => {

    it('should return no errors for a valid book', () => {
        const book = { title: 'The Raven', price: 15.99, stock: 10 };
        const errors = validateBookOnSave(book);
        expect(errors).toEqual([]);
    });

    it('should return error if title is missing', () => {
        const book = { title: '', price: 15.99, stock: 10 };
        const errors = validateBookOnSave(book);
        expect(errors.length).toBe(1);
        expect(errors[0].message).toBe('Title is required');
        expect(errors[0].target).toBe('title');
    });

    it('should return error if price is out of range', () => {
        const book = { title: 'Test', price: 999, stock: 10 };
        const errors = validateBookOnSave(book);
        expect(errors.length).toBe(1);
        expect(errors[0].message).toBe('Price must be between 1 and 111');
    });

    it('should return error if stock is negative', () => {
        const book = { title: 'Test', price: 10, stock: -5 };
        const errors = validateBookOnSave(book);
        expect(errors.length).toBe(1);
        expect(errors[0].message).toBe('Stock cannot be negative');
    });

    it('should return business rule error for out-of-stock expensive book', () => {
        const book = { title: 'Test', price: 100, stock: 0 };
        const errors = validateBookOnSave(book);
        expect(errors.length).toBe(1);
        expect(errors[0].message).toBe('An out-of-stock book cannot cost more than $50');
        expect(errors[0].target).toBe('price');
    });

    it('should collect multiple errors', () => {
        const book = { title: '', price: 999, stock: -1 };
        const errors = validateBookOnSave(book);
        expect(errors.length).toBe(3);
    });

});