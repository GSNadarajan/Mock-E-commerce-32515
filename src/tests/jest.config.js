module.exports = {\n  testEnvironment: 'node',\n  testMatch: ['**/tests/**/*.js'],\n  collectCoverage: true,\n  coverageDirectory: 'coverage',\n  coverageReporters: ['text', 'lcov'],\n  collectCoverageFrom: [\n    '**/products/**/*.js',\n    '**/orders/**/*.js',\n    '!**/node_modules/**',\n    '!**/tests/**'\n  ],\n  verbose: true\n};