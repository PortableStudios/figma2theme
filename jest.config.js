module.exports = {
  testEnvironment: 'node',
  testMatch: ['**/src/**/*.test.ts'],
  collectCoverageFrom: ['**/src/**/*.ts', '!**/utils/testing/*.ts'],
};
