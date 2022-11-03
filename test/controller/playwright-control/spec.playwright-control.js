let BrowserManager = require('../../../controller/browser-control')

describe('record wright tester', () => {
    it('should launch chrome instance correctly', async () => {
        let playwrightControl = new BrowserManager()
        playwrightControl.createBrowserContext()
        await playwrightControl.waitForInit()
        console.log()
    }).timeout(99999999999)
})