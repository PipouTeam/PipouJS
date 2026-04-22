const { defineConfig } = require('@playwright/test')

module.exports = defineConfig({
  testDir: '.',
  testMatch: '**/*.spec.js',
  timeout: 30000,
  retries: 0,
  reporter: process.env.CI
    ? [['html', { open: 'never' }], ['junit', { outputFile: './test-results/junit.xml' }]]
    : [['html', { open: 'never' }]],

  use: {
    headless: true,
    screenshot: 'only-on-failure',
    trace: 'on-first-retry',
  },

  projects: [
    {
      name: 'pipou-ressource',
      testDir: './pipou-ressource',
      use: {
        baseURL: process.env.APP_URL || 'http://localhost:3000',
      },
    },
    {
      name: 'backoffice',
      testDir: './backoffice',
      use: {
        baseURL: process.env.BACKOFFICE_URL || 'http://localhost:3002',
      },
    },
  ],
})
