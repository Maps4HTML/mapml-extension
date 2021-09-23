module.exports = {
  projects: [
    {
      displayName: "UNIT Testing",
      testMatch: ["**/test/**/*.spec.js"],
      setupFiles: ["./test/setup.js"]
    },
    {
      displayName: "E2E Testing",
      globals: {
        PATH: "http://localhost:3000/",
        ISHEADLESS: true
      },
      testMatch: ["**/test/e2e/**/*.test.js"]
    }
  ]
};