module.exports = {
  ci: {
    collect: {
      startServerCommand: 'php artisan serve',
      url: ['http://localhost:8000'],
      numberOfRuns: 3,
    },
    assert: {
      assertions: {
        'categories:performance': ['error', {minScore: 0.9}],
        'categories:accessibility': ['error', {minScore: 0.9}],
        'categories:best-practices': ['error', {minScore: 0.9}],
        'categories:seo': ['error', {minScore: 0.9}],
        'first-contentful-paint': ['error', {maxNumericValue: 2000}],
        'interactive': ['error', {maxNumericValue: 3500}],
        'speed-index': ['error', {maxNumericValue: 3000}],
      },
    },
    upload: {
      target: 'temporary-public-storage',
    },
  },
}; 