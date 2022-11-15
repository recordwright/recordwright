const RecordManager = require('../../../controller/record-manager')
const RecordWrightBackend = require('../../support/recordwright-backend')
const assert = require('assert')
const Locator = require('../../sample-project/recordwright-locator')
const fs = require('fs')
describe('Resource Manager - logCurrentElement', () => {
    let recordwrightBackend = new RecordWrightBackend()
    let recordManager = new RecordManager({})
    before(async function () {
        await recordwrightBackend.launchApp()
        this.timeout(60000)

    })
    afterEach(async function () {
        await recordManager.browserControl.closeAllInstances()
        this.timeout(60000)
    })
    after(async function () {
        if (recordManager.browserControl)
            await recordwrightBackend.closeApp()
        this.timeout(60000)
    })

    it('should log element with predefined locator', async () => {
        // await recordManager.start({ headless: true })
        // await recordManager.browserControl._activePage.goto('https://todomvc.com/examples/vue/')
        // await recordManager.waitForInit()
        // await waitTillScreenshotEqualToCount(recordManager, 1)
        // if (!recordManager.browserControl.activeSnapshotWorker.records[0].path.includes('.jpeg')) {
        //     assert.fail('Output file is not a picture')
        // }
        // await new Promise(resolve => setTimeout(resolve, 100))
        // try {
        //     fs.accessSync(recordManager.browserControl.activeSnapshotWorker.records[0].path)
        // } catch (error) {
        //     assert.fail('Unable to create screenshot correctly in the disk')
        // }

    }).timeout(10000)

})