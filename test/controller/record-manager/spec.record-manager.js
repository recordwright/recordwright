const RecordManager = require('../../../controller/record-manager')
const RecordWrightBackend = require('../../support/recordwright-backend')
const assert = require('assert')
const Locator = require('../../sample-project/recordwright-locator')
describe('Record Manager', () => {
    let recordwrightBackend = new RecordWrightBackend()
    before(async function () {
        await recordwrightBackend.launchApp()
        this.timeout(60000)

    })
    after(async function () {
        await recordwrightBackend.closeApp()
        this.timeout(60000)
    })
    it('it should expose function correctly', async () => {
        let recordManager = new RecordManager({})
        await recordManager.browserManager.createBrowserContext()
        await recordManager.browserManager.activePage.goto('https://playwright.dev/')
        let commandNameList = Object.keys(recordManager.browserManager.exposedFunc)
        for (const commandName of commandNameList) {
            let functionExists = await recordManager.browserManager.activePage.evaluate((commandName) => {
                return window[commandName] != null
            }, commandName)
            assert.equal(functionExists, true, `${commandName} is not exposed correctly`)
        }
        await new Promise(resolve => setTimeout(resolve, 99999999))
    }).timeout(99999999)
    it('should mark element with 1 potential match as green', async () => {
        let recordManager = new RecordManager({})
        await recordManager.browserManager.createBrowserContext({ headless: true })
        await recordManager.browserManager.activePage.goto('https://playwright.dev/')
        await recordManager.browserManager.__waitForPotentialMatchManagerPopoulated()
        let btnGetStarted = await recordManager.browserManager.activePage.locator(Locator['get started'].locator)
        await btnGetStarted.hover()
        let backgroundColor = await btnGetStarted.evaluate(item => {
            return item.style.backgroundColor
        })
        assert.equal(backgroundColor, 'rgba(0, 223, 145, 0.45)')
    }).timeout(5000)
    it('should mark element with no potential match as red', async () => {
        let recordManager = new RecordManager({})
        await recordManager.browserManager.createBrowserContext({ headless: true })
        await recordManager.browserManager.activePage.goto('https://playwright.dev/')
        await recordManager.browserManager.__waitForPotentialMatchManagerPopoulated()
        let btnGetStarted = await recordManager.browserManager.activePage.locator('//h1')
        await btnGetStarted.hover()
        let backgroundColor = await btnGetStarted.evaluate(item => {
            return item.style.backgroundColor
        })
        assert.equal(backgroundColor, 'rgba(255, 0, 145, 0.45)')

    }).timeout(5000)
})