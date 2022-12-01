const config = {
    launchOption: {
        headless: false,
        launchOptions: {
            args: [
                '--disable-web-security',
                '--disable-features=IsolateOrigins,site-per-process',
            ]
        }
    }
}
module.exports = config;

