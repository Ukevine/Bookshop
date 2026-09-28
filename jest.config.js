export default {
    testEnvironment: 'node',
    testMatch: [
        '**/test/**/*.test.js',
        '**/test/**/*.test.cjs'
    ],
    testTimeout: 60000,
    collectCoverageFrom: [
        'srv/**/*.js',
        'srv/**/*.cjs',
        '!srv/**/*.test.js',
        '!srv/**/*.test.cjs',
        '!srv/external/**',
        '!srv/lib/**' 
    ],
    coverageDirectory: 'test/coverage',
    coverageReporters: ['text', 'html', 'lcov'],
    coverageThreshold: {
        global: {
            branches: 30,
            functions: 30,
            lines: 30,
            statements: 30
        }
    },
    verbose: true,
    forceExit: true,
    detectOpenHandles: true,

};