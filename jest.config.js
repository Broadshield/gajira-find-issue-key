// jest.config.js
// require('nock').disableNetConnect()

module.exports = {
  clearMocks: true,
  moduleFileExtensions: ['js', 'ts'],
  testEnvironment: 'node',
  testMatch: ['**/*.test.js'],
  testRunner: 'jest-circus/runner',
  reporters: ['default', 'jest-junit'],
  verbose: true,
  setupFiles: ['dotenv/config'],
  bail: false,
}
