module.exports = {
  testEnvironment: 'node',
  collectCoverage: true,
  coverageDirectory: 'coverage',
  collectCoverageFrom: [
    'src/controllers/**/*.js',
    'src/middlewares/**/*.js',
    'src/routes/**/*.js',
  ],
  verbose: true,
};
