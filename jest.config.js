module.exports = {
  testTimeout: 30000,
  projects: [
    {
      displayName: "UNIT Testing",
      testMatch: ["**/test/**/*.spec.js"],
      setupFiles: ["./test/setup.js"]
    },
    {
      displayName: "E2E Testing",
      testMatch: ["**/test/e2e/**/*.test.js"],
      preset: "jest-playwright-preset",
      globals: {
        PATH: "http://localhost:30002/"
      }
    }
  ]
};
