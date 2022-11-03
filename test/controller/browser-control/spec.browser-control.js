let BrowserManager = require('../../../controller/browser-control')
const RecordWrightBackend = require('../../support/recordwright-backend')
const assert = require('assert')
describe('record wright tester', () => {
    let recordwrightBackend = new RecordWrightBackend()
    before(async function () {
        await recordwrightBackend.launchApp()
        this.timeout(60000)

    })
    after(async function () {
        await recordwrightBackend.closeApp()
        this.timeout(60000)
    })
    it('should launch chrome instance correctly', async () => {
        let playwrightControl = new BrowserManager()
        playwrightControl.createBrowserContext()
        await playwrightControl.waitForInit()
    })
    it('should inject script module correctly', async () => {
        let browserControl = new BrowserManager()
        browserControl.createBrowserContext()
        await browserControl.waitForInit()
        await browserControl.activePage.goto('https://playwright.dev/')
        let module = await browserControl.activePage.locator('//*[@id="recordwright-init-module"]')
        let moduleCount = await module.count()
        assert.equal(moduleCount, 1)
    })
})