const RecordManager = require('../../../controller/record-manager')
const RecordWrightBackend = require('../../support/recordwright-backend')
const assert = require('assert')
const Locator = require('../../sample-project/recordwright-locator')
describe('Snapshot Worker', () => {
    let recordwrightBackend = new RecordWrightBackend()
    before(async function () {
        await recordwrightBackend.launchApp()
        this.timeout(60000)

    })
    after(async function () {
        await recordwrightBackend.closeApp()
        this.timeout(60000)
    })
    it('it should screenshot correctly', async () => {
        let recordManager = new RecordManager({})
        await recordManager.start({ headless: true })
        await recordManager.browserControl._activePage.goto('https://todomvc.com/examples/vue/')

        // await new Promise(resolve => setTimeout(resolve, 99999999))
    }).timeout(99999999)
})