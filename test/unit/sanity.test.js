describe('Jest Sanity Check', () => {
    it('should add 1 + 1 = 2', () => {
        expect(1 + 1).toBe(2);
    });

    it('should handle strings', () => {
        expect('hello').toContain('ell');
    });
});