module.exports = {
  projects: [
    {
      displayName: "UNIT Testing",
      testMatch: ["**/test/**/*.spec.js"],
      setupFiles: ["./test/setup.js"]
    },
    {
      displayName: "E2E Testing",
      testMatch: ["**/test/e2e/**/*.test.js"]
    }
  ]
};