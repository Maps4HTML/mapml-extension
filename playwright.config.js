const config = {
    timeout: 30000,
    testDir: './test',
    webServer: {
        command: 'node test/server.js',
        port: 30002,
        timeout: 10000,
    },
    use: {
        headless: false,
        browserName: 'chromium',
        baseURL: 'http://localhost:30002/',
        launchOptions: {
            args: [
                `--disable-extensions-except=${__dirname + '/src'}`,
                `--load-extension=${__dirname + '/src'}`
            ]
        },
    },
};
module.exports = config;