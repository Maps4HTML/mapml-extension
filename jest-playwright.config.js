const path = require("path");

function generateConfig() {
  let pathToExtension = path.join(__dirname, 'src');
  return {
    serverOptions: {
      command: 'node test/server.js',
      port: 30002,
      launchTimeout: 10000,
    },
    browsers: ["chromium"],
    exitOnPageError: false, // GitHub currently throws errors
    launchType: "PERSISTENT",
    userDataDir: "",
    launchOptions: {
      headless: false,
      args: [
        `--disable-extensions-except=${pathToExtension}`,
        `--load-extension=${pathToExtension}`
      ]
    },
  };
}

module.exports = generateConfig();
