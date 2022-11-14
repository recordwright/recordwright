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
        await recordManager.start({ headless: false })
        await recordManager.browserControl._activePage.goto('https://todomvc.com/examples/vue/')
        let commandNameList = Object.keys(recordManager.funcDict)
        for (const commandName of commandNameList) {
            let functionExists = await recordManager.browserControl._activePage.evaluate((commandName) => {
                return window[commandName] != null
            }, commandName)
            assert.equal(functionExists, true, `${commandName} is not exposed correctly`)
        }
        await new Promise(resolve => setTimeout(resolve, 99999999))
    }).timeout(99999999)
})