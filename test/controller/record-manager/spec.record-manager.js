const RecordManager = require('../../../controller/record-manager')
const RecordWrightBackend = require('../../support/recordwright-backend')
const assert = require('assert')
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
})