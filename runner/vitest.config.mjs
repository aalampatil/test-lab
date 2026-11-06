const config = {
  root: '/submission',
  cacheDir: '/tmp/vitest-cache',
  test: {
    include: ['**/*.test.js'],
    environment: 'node',
    testTimeout: 2000,
    hookTimeout: 2000,
    isolate: true,
    pool: 'threads',
  },
  resolve: { alias: { vitest: '/runner/node_modules/vitest/dist/index.js' } },
};
export default config;
