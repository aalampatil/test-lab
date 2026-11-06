export default {
  test: {
    include: ['tests/**/*.test.{js,jsx}'],
    environment: 'node',
    coverage: { provider: 'v8', include: ['src/**/*.js', 'src/**/*.jsx'], reporter: ['text', 'html'] },
  },
};
